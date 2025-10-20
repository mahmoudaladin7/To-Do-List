import { Router } from "express";
import { registerUser } from "./users.controller";

export const userRouter = Router();
userRouter.post("/", registerUser);
