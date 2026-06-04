import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../../db/sequelize";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { logger } from "../../server";
import { CBSRepository } from "../cbs/cbsRepository";
import type { ProjectCBSSelectionDTO } from "./projectCbsDTO";
import { ProjectCBSRepository } from "./projectCbsRepository";

export class ProjectCbsService {
	private projectCbsRepository: ProjectCBSRepository;
	private cbsRepository: CBSRepository;

	constructor(
		projectRepository: ProjectCBSRepository = new ProjectCBSRepository(),
		cbsRepository: CBSRepository = new CBSRepository(),
	) {
		this.projectCbsRepository = projectRepository;
		this.cbsRepository = cbsRepository;
	}

	async getCBSSelections(projectId: string): Promise<ServiceResponse<ProjectCBSSelectionDTO[] | null>> {
		try {
			const selections = await this.projectCbsRepository.findAllByProject(projectId);

			if (selections.length === 0) {
				return ServiceResponse.success("No CBS selected", null, StatusCodes.OK);
			}

			const cbsSelections: ProjectCBSSelectionDTO[] = selections.map((selection) => {
				const cbs = selection.cbs.get({ plain: true });
				return {
					id: cbs.id,
					name: cbs.name,
					cost_type: cbs.cost_type,
				};
			});

			return ServiceResponse.success("CBS selections retrieved", cbsSelections, StatusCodes.OK);
		} catch (err) {
			logger.error(err);
			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async updateCBSSelections(
		projectId: string,
		cbsCategoryIds: string[],
		userId: string,
	): Promise<ServiceResponse<{ success: boolean; data: ProjectCBSSelectionDTO[]; message: string } | null>> {
		const transaction = await sequelize.transaction();

		try {
			const project = await this.projectCbsRepository.findProjectById(projectId);

			if (!project) {
				await transaction.rollback();
				return ServiceResponse.failure("Project not found", null, StatusCodes.NOT_FOUND);
			}

			// Validate all CBS IDs exist
			if (cbsCategoryIds.length > 0) {
				const modelCBS = await this.cbsRepository.findAllByUser(userId);
				const existingCbs = modelCBS.map((model) => {
					return model.get({ plain: true });
				});
				const existingIds = existingCbs.map((cbs) => cbs.id);
				const invalidIds = cbsCategoryIds.filter((id) => !existingIds.includes(id));

				if (invalidIds.length > 0) {
					await transaction.rollback();
					return ServiceResponse.failure(
						`Invalid CBS category IDs: ${invalidIds.join(", ")}`,
						null,
						StatusCodes.BAD_REQUEST,
					);
				}
			}

			// Delete all existing selections
			await this.projectCbsRepository.deleteAllByProject(projectId);

			// Create new selections if there are any
			if (cbsCategoryIds.length > 0) {
				await this.projectCbsRepository.bulkCreate(projectId, cbsCategoryIds, userId);
			}

			await transaction.commit();

			// Fetch updated selections with CBS data
			const updatedSelections = await this.projectCbsRepository.findAllByProject(projectId);

			const result: ProjectCBSSelectionDTO[] = updatedSelections.map((selection) => {
				const projectCbs = selection.cbs.get({ plain: true });
				return {
					id: projectCbs.id,
					name: projectCbs.name,
					cost_type: projectCbs.cost_type,
				};
			});

			return ServiceResponse.success(
				"CBS selections updated successfully",
				{ success: true, data: result, message: "CBS selections updated successfully" },
				StatusCodes.OK,
			);
		} catch (err) {
			await transaction.rollback();
			logger.error(err);
			return ServiceResponse.failure("Failed to update CBS selections", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const projectCbsService = new ProjectCbsService();
