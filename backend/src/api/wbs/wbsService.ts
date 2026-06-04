import { StatusCodes } from "http-status-codes";
import type { Transaction } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toLeafWBS, toWBS } from "../../common/utils/mapper";
import { logger } from "../../server";
import { CBSRepository } from "../cbs/cbsRepository";
import { CBSCostType } from "../cbs/cbsSchema";
import type { CreateWbsDTO, GetProjectWBSDTO, UpdateWbsDTO, WBSLeaf } from "./wbsDTO";
import { generateHouseUnitName, HouseUnits, type WBSAttributes, WBSModel } from "./wbsModel";
import { WBSRepository } from "./wbsRepository";

export class WBSService {
	private wbsRepository: WBSRepository;
	private cbsRepository: CBSRepository;

	constructor(repository: WBSRepository = new WBSRepository(), cbsRepository: CBSRepository = new CBSRepository()) {
		this.wbsRepository = repository;
		this.cbsRepository = cbsRepository;
	}

	async getAllWBS(projectId: string): Promise<ServiceResponse<GetProjectWBSDTO[] | null>> {
		try {
			const projectWBS = await this.wbsRepository.getAllWBS(projectId);

			if (projectWBS.length === 0) {
				return ServiceResponse.success("No WBS", null, StatusCodes.OK);
			}

			const wbs = projectWBS.map((wbs) => {
				return toWBS(wbs.get({ plain: true }), wbs.costs);
			});

			return ServiceResponse.success("WBS retreive successfully", wbs, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Cannot get wbs", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async GetTotalCost(projectId: string): Promise<ServiceResponse<number>> {
		try {
			const totalCost = await this.wbsRepository.getTotalCost(projectId);

			return ServiceResponse.success("", totalCost, StatusCodes.OK);
		} catch (err) {
			logger.error(err);
			return ServiceResponse.failure("Internal server error", 0, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getLeafWBS(projectId: string): Promise<ServiceResponse<WBSLeaf[] | null>> {
		try {
			const projectWBS = await this.wbsRepository.getLeafWBS(projectId);

			if (projectWBS.length === 0) {
				return ServiceResponse.success("No WBS", null, StatusCodes.OK);
			}

			const wbs = projectWBS.map((wbs) => {
				return toLeafWBS(wbs.get({ plain: true }));
			});

			console.log(wbs);

			return ServiceResponse.success("WBS retreive successfully", wbs, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Cannot get wbs", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async createWBS(projectId: string, data: CreateWbsDTO): Promise<ServiceResponse<WBSAttributes | null>> {
		const transaction = await sequelize.transaction();

		try {
			let parentUuid: string | null = null;
			let level = 1;

			if (data.wbs_parent_id) {
				const parent = await WBSModel.findOne({
					where: { project_id: projectId, wbs_id: data.wbs_parent_id },
					transaction,
				});

				if (!parent) {
					await transaction.rollback();
					return ServiceResponse.failure("Parent WBS not found", null, StatusCodes.BAD_REQUEST);
				}

				parentUuid = parent.dataValues.id;
				level = parent.dataValues.level + 1;

				if (parent.dataValues.is_leaf) {
					await this.wbsRepository.updateWBS(
						parent.dataValues.id,
						{ is_leaf: false, volume: 0, unit: null, total_cost: 0 },
						transaction,
					);

					await this.wbsRepository.deleteWBSCosts(parent.dataValues.id, transaction);
				}
			}

			const existing = await WBSModel.findOne({
				where: { project_id: projectId, wbs_id: data.wbs_id },
				transaction,
			});
			if (existing) {
				await transaction.rollback();
				return ServiceResponse.failure("WBS ID already exists", null, StatusCodes.CONFLICT);
			}

			if (data.unit === HouseUnits.GROUP) {
				if (!data.volume || data.volume === 0) {
					await transaction.rollback();
					return ServiceResponse.failure("Volume required", null, StatusCodes.BAD_REQUEST);
				}
				if (!data.total_cost || data.total_cost === 0) {
					await transaction.rollback();
					return ServiceResponse.failure("Cost required", null, StatusCodes.BAD_REQUEST);
				}

				const wbsGroup = await this.wbsRepository.createWBS(
					projectId,
					{
						...data,
						parent_uuid: parentUuid,
						total_cost: data.total_cost,
						level,
						sort_order: 0,
						volume: data.volume,
						unit: data.unit,
						project_id: projectId,
					},
					transaction,
				);

				const unitCost = data.total_cost / data.volume;

				for (let i = 1; i <= data.volume; i++) {
					const houseUnitName = generateHouseUnitName(data.description, i);

					await this.wbsRepository.createWBS(
						projectId,
						{
							...data,
							description: houseUnitName,
							wbs_id: `${wbsGroup.dataValues.wbs_id}.${i}`,
							parent_uuid: wbsGroup.dataValues.id,
							is_leaf: true,
							total_cost: unitCost,
							level: wbsGroup.dataValues.level + 1,
							sort_order: 0,
							volume: 1,
							unit: HouseUnits.UNIT,
							project_id: projectId,
						},
						transaction,
					);
				}
				await transaction.commit();
				return ServiceResponse.success("WBS item created successfully", null, StatusCodes.OK);
			}

			let totalCost = 0;
			const cbsCosts: { cbsId: string; cost: number }[] = [];

			if (data.is_leaf && data.cbs_category && data.volume && data.volume > 0) {
				for (const [cbsName, unitCost] of Object.entries(data.cbs_category)) {
					const cbs = await this.cbsRepository.findByName(cbsName);
					if (!cbs) {
						await transaction.rollback();
						return ServiceResponse.failure(`CBS Category '${cbsName}' not found`, null, StatusCodes.BAD_REQUEST);
					}
					const cost = cbs.dataValues.cost_type === CBSCostType.BORONGAN ? unitCost : unitCost * data.volume;
					totalCost += cost;
					cbsCosts.push({ cbsId: cbs.dataValues.id, cost: unitCost });
				}
			}

			const wbs = await this.wbsRepository.createWBS(
				projectId,
				{
					...data,
					parent_uuid: parentUuid,
					total_cost: totalCost,
					level,
					sort_order: 0,
					volume: data.volume || 0,
					unit: data.unit,
					project_id: projectId,
				},
				transaction,
			);

			if (cbsCosts.length > 0) {
				for (const item of cbsCosts) {
					await this.wbsRepository.upsertWBSCost(wbs.dataValues.id, item.cbsId, item.cost, transaction);
				}
			}

			await this.propagateCostDelta(wbs.dataValues.id, wbs.dataValues.total_cost, transaction);

			await transaction.commit();

			const result = await this.wbsRepository.findById(wbs.dataValues.id);
			if (!result) {
				return ServiceResponse.failure("Failed to create wbs item", null, StatusCodes.INTERNAL_SERVER_ERROR);
			}
			return ServiceResponse.success("WBS item created successfully", result.get({ plain: true }), StatusCodes.OK);
		} catch (error) {
			console.error("Error creating WBS:", error);
			return ServiceResponse.failure("Internal Server Error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async updateWBS(
		projectId: string,
		wbsCode: string,
		data: UpdateWbsDTO,
	): Promise<ServiceResponse<WBSAttributes | null>> {
		const transaction = await sequelize.transaction();

		try {
			const wbs = await WBSModel.findOne({
				where: { project_id: projectId, wbs_id: wbsCode },
				transaction,
			});

			if (!wbs) {
				await transaction.rollback();
				return ServiceResponse.failure("WBS item not found", null, StatusCodes.NOT_FOUND);
			}

			const wbsData = wbs.get({ plain: true });

			const updateData: Partial<WBSModel> = {};
			if (data.description !== undefined) updateData.description = data.description;
			if (data.volume !== undefined) updateData.volume = data.volume;
			if (data.unit !== undefined) updateData.unit = data.unit;
			if (data.is_leaf !== undefined) updateData.is_leaf = data.is_leaf;

			if (data.cbs_category) {
				for (const [cbsName, unitCost] of Object.entries(data.cbs_category)) {
					const cbs = await this.cbsRepository.findByName(cbsName);
					if (!cbs) {
						await transaction.rollback();
						return ServiceResponse.failure(`CBS Category '${cbsName}' not found`, null, StatusCodes.BAD_REQUEST);
					}
					const cbsData = cbs.get({ plain: true });
					await this.wbsRepository.upsertWBSCost(wbsData.id, cbsData.id, unitCost, transaction);
				}
			}

			const updatedWBS = await this.wbsRepository.updateWBS(wbsData.id, updateData, transaction);

			const updatedPlainWBS = updatedWBS.get({ plain: true });

			let delta = 0;

			if (updatedPlainWBS.unit == HouseUnits.UNIT && data.total_cost !== undefined) {
				const [affected, deltaUnit] = await this.wbsRepository.updateTotalCostUnitWBS(
					updatedPlainWBS.id,
					data.total_cost,
					transaction,
				);
				if (affected !== 1) {
					await transaction.rollback();
					return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
				}
				delta = deltaUnit;
			}

			const oldTotalCost = updatedPlainWBS.total_cost || 0;

			if (updatedPlainWBS.is_leaf && updatedPlainWBS.unit !== HouseUnits.UNIT) {
				const { WbsCostModel } = await import("../wbs_cost/wbsCostModel");
				// Fetch all costs with CBS category included to avoid N+1
				const allCosts = await WbsCostModel.findAll({
					where: { wbs_item_id: wbs.dataValues.id },
					include: [
						{
							model: (await import("../cbs/cbsModel")).CBSModel,
							as: "cbs_category",
						},
					],
					transaction,
				});

				let newTotal = 0;
				const currentVolume = data.volume !== undefined ? data.volume : updatedPlainWBS.volume;

				for (const c of allCosts) {
					const unitCost = Number(c.dataValues.unit_cost);

					const cbs = c.cbs_category;

					if (!cbs) {
						await transaction.rollback();
						return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
					}

					const cbsCostType = cbs.dataValues.cost_type;

					if (cbsCostType === CBSCostType.BORONGAN) {
						newTotal += unitCost;
					} else {
						newTotal += unitCost * Number(currentVolume || 1);
					}
				}

				delta = newTotal - oldTotalCost;

				if (delta !== 0 && updatedPlainWBS.unit !== HouseUnits.UNIT) {
					const affected = await this.wbsRepository.updateTotalCostWBS(updatedPlainWBS.id, newTotal, transaction);
					if (affected !== 1) {
						await transaction.rollback();
						return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
					}
				}
			}

			if (delta !== 0) {
				await this.propagateCostDelta(updatedPlainWBS.id, delta, transaction);
			}

			await transaction.commit();
			const result = await this.wbsRepository.findById(wbs.dataValues.id);
			if (!result) {
				return ServiceResponse.failure("WBS not found", null, StatusCodes.BAD_REQUEST);
			}
			return ServiceResponse.success("WBS item updated successfully", result.get({ plain: true }), StatusCodes.OK);
		} catch (error) {
			await transaction.rollback();
			console.error("Error updating WBS:", error);
			return ServiceResponse.failure("Internal Server Error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	private async propagateCostDelta(wbsId: string, delta: number, transaction: Transaction): Promise<void> {
		if (delta === 0) return;

		const currentInstance = await WBSModel.findOne({
			where: { id: wbsId },
			transaction,
		});

		if (!currentInstance) {
			throw new Error("WBS not found");
		}

		let currentPlain = currentInstance.get({ plain: true });

		while (currentPlain.parent_id) {
			const parentInstance = await WBSModel.findOne({
				where: { id: currentPlain.parent_id },
				transaction,
			});

			if (!parentInstance) {
				throw new Error("Parent not found");
			}

			await WBSModel.increment(
				{ total_cost: delta },
				{
					where: { id: parentInstance.dataValues.id },
					transaction,
				},
			);

			// pindah ke atas
			currentPlain = parentInstance.get({ plain: true });
		}
	}

	async deleteWBS(projectId: string, wbsCode: string): Promise<ServiceResponse<null>> {
		const transaction = await sequelize.transaction();

		try {
			// 1. Find the WBS item to delete
			const wbs = await WBSModel.findOne({
				where: { project_id: projectId, wbs_id: wbsCode },
				transaction,
			});

			if (!wbs) {
				await transaction.rollback();
				return ServiceResponse.failure("WBS item not found", null, StatusCodes.NOT_FOUND);
			}

			const wbsData = wbs.get({ plain: true });

			// 2. Find all descendants using wbs_id prefix (e.g., "1.2" finds "1.2.1", "1.2.2", "1.2.2.1")
			const descendants = await this.wbsRepository.findDescendantsByWbsIdPrefix(projectId, wbsCode, transaction);

			// 3. Collect all items to delete (main item + descendants)
			const allItemsToDelete = [wbsData, ...descendants.map((d) => d.get({ plain: true }))];
			const idsToDelete = allItemsToDelete.map((item) => item.id);

			// 4. Propagate negative cost to parent before deletion
			if (wbsData.total_cost > 0 && wbsData.parent_id) {
				await this.propagateCostDelta(wbsData.id, -wbsData.total_cost, transaction);
			}

			// 5. Delete all WBS costs (for main item and all descendants)
			for (const id of idsToDelete) {
				await this.wbsRepository.deleteWBSCosts(id, transaction);
			}

			// 6. Hard delete all WBS items (deepest first - descendants are already ordered DESC)
			for (const descendant of descendants) {
				await this.wbsRepository.deleteWBS(descendant.dataValues.id, transaction);
			}
			// Delete the main item last
			await this.wbsRepository.deleteWBS(wbsData.id, transaction);

			// 7. Reindex ALL remaining WBS items in the project
			await this.reindexAllWBS(projectId, transaction);

			await transaction.commit();
			return ServiceResponse.success(
				`WBS item and ${descendants.length} children deleted successfully`,
				null,
				StatusCodes.OK,
			);
		} catch (error) {
			await transaction.rollback();
			console.error("Error deleting WBS:", error);
			return ServiceResponse.failure("Internal Server Error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Reindex all WBS items in a project to ensure sequential numbering
	 * Based on API contract section 6.1 (lines 505-566)
	 * @param projectId - The project ID
	 * @param transaction - Database transaction
	 */
	private async reindexAllWBS(projectId: string, transaction: Transaction): Promise<void> {
		try {
			// 1. Get all active items ordered by wbs_id
			const allItems = await this.wbsRepository.getAllWBSByProject(projectId, transaction);

			// 2. Group by parent_id (use parent_id UUID, not wbs_parent_id string)
			const byParent = new Map<string | null, WBSModel[]>();
			for (const item of allItems) {
				const itemData = item.dataValues;
				const parentId = itemData.parent_id || null;
				if (!byParent.has(parentId)) {
					byParent.set(parentId, []);
				}
				byParent.get(parentId)!.push(item);
			}

			// 3. Prepare updates array
			const updates: Array<{ id: string; wbs_id: string; level: number }> = [];

			// 4. Recursive function to reassign wbs_ids
			const processChildren = (parentWbsId: string, parentUuid: string | null, level: number) => {
				const children = byParent.get(parentUuid) || [];

				children.forEach((child, index) => {
					const childData = child.dataValues;
					const newWbsId = parentWbsId ? `${parentWbsId}.${index + 1}` : `${index + 1}`;
					const newLevel = level + 1;

					// Only update if changed
					if (childData.wbs_id !== newWbsId || childData.level !== newLevel) {
						updates.push({
							id: childData.id,
							wbs_id: newWbsId,
							level: newLevel,
						});
					}

					// Recursively process this item's children
					processChildren(newWbsId, childData.id, newLevel);
				});
			};

			// 5. Start with root items (parent_id = null)
			processChildren("", null, 0);

			// 6. Apply all updates
			if (updates.length > 0) {
				await this.wbsRepository.batchUpdateWbsIds(updates, transaction);
			}
		} catch (error) {
			console.error("Error in reindexAllWBS:", error);
			throw error; // Re-throw to be caught by parent
		}
	}
}
