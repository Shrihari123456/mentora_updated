import NextAuth, { type DefaultSession } from "next-auth";
import "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { authPayload } from "./lib/zod";

declare module "next-auth" {
  interface User {
    userid: string;
    role: string;
  }
  interface Session {
    user: {
      userid: string;
      role: string;
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

async function getUserFromDb({ userid, password, role }: AuthPayload) {
  try {
    if (role === "student") {
      const res = await fetch("http://localhost:8080/students/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ srNo: userid, password }),
      });
      if (res.ok) {
        const stud = await res.json();
        return { ...stud, role: "student", userid: stud.srNo, id: stud._id };
      }
    } else if (role === "mentor") {
      const res = await fetch("http://localhost:8080/mentors/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ empId: userid, password }),
      });
      if (res.ok) {
        const mentor = await res.json();
        return {
          ...mentor,
          role: "mentor",
          userid: mentor.empId,
          id: mentor._id,
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
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        userid: {},
        password: {},
        role: {},
      },
      authorize: async (credentials) => {
        let user = null;
        const creds = authPayload.safeParse(credentials);
        user = await getUserFromDb(creds.data!);

        if (!user) {
          throw new Error("Invalid credentials.");
        }
        return user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userid = user.userid;
        token.role = user.role;
        token.id = user.id ?? "";
      }
      return token;
    },
    session({ session, token }) {
      session.user.userid = token.userid;
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },
  },
});
