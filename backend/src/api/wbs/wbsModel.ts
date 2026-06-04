import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { CostRecordModel } from "../cost_records/costRecordModel";
import type { ProgressModel } from "../progress/progressModel";
import type { TerminAllocationModel } from "../termin_allocations/terminAllocationModel";
import type { WbsCostModel } from "../wbs_cost/wbsCostModel";

export enum HouseUnits {
	GROUP = "group",
	UNIT = "unit",
}

export function generateHouseUnitName(name: string, index: number): string {
	return `${name}-${index}`;
}

export interface WBSAttributes {
	id: string;
	wbs_id: string;
	project_id: string;
	parent_id: string | null;
	description: string;
	volume: number | null;
	unit: string | null;
	is_leaf: boolean;
	total_cost: number;
	level: number;
	created_at?: Date;
	updated_at?: Date;
	deleted_at?: Date | null;
}

export interface WBSCreationAttributes
	extends Optional<
		WBSAttributes,
		"id" | "wbs_id" | "parent_id" | "volume" | "unit" | "total_cost" | "created_at" | "updated_at" | "deleted_at"
	> {}

export class WBSModel extends Model<WBSAttributes, WBSCreationAttributes> implements WBSAttributes {
	public id!: string;
	public wbs_id!: string;
	public project_id!: string;
	public parent_id!: string | null;
	public description!: string;
	public volume!: number | null;
	public unit!: string | null;
	public is_leaf!: boolean;
	public total_cost!: number;
	public level!: number;

	declare costs: WbsCostModel[];
	declare termin_allocations: TerminAllocationModel[];
	declare progress: ProgressModel[];
	declare cost_records: CostRecordModel[];
	declare actual_cost: number;

	public readonly created_at!: Date;
	public readonly updated_at!: Date;
	public readonly deleted_at!: Date | null;
}

WBSModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		wbs_id: {
			type: DataTypes.STRING,
		},
		project_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "projects",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		parent_id: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "wbs_items",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		description: {
			type: DataTypes.STRING(500),
			allowNull: false,
		},
		volume: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		unit: {
			type: DataTypes.STRING(20),
			allowNull: true,
		},
		is_leaf: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		total_cost: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false,
			defaultValue: 0,
		},
		level: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
		},
	},
	{
		sequelize,
		tableName: "wbs_items",
		modelName: "WBS",
		underscored: true,
		timestamps: true,
		paranoid: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		indexes: [
			{
				unique: true,
				fields: ["project_id", "wbs_id"],
				where: {
					deleted_at: null,
				},
			},
		],
	},
);
