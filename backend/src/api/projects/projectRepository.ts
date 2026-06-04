import { sequelize } from "../../../db/sequelize";
import { type TerminCategory, type TerminCreationAttributes, TerminModel } from "../termin/terminModel";
import type { CreateProjectDTO, ProjectTerminDTO, UpdateProjectDTO } from "./projectDTO";
import { type ProjectAttributes, type ProjectCreationAttributes, ProjectModel } from "./projectModel";

export class ProjectRepository {
	async create(data: CreateProjectDTO, id: string): Promise<ProjectModel> {
		const newProject: ProjectCreationAttributes = {
			name: data.name,
			description: data.description,
			location: data.location,
			budget: data.budget,
			start_date: data.start_date,
			end_date: data.end_date,
			is_termin_by_progress: data.is_termin_by_progress,
			created_by: id,
		};

		return ProjectModel.create(newProject);
	}

	async findAllByUser(id: string): Promise<ProjectModel[]> {
		return ProjectModel.findAll({
			where: {
				created_by: id,
			},
		});
	}

	async getDetailProject(id: string): Promise<ProjectModel | null> {
		return ProjectModel.findOne({
			where: { id },
			include: [
				{
					model: TerminModel,
					as: "termin",
				},
			],
		});
	}

	async makeProjectTermin(id: string, termins: ProjectTerminDTO[]): Promise<TerminModel[]> {
		const projectTermins: TerminCreationAttributes[] = termins.map((termin) => {
			return {
				project_id: id,
				description: termin.description,
				sequence: termin.sequence,
				nominal: termin.nominal,
				paid: false,
				total_cost_in: 0,
				category: termin.category as TerminCategory,
				percentage: termin.percentage,
			};
		});
		return await TerminModel.bulkCreate(projectTermins);
	}

	async updateProject(data: UpdateProjectDTO, projectId: string): Promise<ProjectModel | null> {
		const transaction = await sequelize.transaction();

		try {
			const project = await ProjectModel.findOne({
				where: { id: projectId },
				transaction,
			});

			if (!project) {
				await transaction.rollback();
				return null;
			}

			// Partial update - hanya update field yang dikirim
			const updateData: Partial<ProjectAttributes> = {};

			if (data.name !== undefined) updateData.name = data.name;
			if (data.description !== undefined) updateData.description = data.description;
			if (data.location !== undefined) updateData.location = data.location;
			if (data.budget !== undefined) updateData.budget = data.budget;
			if (data.start_date !== undefined) updateData.start_date = data.start_date;
			if (data.end_date !== undefined) updateData.end_date = data.end_date;
			if (data.status !== undefined) updateData.status = data.status;
			if (data.progress !== undefined) updateData.progress = data.progress;

			project.set(updateData);
			await project.save({ transaction });

			// Jika termin dikirim, replace all termins
			if (data.termin !== undefined) {
				for (const termin of data.termin) {
					if (termin.id) {
						// UPDATE jika ada id
						await TerminModel.update(
							{
								description: termin.description,
								sequence: termin.sequence,
								nominal: termin.nominal,
								percentage: termin.percentage,
							},
							{
								where: {
									id: termin.id,
									project_id: projectId, // penting untuk safety
								},
								transaction,
							},
						);
					} else {
						// INSERT jika tidak ada id
						await TerminModel.create(
							{
								project_id: projectId,
								description: termin.description,
								sequence: termin.sequence,
								nominal: termin.nominal,
								total_cost_in: 0,
								paid: false,
								category: termin.category as TerminCategory,
								percentage: termin.percentage,
							},
							{ transaction },
						);
					}
				}
			}

			await transaction.commit();
			return project;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async deleteProject(projectId: string): Promise<number> {
		return await ProjectModel.destroy({
			where: {
				id: projectId,
			},
		});
	}
}
