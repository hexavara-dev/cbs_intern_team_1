import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { wbsController } from "../wbs/wbsController";

export const wbsRouter: Router = express.Router();

wbsRouter.get("/:projectId/wbs", authMiddleware, wbsController.getAllWBS);
wbsRouter.get("/:projectId/wbs/leaf", authMiddleware, wbsController.getLeafWBS);
wbsRouter.get("/:projectId/total-cost", authMiddleware, wbsController.getTotalCost);
wbsRouter.post("/:projectId/wbs", authMiddleware, wbsController.createWBS);
wbsRouter.patch("/:projectId/wbs/:wbsId", authMiddleware, wbsController.updateWBS);
wbsRouter.delete("/:projectId/wbs/:wbsId", authMiddleware, wbsController.deleteWBS);
