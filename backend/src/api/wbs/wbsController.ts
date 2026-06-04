import type { Request, RequestHandler, Response } from "express";
import { WBSService } from "./wbsService";

export class WBSController {
	private service: WBSService;

	constructor(service: WBSService = new WBSService()) {
		this.service = service;
	}

	public createWBS: RequestHandler = async (req: Request, res: Response) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await this.service.createWBS(projectId, req.body);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getLeafWBS: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await this.service.getLeafWBS(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public updateWBS: RequestHandler = async (req: Request, res: Response) => {
		const projectId = req.params.projectId as string;
		const wbsCode = req.params.wbsId as string; // "1.1"
		const serviceResponse = await this.service.updateWBS(projectId, wbsCode, req.body);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getAllWBS: RequestHandler = async (req: Request, res: Response) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await this.service.getAllWBS(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getTotalCost: RequestHandler = async (req: Request, res: Response) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await this.service.GetTotalCost(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public deleteWBS: RequestHandler = async (req: Request, res: Response) => {
		const projectId = req.params.projectId as string;
		const wbsCode = req.params.wbsId as string; // "1.1"
		const serviceResponse = await this.service.deleteWBS(projectId, wbsCode);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const wbsController = new WBSController();
