import { z } from "zod";
export const registerSchema = z.object({
  email: z.email("Invalid Email"),
  password: z.string().min(8, "Password must be atleast 8 charecters"),
});
