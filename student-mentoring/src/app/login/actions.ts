"use server";

import { signIn } from "@/auth";

export async function signin(data: {
  role: string;
  userid: string;
  password: string;
}) {
  await signIn("credentials", data);
}
