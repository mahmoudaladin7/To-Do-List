import dotenv from "dotenv";
dotenv.config({ path: ".env.test" }); // ensure TEST DB envs are loaded before importing app

import { app } from "../../app";
import { prisma } from "../../db/client";
import bcrypt from "bcrypt";

export { app };

/**
 * Creates a test user and returns { email, password, id }.
 * Why: Many tests need a logged-in user to call /api/v1/tasks.
 */
export async function seedUser(email = "u@test.com", password = "Passw0rd!") {
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash: hash },
  });
  return { id: user.id, email, password };
}

/**
 * Encodes HTTP Basic credentials into the Authorization header value.
 * @param email - user email (string)
 * @param password - plain password (string)
 * @returns e.g., "Basic dUB0ZXN0LmNvbTpQYXNzdzByZCE="
 */
export function basicAuthHeader(email: string, password: string) {
  const token = Buffer.from(`${email}:${password}`, "utf8").toString("base64");
  return `Basic ${token}`;
}
