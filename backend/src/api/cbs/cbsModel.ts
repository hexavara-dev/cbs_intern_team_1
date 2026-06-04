import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { CBSCostType } from "./cbsSchema";

export interface CBSAttributes {
	id: string;
	name: string;
	cost_type: CBSCostType;
	description: string | null;
	created_by?: string | null;
	created_at?: Date;
	updated_at?: Date;
	deleted_at?: Date | null;
}

export interface CBSCreationAttributes
	extends Optional<CBSAttributes, "id" | "description" | "created_by" | "created_at" | "updated_at" | "deleted_at"> {}

export class CBSModel extends Model<CBSAttributes, CBSCreationAttributes> implements CBSAttributes {
	public id!: string;
	public name!: string;
	public cost_type!: CBSCostType;
	public description!: string;
	public created_by!: string;

	public readonly created_at!: Date;
	public readonly updated_at!: Date;
	public readonly deleted_at!: Date | null;
}

CBSModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		cost_type: {
			type: DataTypes.ENUM("Per Item", "Borongan"),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		created_by: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		},
	},
	{
		sequelize,
		tableName: "cbs_categories",
		modelName: "CBS",
		underscored: true,
		timestamps: true,
		paranoid: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		indexes: [
			{
				unique: true,
				fields: ["name", "cost_type"],
				where: {
					deleted_at: null,
				},
			},
		],
	},
);
