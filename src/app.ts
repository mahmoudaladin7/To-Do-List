// Purpose: set up the Express app (middlewares + routes).
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { prisma } from "./db/client";

export const app = express();

// Parses application/json bodies into req.body
app.use(express.json());

// Sets secure HTTP headers (helps mitigate common attacks)
app.use(helmet());

// Logs each request (method, URL, status, time)
app.use(morgan("dev"));

// a tiny liveness probe
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Quick DB check: runs a simple SQL to fetch current time
app.get("/db-check", async (_req, res, next) => {
  try {
    // $queryRaw is for raw SQL (tagged template keeps it safe from injection)
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    res.json({ db: "ok", now: result[0]?.now });
  } catch (err) {
    next(err);
  }
});
