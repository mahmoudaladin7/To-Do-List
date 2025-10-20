import { Request, Response, NextFunction } from "express";
import { registerSchema } from "./users.schema";
import { createUser } from "./users.services";

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //Validate input and Create User
    const parsed = registerSchema.parse(req.body);
    const user = await createUser(parsed.email, parsed.password);
    return res.status(201).json({ user });
  } catch (err: any) {
    if (err?.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.issues });
    }
    if (err?.code === "EMAIL_TAKEN") {
      return res.status(409).json({ error: "Email already registered" });
    }
    return next(err);
  }
}
