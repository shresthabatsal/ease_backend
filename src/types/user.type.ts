import { z } from "zod";

export const UserSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.email("Invalid email address."),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export type UserType = z.infer<typeof UserSchema>;