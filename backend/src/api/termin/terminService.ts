import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toTermin } from "../../common/utils/mapper";
import { logger } from "../../server";
import type { DeleteTermin, GetTermin, UpdateTermin } from "./terminDTO";
import { TerminRepository } from "./terminRepository";

export class TerminService {
	private repository: TerminRepository;

	constructor(repository: TerminRepository = new TerminRepository()) {
		this.repository = repository;
	}

	async getProjectTermin(projectId: string): Promise<ServiceResponse<GetTermin[] | null>> {
		try {
			const projectTermin = await this.repository.getProjectTermin(projectId);
			if (projectTermin.length === 0) {
				return ServiceResponse.success("Termin has not been set", null, StatusCodes.OK);
			}
			const result = projectTermin.map((termin) => {
				return toTermin(termin);
			});
			return ServiceResponse.success("Termin retreived successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async updateTermin(
		terminId: string,
		projectId: string,
		data: UpdateTermin,
	): Promise<ServiceResponse<GetTermin | null>> {
		try {
			const updateTermin = await this.repository.updateTermin(terminId, projectId, data);
			if (!updateTermin) {
				return ServiceResponse.failure("Cannot update termin", null, StatusCodes.BAD_REQUEST);
			}
			return ServiceResponse.success("Termin updated successfully", updateTermin, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async deleteTermin(terminId: string, projectId: string): Promise<ServiceResponse<DeleteTermin | null>> {
		try {
			const deleted = await this.repository.deleteTermin(terminId, projectId);
			if (deleted !== 1) {
				return ServiceResponse.failure("Failed to delete termin", null, StatusCodes.BAD_REQUEST);
			}
			return ServiceResponse.success("Termin deleted successfully", { resequenced: false }, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const terminService = new TerminService();
