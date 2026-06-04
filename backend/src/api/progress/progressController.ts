import type { RequestHandler } from "express";
import { uploadFile } from "../../common/utils/uploadFile";
import { progressService } from "./progressService";

export class ProgressController {
	public getWBSProgress: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await progressService.getWBSProgress(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getProgressSummary: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await progressService.getProgresSummary(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getProgressHistory: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await progressService.getProgressHistory(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getProgressHistoryDetail: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const progressId = req.params.progressId as string;
		const serviceResponse = await progressService.getProgressHistoryDetail(projectId, progressId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public makeProgress: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const file = req.file;

		if (!file) {
			res.status(400).json({ msg: "please upload progress prove file first" });
			return;
		}

		const { path, publicUrl } = await uploadFile(file, "progress");

		const serviceResponse = await progressService.makeProgress(projectId, path, publicUrl, req.body);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const progressController = new ProgressController();
