import type { Transaction, WhereOptions } from "sequelize";
import { col, fn, Op } from "sequelize";
import { getCurrentDate } from "../../common/utils/getDate";
import { CBSModel } from "../cbs/cbsModel";
import { CBSCostType } from "../cbs/cbsSchema";
import { type CostItemCreationAttributes, CostItemModel } from "../cost_items/costItemModel";
import { ProjectModel } from "../projects/projectModel";
import { UserModel } from "../user/userModel";
import { VendorModel } from "../vendor/vendorModel";
import { WBSModel } from "../wbs/wbsModel";
import { WbsCostModel } from "../wbs_cost/wbsCostModel";
import type { CreateCostRecordDTO, RejectCostRecordReasonDTO } from "./costRecordDTO";
import { type CostRecordCreationAttribute, CostRecordModel, CostRecordStatus } from "./costRecordModel";

interface CreateCostRecordResponse {
	record: CostRecordModel;
	item_count: number;
}

interface GetProjectCostRecord {
	record: CostRecordModel;
	item_count: number;
}

export class CostRecordRepository {
	async getAllProjectCostRecord(userId: string, projectName?: string): Promise<CostRecordModel[]> {
		const allProjectRecords: CostRecordModel[] = [];

		const projectWhere: WhereOptions = {
			created_by: userId,
		};

		if (projectName) {
			projectWhere.name = { [Op.iLike]: `%${projectName}%` };
		}

		const userProjects = await ProjectModel.findAll({
			where: projectWhere,
			attributes: ["id", "name"],
		});

		for (const project of userProjects) {
			const projectRecords = await CostRecordModel.findAll({
				where: {
					project_id: project.dataValues.id,
				},
				include: [
					{
						model: VendorModel,
						as: "vendor",
						attributes: ["id", "name"],
					},
					{
						model: ProjectModel,
						as: "project",
						attributes: ["name"],
					},
					{
						model: WBSModel,
						as: "wbs",
					},
					{
						model: CostItemModel,
						as: "cost_items",
						include: [
							{
								model: CBSModel,
								as: "cbs_category",
							},
						],
					},
					{
						model: UserModel,
						as: "submitter",
					},
				],
				order: [["created_at", "DESC"]],
			});

			allProjectRecords.push(...projectRecords);
		}
		return allProjectRecords;
	}

	async getProjectCostRecord(projectId: string): Promise<GetProjectCostRecord[] | null> {
		const projectCostRecord = await CostRecordModel.findAll({
			where: { project_id: projectId },
			include: [
				{
					model: VendorModel,
					as: "vendor",
					attributes: ["id", "name"],
				},
				{
					model: WBSModel,
					as: "wbs",
				},
				{
					model: CostItemModel,
					as: "cost_items",
					include: [
						{
							model: CBSModel,
							as: "cbs_category",
							attributes: ["id", "name", "cost_type"],
						},
					],
				},
			],
			order: [["created_at", "DESC"]],
		});
		if (projectCostRecord.length === 0) {
			return null;
		}

		return projectCostRecord.map((record) => {
			return {
				record,
				item_count: record.cost_items.length ?? 0,
			};
		});
	}

	async getDetailCostRecord(projectId: string, recordId: string): Promise<CostRecordModel | null> {
		return await CostRecordModel.findOne({
			where: {
				project_id: projectId,
				id: recordId,
			},
			include: [
				{
					model: VendorModel,
					as: "vendor",
					attributes: ["id", "name"],
				},
				{
					model: WBSModel,
					as: "wbs",
				},
				{
					model: CostItemModel,
					as: "cost_items",
					include: [
						{
							model: CBSModel,
							as: "cbs_category",
						},
					],
				},
				{
					model: UserModel,
					as: "submitter",
				},
			],
			order: [["created_at", "DESC"]],
		});
	}

	async create(
		projectId: string,
		userId: string,
		fileUrl: string,
		data: CreateCostRecordDTO,
		transaction: Transaction,
	): Promise<CreateCostRecordResponse> {
		const newCostRecord: CostRecordCreationAttribute = {
			project_id: projectId,
			wbs_item_id: data.wbs_item_id,
			vendor_id: data.vendor_id,
			activity_name: data.activity_name,
			transaction_date: data.transaction_date,
			status: CostRecordStatus.PENDING,
			nota_proof_url: fileUrl,
			total_amount: data.total_amount,
			submitted_by: userId,
		};

		const recordCost = await CostRecordModel.create(newCostRecord, {
			transaction,
		});

		const recordCostItems: CostItemCreationAttributes[] = data.items.map((item) => ({
			cost_record_id: recordCost.dataValues.id,
			cbs_category_id: item.cbs_category_id,
			description: item.description,
			unit_cost: item.unit_cost,
			quantity: item.quantity,
			total: item.total,
		}));

		const createdItems = await CostItemModel.bulkCreate(recordCostItems, {
			transaction,
		});

		return {
			record: recordCost,
			item_count: createdItems.length,
		};
	}

	async getProjectBudget(projectId: string): Promise<ProjectModel | null> {
		return await ProjectModel.findOne({
			where: { id: projectId },
			attributes: ["id", "budget"],
		});
	}

	async getTotalCostRecord(projectId: string): Promise<number> {
		return await CostRecordModel.sum("total_amount", {
			where: { project_id: projectId, status: CostRecordStatus.APPROVED },
		});
	}

	async getActualTotalCostPerCategory(projectId: string, cbsCategoryId: string): Promise<number> {
		const approvedRecords = await CostRecordModel.findAll({
			where: {
				project_id: projectId,
				status: CostRecordStatus.APPROVED,
			},
			include: [
				{
					model: CostItemModel,
					as: "cost_items",
					where: { cbs_category_id: cbsCategoryId },
				},
			],
		});

		let total = 0;

		if (approvedRecords.length === 0) return total;

		for (const record of approvedRecords) {
			for (const item of record.cost_items) {
				total += Number(item.dataValues.total);
			}
		}

		return total;
	}

	async getWBSCostReport(projectId: string): Promise<WBSModel[]> {
		const { literal } = await import("sequelize");
		return await WBSModel.findAll({
			where: {
				project_id: projectId,
			},
			attributes: [
				"id",
				"wbs_id",
				"description",
				"is_leaf",
				"total_cost",
				[fn("COALESCE", fn("SUM", col("cost_records.total_amount")), 0), "actual_cost"],
			],
			include: [
				{
					model: CostRecordModel,
					as: "cost_records",
					attributes: [],
					where: {
						status: CostRecordStatus.APPROVED,
					},
					required: false,
				},
			],
			order: [literal(`string_to_array(wbs_id, '.')::int[] ASC`)],
			group: ["WBS.id"],
			raw: true,
		});
	}

	async getWBSCostReportWithRecord(projectId: string, wbsId: string): Promise<WBSModel | null> {
		return await WBSModel.findOne({
			where: { id: wbsId, project_id: projectId },
			include: [
				{
					model: CostRecordModel,
					as: "cost_records",
					include: [
						{
							model: VendorModel,
							as: "vendor",
						},
						{
							model: CostItemModel,
							as: "cost_items",
							include: [
								{
									model: CBSModel,
									as: "cbs_category",
								},
							],
						},
						{
							model: UserModel,
							as: "submitter",
						},
						{
							model: UserModel,
							as: "approver",
						},
					],
				},
			],
		});
	}

	async getPlannedTotalCostPerCategory(projectId: string, cbsCategoryId: string): Promise<number> {
		const projectWbs = await WBSModel.findAll({
			where: { project_id: projectId },
			include: [
				{
					model: WbsCostModel,
					as: "costs",
					where: {
						cbs_category_id: cbsCategoryId,
					},
					required: false,
					include: [
						{
							model: CBSModel,
							as: "cbs_category",
						},
					],
				},
			],
		});

		if (projectWbs.length === 0) return 0;

		let plannedCost = 0;

		for (const wbs of projectWbs) {
			const volume = wbs.dataValues.volume ?? 0;

			if (wbs.costs.length === 0) {
				plannedCost += Number(wbs.dataValues.total_cost);
				continue;
			}

			for (const cost of wbs.costs ?? []) {
				const costType = cost.cbs_category.dataValues.cost_type;

				if (costType === CBSCostType.PER_ITEM) {
					plannedCost += Number(cost.dataValues.unit_cost) * volume;
				}

				if (costType === CBSCostType.BORONGAN) {
					plannedCost += Number(cost.dataValues.unit_cost);
				}
			}
		}

		return plannedCost;
	}

	async approve(recordId: string, userId: string, fileUrl: string): Promise<CostRecordModel | null> {
		const costRecord = await CostRecordModel.update(
			{
				approved_by: userId,
				approved_at: getCurrentDate(),
				status: CostRecordStatus.APPROVED,
				approved_file: fileUrl,
			},
			{ where: { id: recordId } },
		);
		if (costRecord[0] === 0) {
			return null;
		}
		return await CostRecordModel.findOne({ where: { id: recordId } });
	}

	async reject(recordId: string, data: RejectCostRecordReasonDTO): Promise<CostRecordModel | null> {
		const costRecord = await CostRecordModel.update(
			{
				status: CostRecordStatus.REJECTED,
				rejected_reason: data.reason,
			},
			{ where: { id: recordId } },
		);
		if (costRecord[0] === 0) {
			return null;
		}
		return await CostRecordModel.findOne({ where: { id: recordId } });
	}

	async prosesCostRecord(projectId: string, recordId: string): Promise<CostRecordModel | null> {
		const costRecord = await CostRecordModel.update(
			{
				status: CostRecordStatus.ON_PROSES,
			},
			{ where: { id: recordId, project_id: projectId } },
		);

		if (costRecord[0] === 0) {
			return null;
		}

		return await CostRecordModel.findOne({
			where: { id: recordId },
			include: [
				{
					model: VendorModel,
					as: "vendor",
					attributes: ["id", "name"],
				},
				{
					model: WBSModel,
					as: "wbs",
				},
				{
					model: CostItemModel,
					as: "cost_items",
					include: [
						{
							model: CBSModel,
							as: "cbs_category",
						},
					],
				},
				{
					model: UserModel,
					as: "submitter",
				},
			],
		});
	}
}
