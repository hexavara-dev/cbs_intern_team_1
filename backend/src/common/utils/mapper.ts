import type { GetCBSDTO } from "../../api/cbs/cbsDTO";
import type { CBSAttributes } from "../../api/cbs/cbsModel";
import type { CostInDetailDTO, GetProjectCostInDTO, TerminCostInInformation } from "../../api/cost_in/costInDTO";
import type { CostInModel } from "../../api/cost_in/costInModel";
import type { GetCostItemDescriptionDTO } from "../../api/cost_item_description/costItemDescriptionDTO";
import type { CostItemDescriptionAttribute } from "../../api/cost_item_description/costItemDescriptionModel";
import type {
	CostRecordCostItem,
	CostRecordDetail,
	GetDetailWBSCostReportDTO,
	GetWBSCostReportDTO,
} from "../../api/cost_records/costRecordDTO";
import type {
	GetProgressHistory,
	GetWBSProgressDTO,
	ProgressInformation,
	TerminProgressSummary,
} from "../../api/progress/progressDTO";
import type { ProgressModel } from "../../api/progress/progressModel";
import type { GetProjectDetailDTO, GetProjectDTO, ProjectTerminDTO } from "../../api/projects/projectDTO";
import type { ProjectAttributes } from "../../api/projects/projectModel";
import type { GetTermin } from "../../api/termin/terminDTO";
import { type TerminAttributes, TerminCategory, type TerminModel } from "../../api/termin/terminModel";
import type {
	GetTerminWBSAllocationDTO,
	TerminAllocationInformation,
} from "../../api/termin_allocations/terminAllocationDTO";
import type { GetUserDTO } from "../../api/user/userDTO";
import type { UserAttributes } from "../../api/user/userModel";
import type { GetProjectWBSDTO, WBSCost, WBSLeaf } from "../../api/wbs/wbsDTO";
import type { WBSAttributes, WBSModel } from "../../api/wbs/wbsModel";
import type { WbsCostModel } from "../../api/wbs_cost/wbsCostModel";

export function toUser(model: UserAttributes): GetUserDTO {
	return {
		id: model.id,
		email: model.email,
		full_name: model.full_name ?? "",
		phone: model.phone ?? "",
		role: model.role,
	};
}

export function toCBS(model: CBSAttributes): GetCBSDTO {
	return {
		id: model.id,
		name: model.name,
		cost_type: model.cost_type,
		description: model.description,
	};
}

export function toProject(model: ProjectAttributes): GetProjectDTO {
	return {
		id: model.id,
		name: model.name,
		description: model.description,
		location: model.location,
		budget: Number(model.budget),
		start_date: model.start_date,
		end_date: model.end_date,
		is_termin_by_progress: model.is_termin_by_progress,
		created_by: model.created_by,
		status: model.status,
		progress: Number(model.progress),
	};
}

export function toProjectDetail(model: ProjectAttributes, termin: TerminAttributes[]): GetProjectDetailDTO {
	const projectTermin: ProjectTerminDTO[] = termin.map((termin) => {
		return {
			id: termin.id,
			sequence: termin.sequence,
			description: termin.description,
			nominal: Number(termin.nominal),
			category: termin.category,
			percentage: termin.percentage,
		};
	});

	const totalAdendumBudget = termin
		.filter((item) => item.category === TerminCategory.ADENDUM)
		.reduce((acc, item) => acc + item.nominal, 0);

	return {
		id: model.id,
		name: model.name,
		description: model.description,
		location: model.location,
		budget: Number(model.budget),
		start_date: model.start_date,
		end_date: model.end_date,
		created_by: model.created_by,
		status: model.status,
		is_termin_by_progress: model.is_termin_by_progress,
		progress: Number(model.progress),
		total_adendum: Number(totalAdendumBudget),
		termin: projectTermin,
	};
}
export function toWBS(wbs: WBSAttributes, wbsCost: WbsCostModel[]): GetProjectWBSDTO {
	const costs: WBSCost[] = wbsCost.map((cost) => {
		return {
			id: cost.dataValues.id,
			wbs_item_id: cost.dataValues.wbs_item_id,
			cbs_category_id: cost.dataValues.cbs_category_id,
			unit_cost: Number(cost.dataValues.unit_cost),
			updated_at: cost.dataValues.updated_at,
		};
	});

	return {
		id: wbs.id,
		wbs_id: wbs.wbs_id,
		parent_id: wbs.parent_id,
		description: wbs.description,
		total_cost: Number(wbs.total_cost),
		level: wbs.level,
		volume: wbs.volume,
		unit: wbs.unit,
		is_leaf: wbs.is_leaf,
		costs: costs,
	};
}
export function toCostItemDescription(costItemDesc: CostItemDescriptionAttribute): GetCostItemDescriptionDTO {
	return {
		description: costItemDesc.description,
	};
}
export function toLeafWBS(wbs: WBSAttributes): WBSLeaf {
	return {
		id: wbs.id,
		wbs_id: wbs.wbs_id,
		description: wbs.description,
	};
}
export function toTermin(termin: TerminModel): GetTermin {
	return {
		id: termin.dataValues.id,
		project_id: termin.dataValues.project_id,
		description: termin.dataValues.description,
		category: termin.dataValues.category,
		sequence: termin.dataValues.sequence,
		nominal: Number(termin.dataValues.nominal),
		percentage: Number(termin.dataValues.percentage),
	};
}
export function toAllocatedWbs(wbs: WBSModel): GetTerminWBSAllocationDTO {
	const wbsTerminInformation: TerminAllocationInformation[] =
		wbs.termin_allocations.map((alloc) => {
			const terminInfo = alloc.termin.get({ plain: true });
			return {
				id: alloc.dataValues.id,
				termin_id: terminInfo.id,
				termin_sequence: terminInfo.sequence,
				termin_category: terminInfo.category,
				volume: Number(alloc.dataValues.actual_volume),
			};
		}) ?? [];

	return {
		id: wbs.dataValues.id,
		wbs_id: wbs.dataValues.wbs_id,
		description: wbs.dataValues.description,
		level: wbs.dataValues.level,
		volume: wbs.dataValues.volume,
		unit: wbs.dataValues.unit,
		is_leaf: wbs.dataValues.is_leaf,
		parent_id: wbs.dataValues.parent_id,
		allocations: wbsTerminInformation,
	};
}

export function toWBSDetailCostReport(wbs: WBSModel): GetDetailWBSCostReportDTO {
	const wbsInfo: GetWBSCostReportDTO = {
		id: wbs.dataValues.id,
		wbs_id: wbs.dataValues.wbs_id,
		description: wbs.dataValues.description,
		is_leaf: wbs.dataValues.is_leaf,
		planned_cost: Number(wbs.dataValues.total_cost),
		actual_cost: 0, // akan diisi setelah loop
	};

	let totalActualCost = 0;

	const costRecords: CostRecordDetail[] = (wbs.cost_records ?? []).map((record) => {
		const items: CostRecordCostItem[] = (record.cost_items ?? []).map((item) => ({
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
		}));

		totalActualCost += record.dataValues.total_amount ?? 0;

		return {
			id: record.dataValues.id,
			project_id: record.dataValues.project_id,
			activity_name: record.dataValues.activity_name,
			wbs_item: {
				id: wbs.dataValues.id,
				wbs_code: wbs.dataValues.wbs_id,
				description: wbs.dataValues.description,
			},
			vendor: {
				id: record.vendor.dataValues.id,
				name: record.vendor.dataValues.name,
			},
			transaction_date: record.dataValues.transaction_date,
			status: record.dataValues.status,
			total_amount: Number(record.dataValues.total_amount),
			item_count: items.length,
			items,
			created_at: record.dataValues.created_at,

			submitted_by: {
				id: record.submitter.dataValues.id,
				full_name: record.submitter.dataValues.full_name,
			},

			approved_by: record.approver
				? {
						id: record.approver.dataValues.id,
						full_name: record.approver.dataValues.full_name,
					}
				: null,
		};
	});

	wbsInfo.actual_cost = Number(totalActualCost);

	return {
		wbs_info: wbsInfo,
		cost_records: costRecords,
	};
}

export function toProgessSummary(termin: TerminModel): TerminProgressSummary {
	let plannedVolume = 0;
	let actualVolume = 0;
	let totalProgressPercentage = 0;

	(termin.termin_allocations ?? []).forEach((terminAlloc) => {
		console.log(terminAlloc.progress);

		plannedVolume += Number(terminAlloc.dataValues?.actual_volume ?? 0);
		actualVolume += Number(terminAlloc.progress?.dataValues?.actual_volume ?? 0);

		const wbsProgressValue = (actualVolume / plannedVolume) * terminAlloc.wbs_item.dataValues.total_cost;
		const wbsProgressPercentage = (wbsProgressValue / terminAlloc.wbs_item.dataValues.total_cost) * 100;
		totalProgressPercentage += wbsProgressPercentage;
	});

	return {
		planned_volume: plannedVolume,
		actual_volume: actualVolume,
		termin_label: termin.dataValues.description,
		termin_sequence: termin.dataValues.sequence,
		termin_category: termin.dataValues.category,
		percentage: totalProgressPercentage,
	};
}

export function toWBSProgressReport(wbs: WBSModel): GetWBSProgressDTO {
	let totalActualVol = 0;

	const progress: ProgressInformation[] = (wbs.termin_allocations ?? [])
		.map((allocation) => {
			const planned = Number(allocation.dataValues.actual_volume ?? 0);
			const actual = Number(allocation.progress?.dataValues.actual_volume ?? 0);

			totalActualVol += actual;

			return {
				id: allocation.id,
				termin_category: allocation.termin?.dataValues.category,
				termin_sequence: allocation.termin?.dataValues.sequence,
				planned_volume: planned,
				actual_volume: actual,
			};
		})
		.sort((a, b) => a.termin_sequence - b.termin_sequence);

	return {
		id: wbs.dataValues.id,
		wbs_id: wbs.dataValues.wbs_id,
		description: wbs.dataValues.description,
		planned_volume: wbs.dataValues.volume,
		actual_volume: totalActualVol,
		unit: wbs.dataValues.unit,
		is_leaf: wbs.dataValues.is_leaf,
		parent_id: wbs.dataValues.parent_id,
		progress,
	};
}

export function toProgressHistory(progress: ProgressModel): GetProgressHistory {
	return {
		id: progress.dataValues.id,
		project_id: progress.dataValues.project_id,
		progress_date: progress.dataValues.updated_at,
		wbs_item: {
			wbs_id: progress.wbs.dataValues.wbs_id,
			description: progress.wbs.dataValues.description,
		},
		termin: {
			category: progress.termin_allocation.termin.dataValues.category,
			sequence: progress.termin_allocation.termin.dataValues.sequence,
		},
		description: progress.dataValues.description,
		actual_volume: progress.dataValues.actual_volume,
		unit: progress.wbs.dataValues.unit,
		photo_url: progress.dataValues.photo,
	};
}

export function toProjectCostIn(costIn: CostInModel): GetProjectCostInDTO {
	return {
		id: costIn.dataValues.id,
		termin: {
			id: costIn.termin.dataValues.id,
			sequence: costIn.termin.dataValues.sequence,
			category: costIn.termin.dataValues.category,
			description: costIn.termin.dataValues.description,
			nominal: costIn.termin.dataValues.nominal,
		},
		transaction_date: costIn.dataValues.transaction_date,
		description: costIn.dataValues.description,
		amount: costIn.dataValues.amount,
	};
}

export function toCostInSummary(termin: TerminModel): TerminCostInInformation {
	const totalReceived = (termin.cost_in ?? []).reduce((acc, costIn) => {
		return acc + Number(costIn.dataValues.amount);
	}, 0);

	return {
		id: termin.dataValues.id,
		sequence: termin.dataValues.sequence,
		category: termin.dataValues.category,
		description: termin.dataValues.description,
		nominal: Number(termin.dataValues.nominal),
		total_received: Number(totalReceived) ?? 0,
	};
}

export function toCostInDetail(costIn: CostInModel): CostInDetailDTO {
	return {
		id: costIn.dataValues.id,
		termin: {
			id: costIn.termin.dataValues.id,
			sequence: costIn.termin.dataValues.sequence,
			category: costIn.termin.dataValues.category,
			description: costIn.termin.dataValues.description,
			nominal: Number(costIn.termin.dataValues.nominal),
		},
		transaction_date: costIn.dataValues.transaction_date,
		description: costIn.dataValues.description,
		amount: Number(costIn.dataValues.amount),
		proof_file: `receipt/${costIn.dataValues.proof_file}`,
		created_by: {
			id: costIn.uploader.dataValues.id,
			full_name: costIn.uploader.dataValues.full_name,
		},
	};
}
