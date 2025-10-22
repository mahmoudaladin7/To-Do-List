import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Example: map known domain errors via `err.code`
  if (err?.code === "NOT_FOUND") {
    return res.status(404).json({ error: "Not found" });
  }

  // Prisma unique conflicts (e.g., duplicate email) → 409
  if (err?.code === "P2002") {
    return res
      .status(409)
      .json({ error: "Conflict", details: err?.meta?.target });
  }

  // Zod errors (validation) often have `issues` (we already catch locally, but safety net)
  if (err?.issues) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: err.issues });
  }

  // Fallback: 500
  console.error("[UNHANDLED ERROR]", err);
  return res.status(500).json({ error: "Internal Server Error" });
}
