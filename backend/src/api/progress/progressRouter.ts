import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { fileUploader } from "../../common/utils/uploadFile";
import { progressController } from "./progressController";

export const progressRouter: Router = express.Router();

progressRouter.get("/:projectId/progress/table", authMiddleware, progressController.getWBSProgress);
progressRouter.get("/:projectId/progress/summary", authMiddleware, progressController.getProgressSummary);
progressRouter.get("/:projectId/progress/history", authMiddleware, progressController.getProgressHistory);
progressRouter.get(
	"/:projectId/progress/history/:progressId",
	authMiddleware,
	progressController.getProgressHistoryDetail,
);
progressRouter.post(
	"/:projectId/progress",
	authMiddleware,
	fileUploader.single("progress"),
	progressController.makeProgress,
);
