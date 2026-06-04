import type { RequestHandler } from "express";
import { uploadFile } from "../../common/utils/uploadFile";
import { costRecordService } from "./costRecordService";

export class CostRecordController {
	public getAllProjectCostRecord: RequestHandler = async (req, res) => {
		const userId = req.userId;
		const projectName = req.query.projectName as string | undefined;
		const serviceResponse = await costRecordService.getAllProjectCostRecord(userId, projectName);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getProjectCostRecord: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await costRecordService.getProjectCostRecord(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public prosesCostRecord: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const recordId = req.params.recordId as string;
		const serviceResponse = await costRecordService.prosesCostRecord(projectId, recordId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getDetailCostRecord: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const recordId = req.params.recordId as string;
		const serviceResponse = await costRecordService.getDetailCostRecord(projectId, recordId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public create: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const userId = req.userId;
		const file = req.file;

		if (!file) {
			res.status(400).json({ msg: "please upload nota first" });
			return;
		}

		const { path, publicUrl } = await uploadFile(file, "nota");

		let parsedItems = [];

		try {
			parsedItems = JSON.parse(req.body.items);
		} catch (err) {
			res.status(400).json({ msg: "Invalid items format" });
			return;
		}

		const payload = {
			...req.body,
			items: parsedItems,
		};

		const serviceResponse = await costRecordService.makeCostRecord(projectId, userId, path, publicUrl, payload);

		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getTotalCost: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await costRecordService.getTotalCost(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getCostSummary: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await costRecordService.getCostSummary(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getWBSCostReport: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const serviceResponse = await costRecordService.getWBSCostReport(projectId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getWBSCostReportDetail: RequestHandler = async (req, res) => {
		const projectId = req.params.projectId as string;
		const wbsId = req.params.wbsId as string;
		const serviceResponse = await costRecordService.getWBSCostReportDetail(projectId, wbsId);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public approve: RequestHandler = async (req, res) => {
		const recordId = req.params.recordId as string;
		const userId = req.userId;
		const file = req.file;

		if (!file) {
			res.status(400).json({ msg: "please upload proof of payment first" });
			return;
		}

		const { path, publicUrl } = await uploadFile(file, "bukti");

		const serviceResponse = await costRecordService.approve(recordId, userId, path, publicUrl);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public reject: RequestHandler = async (req, res) => {
		const recordId = req.params.recordId as string;
		const serviceResponse = await costRecordService.reject(recordId, req.body);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const costRecordController = new CostRecordController();
