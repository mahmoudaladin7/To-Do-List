import { prisma } from "../../db/client";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "./task.schema";

export async function createTask(userId: string, input: CreateTaskInput) {
  const { title, description, status, dueDate } = input;

  const parsedDueDate =
    typeof dueDate === "string" ? new Date(dueDate) : null;

  const task = await prisma.task.create({
    data: {
      userId,
      title,
      description: description ?? null,
      status: status ?? "pending",
      dueDate: parsedDueDate,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      status: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return task;
}

export async function listTasks(userId: string, query: ListTasksQuery) {
  const {
    status,
    search,
    sort = "created_at",
    order = "desc",
    page = 1,
    limit: rawLimit = 20,
  } = query;

  // avoid someone asking for too many rows
  const limit = Math.min(Math.max(rawLimit, 1), 100);
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (status) {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" as const } },
      { description: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const sortMap: Record<string, any> = {
    created_at: { createdAt: order },
    due_date: { dueDate: order },
    status: { status: order },
  };
  const orderBy = sortMap[sort] ?? { createdAt: "desc" };

  const [data, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data,
    meta: { page, limit, total, totalPages },
  };
}

export async function getTaskById(userId: string, taskId: string) {
  // Use findFirst with both id and userId to enforce ownership
  return prisma.task.findFirst({
    where: { id: taskId, userId },
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      status: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  // check ownership and existence
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  });
  if (!existing) {
    const err = new Error("Task not found");
    (err as any).code = "NOT_FOUND";
    throw err;
  }

  const data: any = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;
  if (input.dueDate !== undefined) {
    data.dueDate =
      typeof input.dueDate === "string" ? new Date(input.dueDate) : null;
  }
  const updated = await prisma.task.update({
    where: { id: taskId },
    data,
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      status: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function deleteTask(userId: string, taskId: string) {
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true },
  });
  if (!existing) {
    const err = new Error("Task not found");
    (err as any).code = "NOT_FOUND";
    throw err;
  }

  await prisma.task.delete({ where: { id: taskId } });
}
