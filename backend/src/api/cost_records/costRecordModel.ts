import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { CostItemModel } from "../cost_items/costItemModel";
import { ProjectModel } from "../projects/projectModel";
import { UserModel } from "../user/userModel";
import { VendorModel } from "../vendor/vendorModel";
import { WBSModel } from "../wbs/wbsModel";

export enum CostRecordStatus {
	APPROVED = "approved",
	REJECTED = "rejected",
	ON_PROSES = "onproses",
	PENDING = "pending",
}

export interface CostRecordAttribute {
	id: string;
	project_id: string;
	wbs_item_id: string;
	vendor_id: string;
	activity_name: string;
	transaction_date: Date;
	status: CostRecordStatus;
	nota_proof_url: string;
	total_amount: number;
	submitted_by: string;
	approved_by: string | null;
	approved_at: Date | null;
	approved_file: string;
	rejected_reason: string | null;
	created_at: Date;
	updated_at: Date;
}

export interface CostRecordCreationAttribute
	extends Optional<
		CostRecordAttribute,
		"id" | "status" | "approved_by" | "approved_at" | "rejected_reason" | "approved_file" | "created_at" | "updated_at"
	> {}

export class CostRecordModel
	extends Model<CostRecordAttribute, CostRecordCreationAttribute>
	implements CostRecordAttribute
{
	public id!: string;
	public project_id!: string;
	public wbs_item_id!: string;
	public vendor_id!: string;
	public activity_name!: string;
	public transaction_date!: Date;
	public status!: CostRecordStatus;
	public nota_proof_url!: string;
	public total_amount!: number;
	public submitted_by!: string;
	public approved_by!: string | null;
	public approved_file!: string;
	public approved_at!: Date | null;
	public rejected_reason!: string | null;

	declare cost_items: CostItemModel[];
	declare vendor: VendorModel;
	declare wbs: WBSModel;
	declare project: ProjectModel;
	declare submitter: UserModel;
	declare approver: UserModel;

	public readonly created_at!: Date;
	public readonly updated_at!: Date;
}

CostRecordModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		project_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: ProjectModel,
				key: "id",
			},
		},
		wbs_item_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: WBSModel,
				key: "id",
			},
		},
		vendor_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: VendorModel,
				key: "id",
			},
		},
		activity_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		transaction_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("approved", "rejected", "pending", "onproses"),
			defaultValue: CostRecordStatus.PENDING,
			allowNull: false,
		},
		nota_proof_url: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		total_amount: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false,
			defaultValue: 0,
		},
		submitted_by: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: UserModel,
				key: "id",
			},
		},
		approved_by: {
			type: DataTypes.UUID,
			allowNull: true,
		},
		approved_file: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		approved_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		rejected_reason: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		tableName: "cost_records",
		modelName: "CostRecord",
		underscored: true,
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		indexes: [
			{ fields: ["project_id"] },
			{ fields: ["wbs_item_id"] },
			{ fields: ["vendor_id"] },
			{ fields: ["status"] },
		],
	},
);
