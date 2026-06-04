import type { RequestHandler } from "express";
import { vendorService } from "./vendorService";

export class VendorController {
	public create: RequestHandler = async (req, res) => {
		const vendorName = req.body.name;
		const serviceResponse = await vendorService.makeNewVendor(vendorName);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getAll: RequestHandler = async (_req, res) => {
		const serviceResponse = await vendorService.getAll();
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public findByName: RequestHandler = async (req, res) => {
		const vendorName = req.query.name;
		const serviceResponse = await vendorService.findVendorByName(vendorName as string);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const vendorController = new VendorController();
