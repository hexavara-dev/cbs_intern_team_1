import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { CBSModel } from "../cbs/cbsModel";

export interface CostItemAttributes {
	id: string;
	cost_record_id: string;
	cbs_category_id: string;
	description: string;
	unit_cost: number;
	quantity: number;
	total: number;
	created_at: Date;
}

export interface CostItemCreationAttributes extends Optional<CostItemAttributes, "id" | "created_at"> {}

export class CostItemModel extends Model<CostItemAttributes, CostItemCreationAttributes> implements CostItemAttributes {
	public id!: string;
	public cost_record_id!: string;
	public cbs_category_id!: string;
	public description!: string;
	public unit_cost!: number;
	public quantity!: number;
	public total!: number;

	declare cbs_category: CBSModel;

	public created_at!: Date;
}

CostItemModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		cost_record_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "cost_records",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		cbs_category_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "cbs_categories",
				key: "id",
			},
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		unit_cost: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		total: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		tableName: "cost_items",
		timestamps: false,
		underscored: true,
	},
);
