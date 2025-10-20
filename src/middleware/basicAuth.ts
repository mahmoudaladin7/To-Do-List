import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/client";
import bcrypt from "bcrypt";

export async function basicAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const hdr = req.headers.authorization || "";

    // 1) Require "Basic ..." header
    if (!hdr.startsWith("Basic ")) {
      res.setHeader("WWW-Authenticate", 'Basic realm="todo-api"');
      return res.status(401).json({ error: "Authentication required" });
    }

    // 2) Decode base64("email:password")
    const decoded = Buffer.from(hdr.slice(6), "base64").toString("utf8");
    const sep = decoded.indexOf(":");
    if (sep === -1) {
      return res.status(401).json({ error: "Invalid Authorization header" });
    }
    const email = decoded.slice(0, sep).trim().toLowerCase();
    const password = decoded.slice(sep + 1);

    // 3) Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4) Verify password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 5) Attach safe user info
    (req as any).user = { id: user.id, email: user.email };

    return next();
  } catch (err) {
    return next(err);
  }
}
