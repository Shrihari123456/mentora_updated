import NextAuth, { type DefaultSession } from "next-auth";
import "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// ✅ Updated schema to allow "admin"
export const authPayload = z.object({
  userid: z.string(),
  password: z.string(),
  role: z.enum(["student", "mentor", "admin"]),
});

declare module "next-auth" {
  interface User {
    userid: string;
    role: string;
    id?: string;
  }

  interface Session {
    user: {
      userid: string;
      role: string;
      id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userid: string;
    role: string;
    id: string;
  }
}

type AuthPayload = {
  userid: string;
  password: string;
  role: string;
};

// ✅ Unified login logic for all roles including "admin"
async function getUserFromDb({ userid, password, role }: AuthPayload) {
  try {
    if (!userid || !password || !role) {
      throw new Error("Missing credentials");
    }

    if (role === "student") {
      const res = await fetch(
        "https://student-mentoring-server.onrender.com/students/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ srNo: userid, password }),
        }
      );
      if (res.ok) {
        const stud = await res.json();
        return { ...stud, role: "student", userid: stud.srNo, id: stud._id };
      }
    } else if (role === "mentor") {
      const res = await fetch(
        "https://student-mentoring-server.onrender.com/mentors/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empId: userid, password }),
        }
      );
      if (res.ok) {
        const mentor = await res.json();
        return {
          ...mentor,
          role: "mentor",
          userid: mentor.empId,
          id: mentor._id,
        };
      }
    } else if (role === "admin") {
      // ✅ Static admin login
      if (userid === "admin123" && password === "secretpass") {
        return {
          userid: "admin123",
          role: "admin",
          id: "admin-id",
        };
      }
    }
  } catch (e) {
    console.error(e);
    throw new Error("Invalid credentials.");
  }

  return null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  providers: [
    Credentials({
      credentials: {
        userid: {},
        password: {},
        role: {},
      },
      authorize: async (credentials) => {
        try {
          if (!credentials) {
            throw new Error("No credentials provided");
          }

          const parsedCredentials = authPayload.safeParse(credentials);

          if (!parsedCredentials.success) {
            throw new Error("Invalid credentials format");
          }

          const user = await getUserFromDb(parsedCredentials.data);

          if (!user) {
            throw new Error("Invalid credentials.");
          }

          return user;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userid = user.userid;
        token.role = user.role;
        token.id = user.id || "";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.userid = token.userid;
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
});

// ✅ Middleware-compatible handler
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!req.auth) {
    if (pathname !== "/login") {
      return Response.redirect(new URL("/login", req.nextUrl.origin));
    }
    return;
  }

  if (pathname === "/login") {
    if (req.auth.user.role === "admin") {
      return Response.redirect(new URL("/admin/dashboard", req.nextUrl.origin));
    } else if (req.auth.user.role === "mentor") {
      return Response.redirect(new URL("/mentor", req.nextUrl.origin));
    } else {
      return Response.redirect(new URL("/student/dashboard", req.nextUrl.origin));
    }
  }

  if (pathname === "/") {
    if (req.auth.user.role === "admin") {
      return Response.redirect(new URL("/admin/dashboard", req.nextUrl.origin));
    } else if (req.auth.user.role === "mentor") {
      return Response.redirect(new URL("/mentor", req.nextUrl.origin));
    } else {
      return Response.redirect(new URL("/student/dashboard", req.nextUrl.origin));
    }
  }

  if (pathname.startsWith("/admin") && req.auth.user.role !== "admin") {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (pathname.startsWith("/mentor") && req.auth.user.role !== "mentor") {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (pathname.startsWith("/student") && req.auth.user.role !== "student") {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }
});

// ✅ Deprecated config removed — move to middleware.ts if needed
