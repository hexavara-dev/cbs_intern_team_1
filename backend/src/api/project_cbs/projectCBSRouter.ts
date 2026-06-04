import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { projectCbsController } from "./projectCbsController";

export const projectCbsRouter: Router = express.Router();

// GET /api/projects/:projectId/cbs-selections
projectCbsRouter.get("/:projectId/cbs-selections", authMiddleware, projectCbsController.getCBSSelections);

// PUT /api/projects/:projectId/cbs-selections
projectCbsRouter.put("/:projectId/cbs-selections", authMiddleware, projectCbsController.updateCBSSelections);
