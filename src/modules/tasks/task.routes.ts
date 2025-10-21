import { Router } from "express";
import { basicAuth } from "../../middleware/basicAuth";
import {
  createTaskHandler,
  listTasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from "./task.controller";

export const taskRouter = Router();
taskRouter.get("/__hello", (_req, res) => {
  res.json({ mountedWithoutAuth: true });
});

// All task routes require Basic Auth
taskRouter.use(basicAuth);

// Create
taskRouter.post("/", createTaskHandler);

// List with filters
taskRouter.get("/", listTasksHandler);

// Get one
taskRouter.get("/:id", getTaskHandler);

// Update
taskRouter.patch("/:id", updateTaskHandler);

// Delete
taskRouter.delete("/:id", deleteTaskHandler);
