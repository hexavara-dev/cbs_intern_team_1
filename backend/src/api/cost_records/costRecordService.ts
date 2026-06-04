import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../../db/sequelize";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { toWBSDetailCostReport } from "../../common/utils/mapper";
import { deleteFile } from "../../common/utils/uploadFile";
import { logger } from "../../server";
import { CBSRepository } from "../cbs/cbsRepository";
import { ProjectCBSRepository } from "../project_cbs/projectCbsRepository";
import { UserModel } from "../user/userModel";
import { VendorModel } from "../vendor/vendorModel";
import type { GetTotalCost } from "../wbs/wbsDTO";
import type {
	ApproveCostRecordDTO,
	CostRecordCostItem,
	CreateCostRecordDTO,
	CreatedCostRecordDTO,
	GetAllProjectsCostRecordDTO,
	GetDetailtProjectCostRecordDTO,
	GetDetailWBSCostReportDTO,
	GetProjectCostRecordDTO,
	GetSummaryProjectCost,
	GetTotalCostRecordPerCategory,
	GetWBSCostReportDTO,
	RejectCostRecordDTO,
	RejectCostRecordReasonDTO,
} from "./costRecordDTO";
import { CostRecordRepository } from "./costRecordRepository";

export class CostRecordService {
	private costRecordRepository: CostRecordRepository;
	private projectCbsRepository: ProjectCBSRepository;
	private cbsRepository: CBSRepository;
	constructor(
		costRecordrepository: CostRecordRepository = new CostRecordRepository(),
		projectCbsRepository: ProjectCBSRepository = new ProjectCBSRepository(),
		cbsRepository: CBSRepository = new CBSRepository(),
	) {
		this.costRecordRepository = costRecordrepository;
		this.projectCbsRepository = projectCbsRepository;
		this.cbsRepository = cbsRepository;
	}

	async getAllProjectCostRecord(
		userId: string,
		projectName?: string,
	): Promise<ServiceResponse<GetAllProjectsCostRecordDTO[] | null>> {
		try {
			const projectRecords = await this.costRecordRepository.getAllProjectCostRecord(userId, projectName);

			if (projectRecords.length === 0) {
				return ServiceResponse.success("No records found", null, StatusCodes.OK);
			}

			const result: GetAllProjectsCostRecordDTO[] = projectRecords.flatMap((record) => {
				const costRecord = record.get({ plain: true });
				const wbs = record.wbs.get({ plain: true });
				const vendor = record.vendor.get({ plain: true });
				const itemsData: CostRecordCostItem[] = record.cost_items.map((item) => {
					return {
						id: item.dataValues.id,
						description: item.dataValues.description,
						cbs_category: {
							id: item.cbs_category?.dataValues.id,
							name: item.cbs_category?.dataValues.name,
							cost_type: item.cbs_category?.dataValues.cost_type,
						},
						unit_cost: Number(item.dataValues.unit_cost),
						quantity: item.dataValues.quantity,
						total: Number(item.dataValues.total),
					};
				});

				return {
					id: costRecord.id,
					project_id: costRecord.project_id,
					project_name: record.project.dataValues.name,
					activity_name: costRecord.activity_name,
					wbs_item: {
						id: wbs.id,
						wbs_code: wbs.wbs_id,
						description: wbs.description,
					},
					vendor: {
						id: vendor.id,
						name: vendor.name,
					},
					transaction_date: costRecord.transaction_date,
					status: costRecord.status,
					total_amount: Number(costRecord.total_amount),
					items: itemsData,
					created_at: costRecord.created_at,
				};
			});

			return ServiceResponse.success("Projects records retrieve successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);
			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getProjectCostRecord(projectId: string): Promise<ServiceResponse<GetProjectCostRecordDTO[] | null>> {
		try {
			const projectRecord = await this.costRecordRepository.getProjectCostRecord(projectId);
			if (!projectRecord) {
				return ServiceResponse.success("No cost record has been created", null, StatusCodes.OK);
			}

			const result: GetProjectCostRecordDTO[] = projectRecord.map((record) => {
				const costRecord = record.record.get({ plain: true });
				const wbs = record.record.wbs.get({ plain: true });
				const vendor = record.record.vendor.get({ plain: true });
				const itemsData: CostRecordCostItem[] = record.record.cost_items.map((item) => {
					return {
						id: item.dataValues.id,
						description: item.dataValues.description,
						cbs_category: {
							id: item.cbs_category?.dataValues.id,
							name: item.cbs_category?.dataValues.name,
							cost_type: item.cbs_category?.dataValues.cost_type,
						},
						unit_cost: Number(item.dataValues.unit_cost),
						quantity: item.dataValues.quantity,
						total: Number(item.dataValues.total),
					};
				});

				return {
					id: costRecord.id,
					project_id: costRecord.project_id,
					activity_name: costRecord.activity_name,
					wbs_item: {
						id: wbs.id,
						wbs_code: wbs.wbs_id,
						description: wbs.description,
					},
					vendor: {
						id: vendor.id,
						name: vendor.name,
					},
					transaction_date: costRecord.transaction_date,
					status: costRecord.status,
					total_amount: Number(costRecord.total_amount),
					item_count: record.item_count,
					items: itemsData,
					created_at: costRecord.created_at,
				};
			});
			return ServiceResponse.success("Project cost record retrieve successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async prosesCostRecord(
		projectId: string,
		costRecordId: string,
	): Promise<ServiceResponse<GetDetailtProjectCostRecordDTO | null>> {
		try {
			const costRecord = await this.costRecordRepository.prosesCostRecord(projectId, costRecordId);
			if (!costRecord) {
				return ServiceResponse.failure("Cost record not found", null, StatusCodes.NOT_FOUND);
			}
			const recordData = costRecord.get({ plain: true });

			const wbs = costRecord.wbs?.get({ plain: true });
			const vendor = costRecord.vendor?.get({ plain: true });
			const submitter = costRecord.submitter?.get({ plain: true });
			let approver: { id: string; full_name: string } | null = null;

			if (recordData.approved_by) {
				const user = await UserModel.findOne({
					where: { id: recordData.approved_by },
					attributes: ["id", "full_name"],
				});

				if (user) {
					const userData = user.get({ plain: true });
					approver = {
						id: userData.id,
						full_name: userData.full_name,
					};
				}
			}

			const costRecordItem: CostRecordCostItem[] =
				costRecord.cost_items?.map((item) => {
					const itemData = item.get({ plain: true });
					const cbs = item.cbs_category?.get({ plain: true });

					return {
						id: itemData.id,
						description: itemData.description,
						cbs_category: {
							id: cbs?.id ?? "",
							name: cbs?.name ?? "",
							cost_type: cbs?.cost_type ?? "",
						},
						unit_cost: Number(itemData.unit_cost),
						quantity: Number(itemData.quantity),
						total: Number(itemData.total),
					};
				}) ?? [];

			const result: GetDetailtProjectCostRecordDTO = {
				id: recordData.id,
				project_id: recordData.project_id,
				activity_name: recordData.activity_name,
				wbs_item: {
					id: wbs?.id ?? "",
					wbs_code: wbs?.wbs_id ?? "",
					description: wbs?.description ?? "",
				},
				vendor: {
					id: vendor?.id ?? "",
					name: vendor?.name ?? "",
				},
				transaction_date: recordData.transaction_date,
				status: recordData.status,
				nota_proof: `nota/${recordData.nota_proof_url}`,
				total_amount: Number(recordData.total_amount),
				items: costRecordItem,
				item_count: costRecordItem.length,
				submitted_by: {
					id: submitter?.id ?? "",
					full_name: submitter?.full_name ?? "",
				},
				approved_by: approver,
				approved_at: recordData.approved_at,
				approved_file: `bukti/${recordData.approved_file}`,
				rejection_reason: recordData.rejected_reason ?? undefined,
				created_at: recordData.created_at,
			};

			return ServiceResponse.success("Proses cost record", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getDetailCostRecord(
		projectId: string,
		recordId: string,
	): Promise<ServiceResponse<GetDetailtProjectCostRecordDTO | null>> {
		try {
			const record = await this.costRecordRepository.getDetailCostRecord(projectId, recordId);

			if (!record) {
				return ServiceResponse.failure("Cost record not found", null, StatusCodes.NOT_FOUND);
			}

			const recordData = record.get({ plain: true });

			const wbs = record.wbs?.get({ plain: true });
			const vendor = record.vendor?.get({ plain: true });
			const submitter = record.submitter?.get({ plain: true });
			let approver: { id: string; full_name: string } | null = null;

			if (recordData.approved_by) {
				const user = await UserModel.findOne({
					where: { id: recordData.approved_by },
					attributes: ["id", "full_name"],
				});

				if (user) {
					const userData = user.get({ plain: true });
					approver = {
						id: userData.id,
						full_name: userData.full_name,
					};
				}
			}

			const costRecordItem: CostRecordCostItem[] =
				record.cost_items?.map((item) => {
					const itemData = item.get({ plain: true });
					const cbs = item.cbs_category?.get({ plain: true });

					return {
						id: itemData.id,
						description: itemData.description,
						cbs_category: {
							id: cbs?.id ?? "",
							name: cbs?.name ?? "",
							cost_type: cbs?.cost_type ?? "",
						},
						unit_cost: Number(itemData.unit_cost),
						quantity: Number(itemData.quantity),
						total: Number(itemData.total),
					};
				}) ?? [];

			const result: GetDetailtProjectCostRecordDTO = {
				id: recordData.id,
				project_id: recordData.project_id,
				activity_name: recordData.activity_name,
				wbs_item: {
					id: wbs?.id ?? "",
					wbs_code: wbs?.wbs_id ?? "",
					description: wbs?.description ?? "",
				},
				vendor: {
					id: vendor?.id ?? "",
					name: vendor?.name ?? "",
				},
				transaction_date: recordData.transaction_date,
				status: recordData.status,
				nota_proof: `nota/${recordData.nota_proof_url}`,
				total_amount: Number(recordData.total_amount),
				items: costRecordItem,
				item_count: costRecordItem.length,
				submitted_by: {
					id: submitter?.id ?? "",
					full_name: submitter?.full_name ?? "",
				},
				approved_by: approver,
				approved_at: recordData.approved_at,
				approved_file: `bukti/${recordData.approved_file}`,
				rejection_reason: recordData.rejected_reason ?? undefined,
				created_at: recordData.created_at,
			};

			return ServiceResponse.success("Cost record detail retreive successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Failed to get cost record detail", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getCostSummary(projectId: string): Promise<ServiceResponse<GetSummaryProjectCost | null>> {
		try {
			const projectDetail = await this.costRecordRepository.getProjectBudget(projectId);
			if (!projectDetail) {
				return ServiceResponse.failure("Project not found", null, StatusCodes.BAD_REQUEST);
			}

			const projectCbsCategory = await this.projectCbsRepository.findAllByProject(projectId);
			const result: GetSummaryProjectCost = {
				project_id: projectId,
				budget: Number(projectDetail.dataValues.budget),
				total_actual_cost: 0,
				by_cbs_category: [],
			};

			if (projectCbsCategory.length === 0) {
				return ServiceResponse.success("No cost summary", result, StatusCodes.OK);
			}

			const cbsCostResults = await Promise.all(
				projectCbsCategory.map(async (cbs) => {
					const cbsDetail = await this.cbsRepository.findById(cbs.dataValues.cbs_category_id);
					if (!cbsDetail?.dataValues) {
						throw new Error(`Invalid cbs id: ${cbs.dataValues.id}`);
					}

					const plannedCost = await this.costRecordRepository.getPlannedTotalCostPerCategory(
						projectId,
						cbsDetail.dataValues.id,
					);
					const actualCost = await this.costRecordRepository.getActualTotalCostPerCategory(
						projectId,
						cbsDetail.dataValues.id,
					);

					return {
						cbs_category_id: cbsDetail.dataValues.id,
						cbs_name: cbsDetail.dataValues.name,
						cost_type: cbsDetail.dataValues.cost_type,
						planned_cost: Number(plannedCost) ?? 0,
						actual_cost: Number(actualCost) ?? 0,
					} as GetTotalCostRecordPerCategory;
				}),
			);

			result.total_actual_cost = Number(cbsCostResults.reduce((sum, c) => sum + c.actual_cost, 0));
			result.by_cbs_category = cbsCostResults;

			return ServiceResponse.success("Cost summary retrieved", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);
			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getWBSCostReport(projectId: string): Promise<ServiceResponse<GetWBSCostReportDTO[] | null>> {
		try {
			const wbsCostReport = await this.costRecordRepository.getWBSCostReport(projectId);
			if (wbsCostReport.length === 0) {
				return ServiceResponse.failure("No wbs created yet", null, StatusCodes.OK);
			}
			const result: GetWBSCostReportDTO[] = wbsCostReport.map((wbs) => ({
				id: wbs.id,
				wbs_id: wbs.wbs_id,
				description: wbs.description,
				is_leaf: wbs.is_leaf,
				planned_cost: Number(wbs.total_cost),
				actual_cost: Number(wbs.actual_cost),
			}));
			return ServiceResponse.success("WBS cost monitoring data retrieved successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getWBSCostReportDetail(
		projectId: string,
		wbsId: string,
	): Promise<ServiceResponse<GetDetailWBSCostReportDTO | null>> {
		try {
			const detailWbsCostReport = await this.costRecordRepository.getWBSCostReportWithRecord(projectId, wbsId);
			if (!detailWbsCostReport) {
				return ServiceResponse.failure("No WBS cost report approved yet", null, StatusCodes.BAD_REQUEST);
			}
			const result = toWBSDetailCostReport(detailWbsCostReport);
			return ServiceResponse.success("WBS item cost details retrieved successfully", result, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getTotalCost(projectId: string): Promise<ServiceResponse<GetTotalCost | null>> {
		try {
			const totalCost = await this.costRecordRepository.getTotalCostRecord(projectId);
			return ServiceResponse.success("Total cost retrieved successfully", { total_cost: totalCost }, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async makeCostRecord(
		projectId: string,
		userId: string,
		path: string,
		fileUrl: string,
		data: CreateCostRecordDTO,
	): Promise<ServiceResponse<CreatedCostRecordDTO | null>> {
		const transaction = await sequelize.transaction();

		try {
			if (!Array.isArray(data.items)) {
				await transaction.rollback();
				await deleteFile(path);
				return ServiceResponse.failure("Items must be an array", null, StatusCodes.BAD_REQUEST);
			}

			const vendor = await VendorModel.findOne({
				where: { id: data.vendor_id },
				transaction,
			});

			if (!vendor) {
				await transaction.rollback();
				await deleteFile(path);
				return ServiceResponse.failure("Vendor not found", null, StatusCodes.BAD_REQUEST);
			}

			const result = await this.costRecordRepository.create(projectId, userId, fileUrl, data, transaction);

			await transaction.commit();

			const costRecord = result.record.get({ plain: true });
			const vendorPlain = vendor.get({ plain: true });

			const costRecordData: CreatedCostRecordDTO = {
				id: costRecord.id,
				status: costRecord.status,
				total_amount: Number(costRecord.total_amount),
				items_count: result.item_count,
				vendor: {
					id: vendorPlain.id,
					name: vendorPlain.name,
				},
				created_at: costRecord.created_at,
			};

			return ServiceResponse.success("Cost request submitted successfully", costRecordData, StatusCodes.OK);
		} catch (err) {
			await transaction.rollback();
			await deleteFile(path);
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async approve(
		recordId: string,
		userId: string,
		path: string,
		fileUrl: string,
	): Promise<ServiceResponse<ApproveCostRecordDTO | null>> {
		try {
			const user = await UserModel.findOne({ where: { id: userId } });
			if (!user) {
				await deleteFile(path);
				return ServiceResponse.failure("User not found", null, StatusCodes.BAD_REQUEST);
			}
			const costRecord = await this.costRecordRepository.approve(recordId, userId, fileUrl);
			if (!costRecord) {
				await deleteFile(path);
				return ServiceResponse.failure("Cost record not found", null, StatusCodes.BAD_REQUEST);
			}
			const costRecordData = costRecord.get({ plain: true });
			const useData = user.get({ plain: true });
			const res: ApproveCostRecordDTO = {
				id: costRecordData.id,
				status: costRecordData.status,
				approved_by: { id: useData.id, full_name: useData.full_name },
				approved_at: costRecordData.approved_at,
			};
			return ServiceResponse.success("Cost request approved successfully", res, StatusCodes.OK);
		} catch (err) {
			logger.error(err);
			await deleteFile(path);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async reject(
		recordId: string,
		data: RejectCostRecordReasonDTO,
	): Promise<ServiceResponse<RejectCostRecordDTO | null>> {
		try {
			const costRecord = await this.costRecordRepository.reject(recordId, data);
			if (!costRecord) {
				return ServiceResponse.failure("Cost record not found", null, StatusCodes.BAD_REQUEST);
			}
			const costRecordData = costRecord.get({ plain: true });

			const res: RejectCostRecordDTO = {
				id: costRecordData.id,
				status: costRecordData.status,
				rejection_reasone: data.reason,
				updated_at: costRecordData.updated_at,
			};
			return ServiceResponse.success("Cost request rejected", res, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const costRecordService = new CostRecordService();
