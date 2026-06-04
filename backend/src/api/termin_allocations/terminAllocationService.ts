import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toAllocatedWbs } from "../../common/utils/mapper";
import { logger } from "../../server";
import type { AllocateWBSTerminDTO, GetTerminWBSAllocationDTO } from "./terminAllocationDTO";
import { TerminAllocationRepository } from "./terminAllocationRepository";

export class TerminAllocationService {
	private repository: TerminAllocationRepository;

	constructor(repository: TerminAllocationRepository = new TerminAllocationRepository()) {
		this.repository = repository;
	}

	async allocateWBS(projectId: string, data: AllocateWBSTerminDTO): Promise<ServiceResponse<null>> {
		try {
			const currVolume = await this.repository.getCurrentWBSVolume(data.termin_id, data.wbs_id);

			if (currVolume < data.volume) {
				const availableWBSVolume = await this.repository.getWBSAllocatedVolume(data.termin_id, data.wbs_id);

				if (availableWBSVolume < 0) {
					return ServiceResponse.failure("No volume can be allocated", null, StatusCodes.BAD_REQUEST);
				}

				if (availableWBSVolume < data.volume) {
					return ServiceResponse.failure("Volume exceed", null, StatusCodes.BAD_REQUEST);
				}
			}

			await this.repository.allocateWBSVolume(projectId, data);

			return ServiceResponse.success("Allocation created successfully", null, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getAllocateWBSInTermin(projectId: string): Promise<ServiceResponse<GetTerminWBSAllocationDTO[] | null>> {
		try {
			const allocatedWbs = await this.repository.getWBSTerminAllocation(projectId);

			if (!allocatedWbs || allocatedWbs.length === 0) {
				return ServiceResponse.success("No WBS have been allocated", null, StatusCodes.OK);
			}

			const result: GetTerminWBSAllocationDTO[] = allocatedWbs.map((wbs) => {
				return toAllocatedWbs(wbs);
			});

			return ServiceResponse.success("Allocated WBS retrieved", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const terminAllocationService = new TerminAllocationService();
