import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toProject, toProjectDetail } from "../../common/utils/mapper";
import { logger } from "../../server";
import type { TerminAttributes } from "../termin/terminModel";
import type { CreateProjectDTO, GetProjectDetailDTO, GetProjectDTO, UpdateProjectDTO } from "./projectDTO";
import { ProjectRepository } from "./projectRepository";

export class ProjectService {
	private projectRepository: ProjectRepository;

	constructor(repository: ProjectRepository = new ProjectRepository()) {
		this.projectRepository = repository;
	}

	async findAllUserProject(id: string): Promise<ServiceResponse<GetProjectDTO[] | null>> {
		try {
			const models = await this.projectRepository.findAllByUser(id);

			if (models.length === 0) {
				return ServiceResponse.success("No project yet", null, StatusCodes.OK);
			}

			const projects = models.map((model) => {
				return toProject(model.get({ plain: true }));
			});

			return ServiceResponse.success("Projects retreive", projects, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Failed to retrieve projects", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getUserDetailProject(id: string): Promise<ServiceResponse<GetProjectDetailDTO | null>> {
		try {
			const model = await this.projectRepository.getDetailProject(id);

			if (!model) {
				return ServiceResponse.success("Project not found", null, StatusCodes.NOT_FOUND);
			}

			let termin: TerminAttributes[] = [];
			const project = model.get({ plain: true });
			if (model.termin.length !== 0) {
				termin = model.termin.map((termin) => {
					return termin.get({ plain: true });
				});
			}

			const result = toProjectDetail(project, termin);

			return ServiceResponse.success("Projects retreive", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Failed to retrieve projects", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async createProject(data: CreateProjectDTO, id: string): Promise<ServiceResponse<GetProjectDetailDTO | null>> {
		try {
			const model = await this.projectRepository.create(data, id);
			const project = toProject(model.get({ plain: true }));

			if (data.is_termin_by_progress) {
				data.termin.forEach((termin) => {
					if (termin.percentage === undefined) {
						return ServiceResponse.failure("Termin percentage must be filled", null, StatusCodes.BAD_REQUEST);
					}
				});
			}

			const termins = await this.projectRepository.makeProjectTermin(project.id, data.termin);
			const projectTermin = termins.map((termin) => {
				return termin.get({ plain: true });
			});

			const result = toProjectDetail(project, projectTermin);

			return ServiceResponse.success("Project created successfully", result, StatusCodes.CREATED);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Failed to create project", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async updateProject(data: UpdateProjectDTO, id: string): Promise<ServiceResponse<GetProjectDetailDTO | null>> {
		try {
			const model = await this.projectRepository.updateProject(data, id);

			if (!model) {
				return ServiceResponse.failure("Project not found", null, StatusCodes.NOT_FOUND);
			}

			const projectWithTermin = await this.projectRepository.getDetailProject(id);

			if (!projectWithTermin) {
				return ServiceResponse.failure("Project not found", null, StatusCodes.NOT_FOUND);
			}

			const project = projectWithTermin.get({ plain: true });

			let termin: TerminAttributes[] = [];
			if (projectWithTermin.termin && projectWithTermin.termin.length !== 0) {
				termin = projectWithTermin.termin.map((t) => t.get({ plain: true }));
			}

			const result = toProjectDetail(project, termin);

			return ServiceResponse.success("Project updated successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async deleteProject(id: string): Promise<ServiceResponse<null>> {
		try {
			const deleted = await this.projectRepository.deleteProject(id);

			if (deleted !== 1) {
				return ServiceResponse.failure("Project not found", null, StatusCodes.OK);
			}

			return ServiceResponse.success("Project deleted successfully", null, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const projectService = new ProjectService();
