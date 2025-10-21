import { z } from "zod";

export const TaskStatusEnum = z.enum(["pending", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// Task Body Validator
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is Required"),
  description: z.string().optional(),
  status: TaskStatusEnum.optional(),
  dueDate: z.iso.datetime().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

//Update Task body validator
export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: TaskStatusEnum.optional(),
  dueDate: z.iso.datetime().nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

//List/filter query validator
export const listTasksQuerySchema = z.object({
  status: TaskStatusEnum.optional(),
  search: z.string().trim().optional(),
  sort: z.enum(["created_at", "due_date", "status"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).optional(),
});

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
