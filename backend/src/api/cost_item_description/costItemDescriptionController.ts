import type { RequestHandler } from "express";
import { costItemDescriptionService } from "./costItemDescriptionService";

export class CostItemDescriptionController {
	public getAll: RequestHandler = async (_req, res) => {
		const serviceResponse = await costItemDescriptionService.getAll();
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public create: RequestHandler = async (req, res) => {
		const serviceResponse = await costItemDescriptionService.create(req.body);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const costItemDescriptionController = new CostItemDescriptionController();
