import { TerminModel } from "../termin/terminModel";
import { WBSModel } from "../wbs/wbsModel";
import type { AllocateWBSTerminDTO } from "./terminAllocationDTO";
import { type TerminAllocationCreationAttributes, TerminAllocationModel } from "./terminAllocationModel";

export class TerminAllocationRepository {
	async getWBSAllocatedVolume(terminId: string, wbsId: string): Promise<number> {
		const wbs = await WBSModel.findOne({
			where: { id: wbsId },
		});

		if (!wbs) return 0;

		const total = await TerminAllocationModel.sum("actual_volume", {
			where: {
				termin_id: terminId,
				wbs_item_id: wbsId,
			},
		});

		const volume = Number(wbs.dataValues.volume ?? 0);
		const allocated = Number(total ?? 0);

		const volumeLeft = volume - allocated;

		return volumeLeft;
	}

	async getCurrentWBSVolume(terminId: string, wbsId: string): Promise<number> {
		const currVol = await TerminAllocationModel.findOne({
			where: {
				termin_id: terminId,
				wbs_item_id: wbsId,
			},
		});

		return currVol?.dataValues.actual_volume ?? 0;
	}

	async allocateWBSVolume(projectId: string, data: AllocateWBSTerminDTO): Promise<boolean | null> {
		const newAllocation: TerminAllocationCreationAttributes = {
			project_id: projectId,
			termin_id: data.termin_id,
			wbs_item_id: data.wbs_id,
			actual_volume: data.volume,
		};

		const [_allocation, created] = await TerminAllocationModel.upsert(newAllocation, { returning: true });

		return created;
	}

	async getWBSTerminAllocation(projectId: string): Promise<WBSModel[]> {
		const { literal } = await import("sequelize");
		return await WBSModel.findAll({
			where: { project_id: projectId },
			include: [
				{
					model: TerminAllocationModel,
					as: "termin_allocations",
					include: [
						{
							model: TerminModel,
							as: "termin",
						},
					],
				},
			],
			order: [literal(`string_to_array(wbs_id, '.')::int[] ASC`)],
		});
	}
}
