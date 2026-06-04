import { CBSModel } from "../cbs/cbsModel";
import { ProjectModel } from "../projects/projectModel";
import { type ProjectCBSCreationAttributes, ProjectCBSModel } from "./projectCbsModel";

export class ProjectCBSRepository {
	async findAllByProject(projectId: string): Promise<ProjectCBSModel[]> {
		return await ProjectCBSModel.findAll({
			where: {
				project_id: projectId,
			},
			include: [
				{
					model: CBSModel,
					as: "cbs",
				},
			],
		});
	}

	async findProjectById(projectId: string): Promise<ProjectModel | null> {
		return await ProjectModel.findOne({
			where: { id: projectId },
		});
	}

	async findCBSByIds(cbsIds: string[]): Promise<CBSModel[]> {
		return await CBSModel.findAll({
			where: { id: cbsIds },
		});
	}

	async deleteAllByProject(projectId: string): Promise<number> {
		return await ProjectCBSModel.destroy({
			where: { project_id: projectId },
		});
	}

	async bulkCreate(projectId: string, cbsCategoryIds: string[], userId: string): Promise<ProjectCBSModel[]> {
		const records: ProjectCBSCreationAttributes[] = cbsCategoryIds.map((cbsId) => ({
			project_id: projectId,
			cbs_category_id: cbsId,
			selected_by: userId,
		}));

		return await ProjectCBSModel.bulkCreate(records);
	}

	async select(cbsId: string, projectId: string, userId: string): Promise<ProjectCBSModel | null> {
		const [cbs, project] = await Promise.all([
			CBSModel.findOne({
				where: { id: cbsId },
			}),
			ProjectModel.findOne({
				where: { id: projectId },
			}),
		]);

		if (!cbs || !project) {
			return null;
		}

		const newProjectCbs: ProjectCBSCreationAttributes = {
			project_id: projectId,
			cbs_category_id: cbsId,
			selected_by: userId,
		};

		return await ProjectCBSModel.create(newProjectCbs);
	}

	async remove(cbsId: string, projectId: string): Promise<number> {
		return ProjectCBSModel.destroy({
			where: {
				project_id: projectId,
				cbs_category_id: cbsId,
			},
		});
	}
}
