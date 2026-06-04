import { StatusCodes } from "http-status-codes";
import { CBSRepository } from "../../api/cbs/cbsRepository";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toCBS } from "../../common/utils/mapper";
import { logger } from "../../server";
import type { CreateCBSDTO, GetCBSDTO, UpdateCBSDTO } from "./cbsDTO";

export class CBSService {
	private cbsRepository: CBSRepository;

	constructor(repository: CBSRepository = new CBSRepository()) {
		this.cbsRepository = repository;
	}

	async findAll(): Promise<ServiceResponse<GetCBSDTO[] | null>> {
		try {
			const model = await this.cbsRepository.findAll();

			if (!model) {
				return ServiceResponse.success("CBS still empty", null, StatusCodes.OK);
			}

			const cbs = model.map((cbs) => {
				return toCBS(cbs.get({ plain: true }));
			});

			return ServiceResponse.success("CBS data retrieve", cbs, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Failed to retrieve CBS data", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async createCBS(dto: CreateCBSDTO, id: string): Promise<ServiceResponse<GetCBSDTO | null>> {
		try {
			const model = await this.cbsRepository.create(dto, id);

			const cbs = toCBS(model.get({ plain: true }));

			return ServiceResponse.success("CBS category created successfully", cbs, StatusCodes.CREATED);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Failed to create CBS", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async updateCBS(dto: UpdateCBSDTO, id: string): Promise<ServiceResponse<GetCBSDTO | null>> {
		try {
			const model = await this.cbsRepository.update(dto, id);

			if (!model) {
				return ServiceResponse.failure("cbs not found", null, StatusCodes.BAD_REQUEST);
			}

			const cbs = toCBS(model.get({ plain: true }));

			return ServiceResponse.success("CBS category updated successfully", cbs, StatusCodes.CREATED);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Failed to update CBS", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const cbsService = new CBSService();
