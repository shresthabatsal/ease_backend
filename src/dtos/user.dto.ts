import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  password: true,
  role: true
}).extend({
  confirmPassword: z.string().min(6, "Confirm your password.")
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.email("Invalid email."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;