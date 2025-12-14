"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function signin(data: {
  role: string;
  userid: string;
  password: string;
}) {
  try {
    await signIn("credentials", {
      ...data,
      redirect: false,
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Authentication error:", error.type, error.message);
      
      switch (error.type) {
        case "CredentialsSignin":
          throw new Error("Invalid ID or password. Please check your credentials.");
        case "CallbackRouteError":
          throw new Error("Authentication failed. Please try again.");
        default:
          throw new Error("Something went wrong. Please try again later.");
      }
    }
    throw error;
  }
}

export async function signout() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/login" });
}
