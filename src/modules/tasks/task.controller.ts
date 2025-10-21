import { Request, Response, NextFunction } from "express";
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from "./task.schema";
import {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "./task.service";

/**
 * POST /api/v1/tasks
 * Body: { title, description?, status?, dueDate? }
 * Returns: 201 + created task
 */
export async function createTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Authenticated user injected by basicAuth middleware
    const user = (req as any).user as { id: string; email: string };
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const parsed = createTaskSchema.parse(req.body);
    const task = await createTask(user.id, parsed);
    return res.status(201).json({ task });
  } catch (err: any) {
    if (err?.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.issues });
    }
    return next(err);
  }
}

/**
 * GET /api/v1/tasks
 * Query: status?, search?, sort?, order?, page?, limit?
 * Returns: { data, meta }
 */
export async function listTasksHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user as { id: string; email: string };
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const parsed = listTasksQuerySchema.parse(req.query);
    const result = await listTasks(user.id, parsed);
    return res.json(result);
  } catch (err: any) {
    if (err?.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.issues });
    }
    return next(err);
  }
}

/**
 * GET /api/v1/tasks/:id
 */
export async function getTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user as { id: string; email: string };
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Task id is required" });
    }
    const task = await getTaskById(user.id, id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /api/v1/tasks/:id
 * Body: any subset of { title, description, status, dueDate }
 */
export async function updateTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user as { id: string; email: string };
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Task id is required" });
    }
    const parsed = updateTaskSchema.parse(req.body);

    const updated = await updateTask(user.id, id, parsed);
    return res.json({ task: updated });
  } catch (err: any) {
    if (err?.issues) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: err.issues });
    }
    if (err?.code === "NOT_FOUND") {
      return res.status(404).json({ error: "Task not found" });
    }
    return next(err);
  }
}

/**
 * DELETE /api/v1/tasks/:id
 * Returns: 204 No Content on success
 */
export async function deleteTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user as { id: string; email: string };
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Task id is required" });
    }
    await deleteTask(user.id, id);
    return res.status(204).send();
  } catch (err: any) {
    if (err?.code === "NOT_FOUND") {
      return res.status(404).json({ error: "Task not found" });
    }
    return next(err);
  }
}
