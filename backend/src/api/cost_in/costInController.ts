import type { RequestHandler } from "express";
import { uploadFile } from "../../common/utils/uploadFile";
import { costInService } from "./costInService";

export class CostInController {
	public makeCostIn: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const userId = req.userId;
		const file = req.file;

		if (!file) {
			res.status(400).json({ msg: "Please upload receipt first " });
			return;
		}

		const { path, publicUrl } = await uploadFile(file, "receipt");

		const serviceResponse = await costInService.makeCostIn(projectId, userId, path, publicUrl, req.body);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getDetailCostIn: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const recordId = req.params.recordId as string;
		const serviceResponse = await costInService.getDetaiCostIn(projectId, recordId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getProjectCostIn: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await costInService.getProjectCostIn(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getCostInSummary: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await costInService.getCostInSummary(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const costInController = new CostInController();
