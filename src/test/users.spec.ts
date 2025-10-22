import request from "supertest";
import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { app } from "../app";
import { makePrisma, migrateTestDb, truncateAll } from "./helpers/db";

const prisma = makePrisma();

beforeAll(() => {
  // Ensure schema is applied on the TEST DB before any test runs
  migrateTestDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean slate for each test
  await truncateAll(prisma);
});

describe("POST /api/v1/users (registration)", () => {
  it("creates a user and returns 201", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .send({ email: "me@example.com", password: "SuperSecret123" })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("me@example.com");

    // DB assertion (defense-in-depth)
    const inDb = await prisma.user.findUnique({
      where: { email: "me@example.com" },
    });
    expect(inDb).not.toBeNull();
  });

  it("rejects duplicate email with 409", async () => {
    // Arrange: seed once
    await prisma.user.create({
      data: { email: "dup@x.com", passwordHash: "hash" },
    });

    const res = await request(app)
      .post("/api/v1/users")
      .send({ email: "dup@x.com", password: "whatever_123" });

    expect(res.status).toBe(409);
  });

  it("validates email + password", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .send({ email: "not-an-email", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});
