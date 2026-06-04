import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { fileUploader } from "../../common/utils/uploadFile";
import { costRecordController } from "./costRecordController";

export const costRecordRouter: Router = express.Router();
export const costRecordApprovelRouter: Router = express.Router();
export const costRecordReportRouter: Router = express.Router();

costRecordRouter.get("/records", authMiddleware, costRecordController.getAllProjectCostRecord);
costRecordRouter.get("/:projectId/costs", authMiddleware, costRecordController.getProjectCostRecord);
costRecordRouter.get("/:projectId/costs/:recordId", authMiddleware, costRecordController.getDetailCostRecord);
costRecordRouter.post("/:projectId/costs/:recordId", authMiddleware, costRecordController.prosesCostRecord);
costRecordRouter.post("/:projectId/costs", authMiddleware, fileUploader.single("nota"), costRecordController.create);

costRecordApprovelRouter.patch(
	"/:recordId/approve",
	authMiddleware,
	fileUploader.single("bukti"),
	costRecordController.approve,
);
costRecordApprovelRouter.patch("/:recordId/reject", authMiddleware, costRecordController.reject);

costRecordReportRouter.get("/:projectId/costs/summary", authMiddleware, costRecordController.getCostSummary);
costRecordReportRouter.get("/:projectId/wbs", authMiddleware, costRecordController.getWBSCostReport);
costRecordReportRouter.get("/:projectId/wbs/:wbsId", authMiddleware, costRecordController.getWBSCostReportDetail);
