import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { projectController } from "./projectController";

export const projectRouter: Router = express.Router();

projectRouter.get("/", authMiddleware, projectController.getUserProjects);
projectRouter.get("/:id", authMiddleware, projectController.getDetailProject);
projectRouter.post("/new", authMiddleware, projectController.createProject);
projectRouter.patch("/:id", authMiddleware, projectController.updateProject);
projectRouter.delete("/:id", authMiddleware, projectController.deleteProject);
