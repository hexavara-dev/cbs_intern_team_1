import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { CBSModel } from "../cbs/cbsModel";
import type { WBSModel } from "../wbs/wbsModel";

export interface WbsCostAttributes {
	id: string;
	wbs_item_id: string;
	cbs_category_id: string | null;
	unit_cost: number;
	updated_at?: Date;
}

export interface WbsCostCreationAttributes extends Optional<WbsCostAttributes, "id" | "updated_at"> {}

export class WbsCostModel extends Model<WbsCostAttributes, WbsCostCreationAttributes> implements WbsCostAttributes {
	public id!: string;
	public wbs_item_id!: string;
	public cbs_category_id!: string;
	public unit_cost!: number;

	declare wbs: WBSModel;
	declare cbs_category: CBSModel;

	public readonly updated_at!: Date;
}

WbsCostModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		wbs_item_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "wbs_items",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		cbs_category_id: {
			type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: "cbs_categories",
				key: "id",
			},
		},
		unit_cost: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
	},
	{
		sequelize,
		tableName: "wbs_cbs_costs",
		modelName: "WbsCost",
		underscored: true,
		timestamps: true,
		createdAt: false,
		updatedAt: "updated_at",
		paranoid: false,
		indexes: [
			{
				unique: true,
				fields: ["wbs_item_id", "cbs_category_id"],
				name: "uq_wbs_cbs",
			},
			{
				fields: ["wbs_item_id"],
				name: "idx_wbs_cbs_wbs",
			},
			{
				fields: ["cbs_category_id"],
				name: "idx_wbs_cbs_category",
			},
		],
	},
);
