import { execSync } from "child_process";
import dotenv from "dotenv";
import { PrismaClient } from "../../generated/prisma";

dotenv.config({ path: ".env.test" });

/**
 * Returns a Prisma client bound to the test database.
 * Creating a fresh instance avoids sharing mutable state between tests.
 */
export function makePrisma() {
  return new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  });
}

/**
 * Ensures the test database schema is up to date before running the suite.
 */
export function migrateTestDb() {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env },
  });
}

/**
 * Wipes relational data so each test starts from a clean slate.
 */
export async function truncateAll(prisma: PrismaClient) {
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
