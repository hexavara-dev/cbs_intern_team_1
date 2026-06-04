import { literal } from "sequelize";
import { ProjectModel } from "../projects/projectModel";
import { TerminModel } from "../termin/terminModel";
import { TerminAllocationModel } from "../termin_allocations/terminAllocationModel";
import { WBSModel } from "../wbs/wbsModel";
import type { UpdateProgressDTO } from "./progressDTO";
import { ProgressModel } from "./progressModel";

export class ProgressRepository {
	async getWBSProgress(projectId: string): Promise<WBSModel[]> {
		return await WBSModel.findAll({
			where: {
				project_id: projectId,
			},
			include: [
				{
					model: TerminAllocationModel,
					as: "termin_allocations",
					include: [
						{
							model: TerminModel,
							as: "termin",
						},
						{
							model: ProgressModel,
							as: "progress",
						},
					],
				},
			],
			order: [[literal(`string_to_array(wbs_id, '.')::int[]`), "ASC"]],
		});
	}

	async getProgressSummary(projectId: string): Promise<TerminModel[]> {
		return await TerminModel.findAll({
			where: {
				project_id: projectId,
			},
			include: [
				{
					model: TerminAllocationModel,
					as: "termin_allocations",
					include: [
						{
							model: ProgressModel,
							as: "progress",
						},
						{
							model: WBSModel,
							as: "wbs_item",
						},
					],
				},
			],
		});
	}

	async getProgressHistory(projectId: string): Promise<ProgressModel[]> {
		return await ProgressModel.findAll({
			where: {
				project_id: projectId,
			},
			include: [
				{
					model: WBSModel,
					as: "wbs",
				},
				{
					model: TerminAllocationModel,
					as: "termin_allocation",
					include: [
						{
							model: TerminModel,
							as: "termin",
						},
					],
				},
			],
		});
	}

	async getDetailProgressHistory(projectId: string, progressId: string): Promise<ProgressModel | null> {
		return await ProgressModel.findOne({
			where: {
				project_id: projectId,
				id: progressId,
			},
			include: [
				{
					model: WBSModel,
					as: "wbs",
				},
				{
					model: TerminAllocationModel,
					as: "termin_allocation",
					include: [
						{
							model: TerminModel,
							as: "termin",
						},
					],
				},
			],
		});
	}

	async updateProgress(projectId: string, fileUrl: string, data: UpdateProgressDTO): Promise<boolean | null> {
		const wbs = await WBSModel.findOne({
			where: { project_id: projectId, id: data.wbs_id },
		});
		if (!wbs || !wbs.dataValues.volume) return null;

		const project = await ProjectModel.findByPk(projectId);
		if (!project) return null;

		const allocations = await TerminAllocationModel.findAll({
			where: { wbs_item_id: data.wbs_id },
			include: [
				{ model: TerminModel, as: "termin" },
				{ model: ProgressModel, as: "progress" },
			],
			order: [[{ model: TerminModel, as: "termin" }, "sequence", "ASC"]],
		});

		let allocateVol = Number(data.actual_volume);
		let lastTouched: TerminAllocationModel | null = null;

		for (const item of allocations) {
			const progress = item.progress;

			const maxVol = Number(item.dataValues.actual_volume);
			const currentVol = Number(progress?.dataValues.actual_volume ?? 0);

			if (progress?.dataValues.is_finished) continue;

			const remaining = maxVol - currentVol;
			lastTouched = item;

			if (allocateVol >= remaining) {
				await ProgressModel.upsert({
					wbs_item_id: data.wbs_id,
					project_id: projectId,
					termin_id: item.termin.dataValues.id,
					termin_allocation_id: item.dataValues.id,
					description: data.description,
					actual_volume: maxVol,
					photo: [...(progress?.dataValues.photo || []), fileUrl],
					is_finished: true,
				});

				allocateVol -= remaining;
			} else {
				await ProgressModel.upsert({
					wbs_item_id: data.wbs_id,
					project_id: projectId,
					termin_id: item.termin.dataValues.id,
					termin_allocation_id: item.dataValues.id,
					description: data.description,

					actual_volume: Number(allocateVol),

					photo: [...(progress?.dataValues.photo || []), fileUrl],
					is_finished: false,
				});

				allocateVol = 0;
				break;
			}

			if (allocateVol <= 0) break;
		}

		if (!lastTouched) {
			const last = allocations[allocations.length - 1];
			const progress = last.progress;

			await ProgressModel.upsert({
				wbs_item_id: data.wbs_id,
				project_id: projectId,
				termin_id: last.termin.dataValues.id,
				termin_allocation_id: last.dataValues.id,
				description: data.description,

				actual_volume: Number(data.actual_volume),

				photo: [...(progress?.dataValues.photo || []), fileUrl],
				is_finished: true,
			});
		}

		const allProgress = await ProgressModel.findAll({
			where: { project_id: projectId, wbs_item_id: data.wbs_id },
		});

		const totalActual = allProgress.reduce((sum, p) => sum + Number(p.dataValues.actual_volume), 0);

		const percentage = (totalActual / wbs.dataValues.volume) * 100;

		await ProjectModel.update({ progress: percentage }, { where: { id: projectId } });

		return true;
	}
}
