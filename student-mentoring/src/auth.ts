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
      console.error("Missing credentials");
      throw new Error("Missing credentials");
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    console.log("=== Login Attempt ===");
    console.log("Role:", role);
    console.log("User ID:", userid);
    console.log("API Base URL:", API_BASE_URL);

    if (role === "student") {
      const url = `${API_BASE_URL}/students/login`;
      console.log("Calling URL:", url);
      
      const res = await fetch(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ srNo: userid, password }),
        }
      );
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Login failed" }));
        console.error("Student login failed:", errorData);
        throw new Error(errorData.message || "Invalid student credentials");
      }
      
      const stud = await res.json();
      console.log("Student login successful:", stud.name);
      return { ...stud, role: "student", userid: stud.srNo, id: stud._id };
      
    } else if (role === "mentor") {
      const url = `${API_BASE_URL}/mentors/login`;
      console.log("Calling URL:", url);
      
      const res = await fetch(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empId: userid, password }),
        }
      );
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Login failed" }));
        console.error("Mentor login failed:", errorData);
        throw new Error(errorData.message || "Invalid mentor credentials");
      }
      
      const mentor = await res.json();
      console.log("Mentor login successful:", mentor.name);
      return {
        ...mentor,
        role: "mentor",
        userid: mentor.empId,
        id: mentor._id,
      };
      
    } else if (role === "admin") {
      // ✅ Static admin login
      if (userid === "admin123" && password === "secretpass") {
        return {
          userid: "admin123",
          role: "admin",
          id: "admin-id",
          name: "Administrator",
        };
      } else {
        throw new Error("Invalid admin credentials");
      }
    }
  } catch (e) {
    console.error("getUserFromDb error:", e);
    throw e;
  }

  throw new Error("Invalid credentials");
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
