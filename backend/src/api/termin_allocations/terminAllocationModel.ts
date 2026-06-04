import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { ProgressModel } from "../progress/progressModel";
import type { TerminModel } from "../termin/terminModel";
import type { WBSModel } from "../wbs/wbsModel";

export interface TerminAllocationAttributes {
	id: string;
	termin_id: string;
	wbs_item_id: string;
	project_id: string;
	actual_volume: number;
	created_at: Date;
	updated_at: Date;
}

export interface TerminAllocationCreationAttributes
	extends Optional<TerminAllocationAttributes, "id" | "created_at" | "updated_at"> {}

export class TerminAllocationModel
	extends Model<TerminAllocationAttributes, TerminAllocationCreationAttributes>
	implements TerminAllocationAttributes
{
	public id!: string;
	public termin_id!: string;
	public project_id!: string;
	public wbs_item_id!: string;
	public actual_volume!: number;

	declare termin: TerminModel;
	declare progress: ProgressModel;
	declare wbs_item: WBSModel;

	public created_at!: Date;
	public updated_at!: Date;
}

TerminAllocationModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
		},
		termin_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "termins", // tableName TerminModel
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		project_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "projects", // tableName ProjectModel
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		wbs_item_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "wbs_items", // table name
				key: "id", // PK WBS
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		actual_volume: {
			type: DataTypes.INTEGER,
			allowNull: false,
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
		tableName: "termin_allocations",
		modelName: "TerminAllocation",
		timestamps: true,
		underscored: true,
		paranoid: false,
		indexes: [
			{
				unique: true,
				fields: ["termin_id", "wbs_item_id"],
			},
		],
	},
);
