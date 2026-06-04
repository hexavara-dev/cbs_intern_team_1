import type { Request, RequestHandler } from "express";
import { commonValidations } from "../../common/utils/commonValidation";
import { cbsService } from "../cbs/cbsService";
import type { CreateCBSDTO, UpdateCBSDTO, UpdateCBSParam } from "./cbsDTO";

class CBSController {
	public getAllCBS: RequestHandler = async (_req, res) => {
		const serviceResponse = await cbsService.findAll();
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public createCBS: RequestHandler = async (req: Request<unknown, unknown, CreateCBSDTO>, res) => {
		const id = req.userId;

		const parseId = commonValidations.id.safeParse(id);

		if (!parseId.success) {
			return res.status(400).json({
				message: "Invalid user id",
				errors: parseId.error.format(),
			});
		}

		const serviceResponse = await cbsService.createCBS(req.body, id);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public updateCBS: RequestHandler<UpdateCBSParam, unknown, UpdateCBSDTO> = async (req, res) => {
		const cbsId = req.params.id;

		const serviceResponse = await cbsService.updateCBS(req.body, cbsId);
		return res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const cbsController = new CBSController();
