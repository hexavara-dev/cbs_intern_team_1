import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toCostInDetail, toCostInSummary, toProjectCostIn } from "../../common/utils/mapper";
import { deleteFile } from "../../common/utils/uploadFile";
import { logger } from "../../server";
import { TerminCategory, type TerminModel } from "../termin/terminModel";
import type {
	CostInDetailDTO,
	GetProjectCostInDTO,
	GetProjectCostInSummaryDTO,
	MakeCostInDTO,
	TerminCostInInformation,
} from "./costInDTO";
import { CostInRepository } from "./costInRepository";

export class CostInService {
	private costInRepository;

	constructor(costInRepository: CostInRepository = new CostInRepository()) {
		this.costInRepository = costInRepository;
	}

	async makeCostIn(
		projectId: string,
		uploader: string,
		path: string,
		publicUrl: string,
		data: MakeCostInDTO,
	): Promise<ServiceResponse<null>> {
		try {
			let projectTermins: TerminModel[];

			if (data.category === TerminCategory.ADENDUM) {
				projectTermins = await this.costInRepository.getAdendumTerminNotPaid(projectId);
			} else {
				projectTermins = await this.costInRepository.getTerminNotPaid(projectId);
			}

			projectTermins.sort((a, b) => a.dataValues.sequence - b.dataValues.sequence);

			let remainingAmount = data.amount;

			for (const termin of projectTermins) {
				if (remainingAmount <= 0) break;

				const nominal = Number(termin.dataValues.nominal);
				const totalCostIn = Number(termin.dataValues.total_cost_in);

				const remainingTermin = nominal - totalCostIn;

				if (remainingTermin <= 0) continue;

				const allocation = Math.min(remainingAmount, remainingTermin);

				const newCostIn = await this.costInRepository.makeCostIn(projectId, uploader, publicUrl, termin.dataValues.id, {
					...data,
					amount: allocation,
				});

				if (!newCostIn) {
					await deleteFile(path);
					return ServiceResponse.failure("Failed to make new cost in", null, StatusCodes.BAD_REQUEST);
				}

				await this.costInRepository.updateTerminTotalCostIn(termin.dataValues.id, totalCostIn + allocation);

				remainingAmount -= allocation;
			}

			if (remainingAmount > 0) {
				await deleteFile(path);
				return ServiceResponse.failure("Amount exceeds total remaining termin", null, StatusCodes.BAD_REQUEST);
			}

			return ServiceResponse.success("Cost in created successfully", null, StatusCodes.OK);
		} catch (err) {
			await deleteFile(path);
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getDetaiCostIn(projectId: string, recordId: string): Promise<ServiceResponse<CostInDetailDTO | null>> {
		try {
			const costInDetail = await this.costInRepository.getDetailCostIn(projectId, recordId);
			if (!costInDetail) {
				return ServiceResponse.failure("Cost in not found", null, StatusCodes.NOT_FOUND);
			}
			const result = toCostInDetail(costInDetail);
			return ServiceResponse.success("", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getProjectCostIn(projectId: string): Promise<ServiceResponse<GetProjectCostInDTO[] | null>> {
		try {
			const projectCostIn = await this.costInRepository.getProjectCostIn(projectId);
			if (projectCostIn.length === 0) {
				return ServiceResponse.success("No cost in yet", null, StatusCodes.OK);
			}
			const result = projectCostIn.map((costIn) => {
				return toProjectCostIn(costIn);
			});
			return ServiceResponse.success("", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getCostInSummary(projectId: string): Promise<ServiceResponse<GetProjectCostInSummaryDTO | null>> {
		try {
			const terminCostIn = await this.costInRepository.getCostInSummary(projectId);
			if (terminCostIn.length === 0) {
				return ServiceResponse.success("No termin yet yet", null, StatusCodes.OK);
			}
			let totalCostIn = 0;
			const terminInfo: TerminCostInInformation[] = [];
			terminCostIn.map((termin) => {
				const terminCostInInformation = toCostInSummary(termin);
				totalCostIn += terminCostInInformation.total_received;
				terminInfo.push(terminCostInInformation);
			});
			const result: GetProjectCostInSummaryDTO = {
				total_cost_in: totalCostIn,
				termin: terminInfo,
			};
			return ServiceResponse.success("", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const costInService = new CostInService();
