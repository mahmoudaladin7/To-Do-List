import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

/**
 * Runs Prisma migrations against the TEST DB before tests.
 * Why: Keep schema in sync; tests fail fast if migration breaks.
 */
export function migrateTestDb() {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DOTENV_CONFIG_PATH: ".env.test" },
  });
}

/**
 * Creates a fresh Prisma client bound to TEST DB.
 * Why: Use a clean client per test file if desired.
 */
export function makePrisma() {
  return new PrismaClient();
}

/**
 * Truncates all data between tests (simple approach).
 * Why: Keep tests isolated; order doesn’t matter.
 */
export async function truncateAll(prisma: PrismaClient) {
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
