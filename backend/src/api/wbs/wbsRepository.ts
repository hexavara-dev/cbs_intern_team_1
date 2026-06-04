import type { Transaction } from "sequelize";
import { WbsCostModel } from "../wbs_cost/wbsCostModel";
import type { CreateWbsDTO } from "./wbsDTO";
import { HouseUnits, WBSModel } from "./wbsModel";

export class WBSRepository {
	async createWBS(
		projectId: string,
		data: CreateWbsDTO & {
			project_id: string;
			parent_uuid: string | null;
			total_cost: number;
			level: number;
			sort_order: number;
		},
		transaction: Transaction,
	): Promise<WBSModel> {
		return await WBSModel.create(
			{
				...data,
				parent_id: data.parent_uuid,
				project_id: projectId,
			},
			{ transaction },
		);
	}

	async updateWBS(id: string, data: Partial<WBSModel>, transaction: Transaction): Promise<WBSModel> {
		const wbs = await this.findById(id);
		if (!wbs) throw new Error("WBS item not found");

		if (Object.keys(data).length === 0) {
			return wbs;
		}

		const [affectedCount, affectedRows] = await WBSModel.update(data, {
			where: { id },
			returning: true,
			transaction,
		});

		if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
			// Fallback: fetch the item if update didn't return rows (though it should for PG)
			// or if the item wasn't found (which should be handled by caller usually)
			const wbs = await this.findById(id);
			if (!wbs) throw new Error("WBS item not found or update failed");
			return wbs;
		}

		return affectedRows[0];
	}

	async updateTotalCostWBS(id: string, totalCost: number, transaction: Transaction): Promise<number> {
		const [affectedCount] = await WBSModel.update({ total_cost: totalCost }, { where: { id }, transaction });

		return affectedCount;
	}

	async updateTotalCostUnitWBS(id: string, totalCost: number, transaction: Transaction): Promise<[number, number]> {
		const wbs = await WBSModel.findOne({
			where: { id },
			transaction,
		});

		if (!wbs) {
			return [0, 0];
		}

		const oldTotalCost = Number(wbs.dataValues.total_cost) || 0;

		const [affectedCount] = await WBSModel.update({ total_cost: totalCost }, { where: { id }, transaction });

		if (affectedCount !== 1) {
			return [0, 0];
		}

		const delta = totalCost - oldTotalCost;

		return [affectedCount, delta];
	}

	async getAllWBS(projectId: string): Promise<WBSModel[]> {
		const { literal } = await import("sequelize");
		return await WBSModel.findAll({
			where: {
				project_id: projectId,
			},
			include: {
				model: WbsCostModel,
				as: "costs",
			},
			// Natural sort for WBS ID (e.g. 1, 2, 10 instead of 1, 10, 2)
			order: [literal(`string_to_array(wbs_id, '.')::int[] ASC`)],
		});
	}

	async getTotalCost(projectId: string): Promise<number> {
		return await WBSModel.sum("total_cost", {
			where: { is_leaf: false, project_id: projectId, level: 1 },
		});
	}

	async getLeafWBS(projectId: string): Promise<WBSModel[]> {
		return await WBSModel.findAll({
			where: {
				project_id: projectId,
				is_leaf: true,
			},
		});
	}

	async findByWbsId(projectId: string, wbsCode: string, transaction?: Transaction): Promise<WBSModel | null> {
		return await WBSModel.findOne({
			where: {
				project_id: projectId,
				wbs_id: wbsCode,
			},
			transaction,
		});
	}

	async findById(id: string): Promise<WBSModel | null> {
		return await WBSModel.findOne({
			where: { id },
		});
	}

	async deleteWBSById(id: string): Promise<number> {
		return await WBSModel.destroy({
			where: {
				id: id,
			},
		});
	}

	async upsertWBSCost(
		wbsItemId: string,
		cbsCategoryId: string,
		unitCost: number,
		transaction: Transaction,
	): Promise<void> {
		await WbsCostModel.upsert(
			{
				wbs_item_id: wbsItemId,
				cbs_category_id: cbsCategoryId,
				unit_cost: unitCost,
			},
			{ transaction },
		);
	}

	async deleteWBSCosts(wbsItemId: string, transaction: Transaction): Promise<void> {
		await WbsCostModel.destroy({
			where: { wbs_item_id: wbsItemId },
			transaction,
		});
	}

	async getTotalCostAllWBS(projectId: string): Promise<number> {
		return await WBSModel.sum("total_cost", {
			where: { project_id: projectId, level: 1 },
		});
	}

	async getChildrenCount(parentId: string | null, projectId: string, transaction?: Transaction): Promise<number> {
		return await WBSModel.count({
			where: {
				parent_id: parentId,
				project_id: projectId,
			},
			transaction,
		});
	}

	async deleteWBS(id: string, transaction: Transaction): Promise<void> {
		await WBSModel.destroy({
			where: { id },
			transaction,
		});
	}

	async getAllWBSByProject(projectId: string, transaction?: Transaction): Promise<WBSModel[]> {
		const { literal } = await import("sequelize");
		return await WBSModel.findAll({
			where: {
				project_id: projectId,
			},
			transaction,
			// Natural sort for reindexing logic consistency
			order: [literal(`string_to_array(wbs_id, '.')::int[] ASC`)],
		});
	}

	async batchUpdateWbsIds(
		updates: Array<{ id: string; wbs_id: string; level: number }>,
		transaction: Transaction,
	): Promise<void> {
		for (const update of updates) {
			await WBSModel.update(
				{
					wbs_id: update.wbs_id,
					level: update.level,
				},
				{
					where: { id: update.id },
					transaction,
				},
			);
		}
	}

	async getChildrenRecursive(parentId: string, transaction?: Transaction): Promise<WBSModel[]> {
		const children = await WBSModel.findAll({
			where: { parent_id: parentId },
			transaction,
		});

		const allDescendants: WBSModel[] = [...children];

		for (const child of children) {
			const descendants = await this.getChildrenRecursive(child.id, transaction);
			allDescendants.push(...descendants);
		}

		return allDescendants;
	}

	/**
	 * Find all descendants of a WBS item using wbs_id prefix pattern
	 * More efficient than recursive queries for deletion operations
	 * @param projectId - The project ID
	 * @param wbsId - The WBS ID to find descendants for
	 * @param transaction - Database transaction
	 * @returns Array of WBS items that are descendants (excluding the item itself)
	 */
	async findDescendantsByWbsIdPrefix(projectId: string, wbsId: string, transaction: Transaction): Promise<WBSModel[]> {
		const { Op } = await import("sequelize");
		return await WBSModel.findAll({
			where: {
				project_id: projectId,
				wbs_id: {
					[Op.like]: `${wbsId}.%`, // Find all items like "1.1.%", "1.2.%" etc
				},
			},
			transaction,
			order: [["wbs_id", "DESC"]], // Order deepest first for proper deletion order
		});
	}
}
