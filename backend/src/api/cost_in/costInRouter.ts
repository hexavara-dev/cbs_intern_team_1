import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { fileUploader } from "../../common/utils/uploadFile";
import { costInController } from "./costInController";

export const costInRouter: Router = express.Router();

costInRouter.get("/:projectId/cost-in", authMiddleware, costInController.getProjectCostIn);
costInRouter.get("/:projectId/cost-in/summary", authMiddleware, costInController.getCostInSummary);
costInRouter.get("/:projectId/cost-in/:recordId", authMiddleware, costInController.getDetailCostIn);
costInRouter.post("/:projectId/cost-in", authMiddleware, fileUploader.single("receipt"), costInController.makeCostIn);
