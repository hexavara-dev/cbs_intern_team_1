import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toProgessSummary, toProgressHistory, toWBSProgressReport } from "../../common/utils/mapper";
import { deleteFile } from "../../common/utils/uploadFile";
import { logger } from "../../server";
import type { GetProgressHistory, GetProgressSummaryDTO, GetWBSProgressDTO, UpdateProgressDTO } from "./progressDTO";
import { ProgressRepository } from "./progressRepository";

export class ProgressService {
	private progressRepository: ProgressRepository;

	constructor(progressRepository: ProgressRepository = new ProgressRepository()) {
		this.progressRepository = progressRepository;
	}

	async getWBSProgress(projectId: string): Promise<ServiceResponse<GetWBSProgressDTO[] | null>> {
		try {
			const wbsProgress = await this.progressRepository.getWBSProgress(projectId);
			if (wbsProgress.length === 0) {
				return ServiceResponse.failure("WBS not created yet", null, StatusCodes.OK);
			}
			const result = wbsProgress.map((wbs) => {
				return toWBSProgressReport(wbs);
			});
			return ServiceResponse.success("WBS progress retrieved successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getProgresSummary(projectId: string): Promise<ServiceResponse<GetProgressSummaryDTO | null>> {
		try {
			const progressSummary = await this.progressRepository.getProgressSummary(projectId);
			if (progressSummary.length === 0) {
				return ServiceResponse.success("No termin planning and progress yet", null, StatusCodes.OK);
			}
			const result: GetProgressSummaryDTO = {
				total_planned: 0,
				total_executed: 0,
				by_termin: [],
			};
			progressSummary.map((termin) => {
				const info = toProgessSummary(termin);
				result.total_planned += info.planned_volume;
				result.total_executed += info.actual_volume;
				result.by_termin.push(info);
			});
			return ServiceResponse.success("Progress summary retrieved successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getProgressHistory(projectId: string): Promise<ServiceResponse<GetProgressHistory[] | null>> {
		try {
			const history = await this.progressRepository.getProgressHistory(projectId);
			if (history.length === 0) {
				return ServiceResponse.failure("No history recorded", null, StatusCodes.OK);
			}
			const result: GetProgressHistory[] = history.map((prog) => {
				return toProgressHistory(prog);
			});
			return ServiceResponse.success("Progress history retrieved successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getProgressHistoryDetail(
		projectId: string,
		progressId: string,
	): Promise<ServiceResponse<GetProgressHistory | null>> {
		try {
			const progress = await this.progressRepository.getDetailProgressHistory(projectId, progressId);
			if (!progress) {
				return ServiceResponse.failure("Progress not found", null, StatusCodes.NOT_FOUND);
			}
			const result = toProgressHistory(progress);
			return ServiceResponse.success("Progress retrieved successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async makeProgress(
		projectId: string,
		path: string,
		fileUrl: string,
		data: UpdateProgressDTO,
	): Promise<ServiceResponse<GetProgressHistory | null>> {
		try {
			const progress = await this.progressRepository.updateProgress(projectId, fileUrl, data);
			if (!progress) {
				await deleteFile(path);
				return ServiceResponse.failure("Progress ID is invalid", null, StatusCodes.BAD_REQUEST);
			}
			return ServiceResponse.success("Progress recorded successfully", null, StatusCodes.OK);
		} catch (err) {
			await deleteFile(path);
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const progressService = new ProgressService();
