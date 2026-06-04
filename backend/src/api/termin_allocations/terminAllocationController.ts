import type { RequestHandler } from "express";
import { commonValidations } from "../../common/utils/commonValidation";
import { terminAllocationService } from "./terminAllocationService";

export class TerminAllocationController {
	public allocateWBS: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const parseProjectId = commonValidations.id.safeParse(projectId);

		if (!parseProjectId.success) {
			return res.status(400).json({
				message: "Invalid project id",
				errors: parseProjectId.error.format(),
			});
		}

		const serviceResponse = await terminAllocationService.allocateWBS(projectId, req.body);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getAllocatedWBSInTermin: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;

		const parseProjectId = commonValidations.id.safeParse(projectId);

		if (!parseProjectId.success) {
			return res.status(400).json({
				message: "Invalid project id",
				errors: parseProjectId.error.format(),
			});
		}

		const serviceResponse = await terminAllocationService.getAllocateWBSInTermin(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const terminAllocationController = new TerminAllocationController();
