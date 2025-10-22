import request from "supertest";
import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { app } from "../../src/app";
import { prisma } from "../../src/db/client";
import { migrateTestDb, truncateAll } from "./helpers/db";
import { seedUser, basicAuthHeader } from "./helpers/app";

beforeAll(() => {
  migrateTestDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await truncateAll(prisma);
});

describe("Tasks API", () => {
  it("requires auth on all task routes", async () => {
    const res = await request(app).get("/api/v1/tasks");
    expect(res.status).toBe(401);
  });

  it("creates and lists tasks for the logged in user", async () => {
    const { email, password } = await seedUser();

    // Create a task
    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", basicAuthHeader(email, password))
      .send({
        title: "Buy milk",
        description: "2% organic",
        status: "pending",
      });

    expect(createRes.status).toBe(201);
    const taskId = createRes.body.task.id;

    // List tasks
    const listRes = await request(app)
      .get(
        "/api/v1/tasks?status=pending&sort=created_at&order=desc&page=1&limit=10"
      )
      .set("Authorization", basicAuthHeader(email, password));

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].id).toBe(taskId);
  });

  it("prevents accessing another user's task", async () => {
    const a = await seedUser("a@test.com", "Passw0rd!");
    const b = await seedUser("b@test.com", "Passw0rd!");

    // A creates a task
    const created = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", basicAuthHeader(a.email, a.password))
      .send({ title: "A's task" });

    const taskId = created.body.task.id;

    // B tries to fetch A's task
    const getRes = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set("Authorization", basicAuthHeader(b.email, b.password));

    expect(getRes.status).toBe(404); // hidden by ownership filter
  });

  it("updates and deletes a task", async () => {
    const { email, password } = await seedUser();

    const created = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", basicAuthHeader(email, password))
      .send({ title: "Initial" });

    const id = created.body.task.id;

    const patchRes = await request(app)
      .patch(`/api/v1/tasks/${id}`)
      .set("Authorization", basicAuthHeader(email, password))
      .send({ status: "in_progress", title: "Renamed" });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.task.status).toBe("in_progress");
    expect(patchRes.body.task.title).toBe("Renamed");

    const delRes = await request(app)
      .delete(`/api/v1/tasks/${id}`)
      .set("Authorization", basicAuthHeader(email, password));

    expect(delRes.status).toBe(204);
  });
});
