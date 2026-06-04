import type { Request, RequestHandler } from "express";
import { commonValidations } from "../../common/utils/commonValidation";
import type { ProjectCBSParam, UpdateCBSSelectionsDTO } from "./projectCbsDTO";
import { projectCbsService } from "./projectCbsService";

export class ProjectCbsController {
	public getCBSSelections: RequestHandler<ProjectCBSParam> = async (req, res) => {
		const userId = req.userId;

		const parseId = commonValidations.id.safeParse(userId);

		if (!parseId.success) {
			return res.status(400).json({
				success: false,
				message: "Invalid user id",
				errors: parseId.error.format(),
			});
		}

		const { projectId } = req.params;

		const parseProjectId = commonValidations.id.safeParse(projectId);

		if (!parseProjectId.success) {
			return res.status(400).json({
				success: false,
				message: "Invalid project id",
				errors: parseProjectId.error.format(),
			});
		}

		const result = await projectCbsService.getCBSSelections(projectId);
		res.status(result.statusCode).json(result);
	};

	public updateCBSSelections: RequestHandler<ProjectCBSParam> = async (
		req: Request<ProjectCBSParam, unknown, UpdateCBSSelectionsDTO>,
		res,
	) => {
		const userId = req.userId;

		const parseId = commonValidations.id.safeParse(userId);

		if (!parseId.success) {
			return res.status(400).json({
				success: false,
				message: "Invalid user id",
				errors: parseId.error.format(),
			});
		}

		const { projectId } = req.params;

		const parseProjectId = commonValidations.id.safeParse(projectId);

		if (!parseProjectId.success) {
			return res.status(400).json({
				success: false,
				message: "Invalid project id",
				errors: parseProjectId.error.format(),
			});
		}

		const { cbs_category_ids } = req.body;

		if (!Array.isArray(cbs_category_ids)) {
			return res.status(400).json({
				success: false,
				message: "cbs_category_ids must be an array",
			});
		}

		const result = await projectCbsService.updateCBSSelections(projectId, cbs_category_ids, userId);
		res.status(result.statusCode).json(result);
	};
}

export const projectCbsController = new ProjectCbsController();
