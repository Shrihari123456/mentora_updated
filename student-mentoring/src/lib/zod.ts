import { z } from "zod";

export const authPayload = z.object({
  role: z.enum(["mentor", "student"]),
  userid: z.string(),
  password: z.string().min(6),
});
