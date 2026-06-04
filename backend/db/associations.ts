import { CBSModel } from "../src/api/cbs/cbsModel";
import { CostInModel } from "../src/api/cost_in/costInModel";
import { CostItemModel } from "../src/api/cost_items/costItemModel";
import { CostRecordModel } from "../src/api/cost_records/costRecordModel";
import { ProgressModel } from "../src/api/progress/progressModel";
import { ProjectCBSModel } from "../src/api/project_cbs/projectCbsModel";
import { ProjectMemberModel } from "../src/api/project_members/projectMemberModel";
import { ProjectModel } from "../src/api/projects/projectModel";
import { TerminModel } from "../src/api/termin/terminModel";
import { TerminAllocationModel } from "../src/api/termin_allocations/terminAllocationModel";
import { UserModel } from "../src/api/user/userModel";
import { VendorModel } from "../src/api/vendor/vendorModel";
import { WBSModel } from "../src/api/wbs/wbsModel";
import { WbsCostModel } from "../src/api/wbs_cost/wbsCostModel";

export function setupAssociations() {
	// UserModel
	UserModel.hasMany(CBSModel, {
		foreignKey: "created_by",
		as: "createdCbs",
	});

	UserModel.hasMany(ProjectModel, {
		foreignKey: "created_by",
		as: "projects",
	});

	UserModel.hasMany(ProjectCBSModel, {
		foreignKey: "selected_by",
		as: "selectedCbs",
	});

	UserModel.hasMany(CostInModel, {
		foreignKey: "created_by",
		as: "cost_ins",
	});

	// CBSModel
	CBSModel.belongsTo(UserModel, {
		foreignKey: "created_by",
		as: "creator",
	});

	CBSModel.hasMany(ProjectCBSModel, {
		foreignKey: "cbs_category_id",
		as: "projectCbs",
	});

	CBSModel.hasMany(WbsCostModel, {
		foreignKey: "cbs_category_id",
		as: "wbsCosts",
	});

	CBSModel.hasMany(CostItemModel, {
		foreignKey: "cbs_category_id",
		as: "cost_items",
	});

	// ProjectModel
	ProjectModel.belongsTo(UserModel, {
		foreignKey: "created_by",
		as: "creator",
	});

	ProjectModel.hasMany(ProjectCBSModel, {
		foreignKey: "project_id",
		as: "projectCbs",
	});

	ProjectModel.hasMany(WBSModel, {
		foreignKey: "project_id",
		as: "wbsItems",
	});

	ProjectModel.hasMany(TerminModel, {
		foreignKey: "project_id",
		as: "termin",
	});

	ProjectModel.hasMany(CostInModel, {
		foreignKey: "project_id",
		as: "cost_ins",
	});

	// ProjectCBSModel
	ProjectCBSModel.belongsTo(ProjectModel, {
		foreignKey: "project_id",
		as: "project",
	});

	ProjectCBSModel.belongsTo(CBSModel, {
		foreignKey: "cbs_category_id",
		as: "cbs",
	});

	ProjectCBSModel.belongsTo(UserModel, {
		foreignKey: "selected_by",
		as: "selector",
	});

	// WBSModel
	WBSModel.hasMany(WBSModel, {
		foreignKey: "parent_id",
		as: "children",
	});

	WBSModel.belongsTo(WBSModel, {
		foreignKey: "parent_id",
		as: "parent",
	});

	WBSModel.belongsTo(ProjectModel, {
		foreignKey: "project_id",
		as: "project",
	});

	WBSModel.hasMany(WbsCostModel, {
		foreignKey: "wbs_item_id",
		as: "costs",
	});

	WBSModel.hasMany(TerminAllocationModel, {
		foreignKey: "wbs_item_id",
		as: "termin_allocations",
	});

	WBSModel.hasMany(CostRecordModel, {
		foreignKey: "wbs_item_id",
		as: "cost_records",
	});

	WBSModel.hasMany(ProgressModel, {
		foreignKey: "wbs_item_id",
		as: "progress",
	});

	// WbsCostModel
	WbsCostModel.belongsTo(WBSModel, {
		foreignKey: "wbs_item_id",
		as: "wbs",
	});

	WbsCostModel.belongsTo(CBSModel, {
		foreignKey: "cbs_category_id",
		as: "cbs_category",
	});

	// Termin
	TerminModel.hasMany(TerminAllocationModel, {
		foreignKey: "termin_id",
		as: "termin_allocations",
	});

	TerminModel.belongsTo(ProjectModel, {
		foreignKey: "project_id",
		as: "project",
	});

	TerminModel.hasMany(CostInModel, {
		foreignKey: "termin_id",
		as: "cost_in",
	});

	// Termin Allocation
	TerminAllocationModel.belongsTo(WBSModel, {
		foreignKey: "wbs_item_id",
		as: "wbs_item",
	});

	TerminAllocationModel.belongsTo(TerminModel, {
		foreignKey: "termin_id",
		as: "termin",
	});

	TerminAllocationModel.hasOne(ProgressModel, {
		foreignKey: "termin_allocation_id",
		as: "progress",
	});

	// ProjectMemberModel
	ProjectMemberModel.belongsTo(ProjectModel, {
		foreignKey: "project_id",
		as: "project",
	});

	ProjectMemberModel.belongsTo(UserModel, {
		foreignKey: "user_id",
		as: "user",
	});

	ProjectMemberModel.belongsTo(UserModel, {
		foreignKey: "assigned_by",
		as: "assigner",
	});

	// CostRecord relations
	CostRecordModel.belongsTo(VendorModel, {
		foreignKey: "vendor_id",
		as: "vendor",
	});

	CostRecordModel.belongsTo(ProjectModel, {
		foreignKey: "project_id",
		as: "project",
	});

	CostRecordModel.belongsTo(WBSModel, {
		foreignKey: "wbs_item_id",
		as: "wbs",
	});

	CostRecordModel.belongsTo(UserModel, {
		foreignKey: "submitted_by",
		as: "submitter",
	});

	CostRecordModel.belongsTo(UserModel, {
		foreignKey: "approved_by",
		as: "approver",
	});

	CostRecordModel.hasMany(CostItemModel, {
		foreignKey: "cost_record_id",
		as: "cost_items",
	});

	// Cost Item relations
	CostItemModel.belongsTo(CostRecordModel, {
		foreignKey: "cost_record_id",
		as: "cost_record",
	});

	CostItemModel.belongsTo(CBSModel, {
		foreignKey: "cbs_category_id",
		as: "cbs_category",
	});

	ProgressModel.belongsTo(WBSModel, {
		foreignKey: "wbs_item_id",
		as: "wbs",
	});

	ProgressModel.belongsTo(TerminAllocationModel, {
		foreignKey: "termin_allocation_id",
		as: "termin_allocation",
	});

	// Cost In
	CostInModel.belongsTo(UserModel, {
		foreignKey: "created_by",
		as: "uploader",
	});

	CostInModel.belongsTo(TerminModel, {
		foreignKey: "termin_id",
		as: "termin",
	});

	CostInModel.belongsTo(ProjectModel, {
		foreignKey: "project_id",
		as: "project",
	});
}
