import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toCostItemDescription } from "../../common/utils/mapper";
import { logger } from "../../server";
import type { CreateCostItemDescriptionDTO, GetCostItemDescriptionDTO } from "./costItemDescriptionDTO";
import { CostItemDescriptionRepository } from "./costItemDescriptionRepository";

export class CostItemDescriptionService {
	private repository: CostItemDescriptionRepository;

	constructor(repository: CostItemDescriptionRepository = new CostItemDescriptionRepository()) {
		this.repository = repository;
	}

	async getAll(): Promise<ServiceResponse<GetCostItemDescriptionDTO[] | null>> {
		try {
			const costItemDesc = await this.repository.getAll();
			if (costItemDesc.length === 0) {
				return ServiceResponse.success("No cost item description yet", [], StatusCodes.OK);
			}
			const result: GetCostItemDescriptionDTO[] = costItemDesc.map((desc) => {
				return toCostItemDescription(desc.get({ plain: true }));
			});
			return ServiceResponse.success("Cost item description retreived successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async create(data: CreateCostItemDescriptionDTO): Promise<ServiceResponse<GetCostItemDescriptionDTO | null>> {
		try {
			const costItemDesc = await this.repository.create(data);
			const result: GetCostItemDescriptionDTO = toCostItemDescription(costItemDesc.get({ plain: true }));
			return ServiceResponse.success("Cost item description created successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const costItemDescriptionService = new CostItemDescriptionService();
