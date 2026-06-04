import type { RequestHandler } from "express";
import { terminService } from "./terminService";

export class TerminController {
	public getTermin: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await terminService.getProjectTermin(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public updateTermin: RequestHandler = async (req, res) => {
		const terminId = req.params.terminId as string;
		const projectId = req.params.projectId as string;
		const serviceResponse = await terminService.updateTermin(terminId, projectId, req.body);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public deleteTermin: RequestHandler = async (req, res) => {
		const terminId = req.params.terminId as string;
		const projectId = req.params.projectId as string;
		const serviceResponse = await terminService.deleteTermin(terminId, projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const terminController = new TerminController();
