import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { CostInModel } from "../cost_in/costInModel";
import type { TerminAllocationModel } from "../termin_allocations/terminAllocationModel";

export enum TerminCategory {
	TERMIN = "termin",
	ADENDUM = "adendum",
}

export enum TerminProgressCategory {
	TERMIN_NOT_PROGRESS = "not-progress",
	TERMIN_PROGRESS = "progress",
}

export interface TerminAttributes {
	id: string;
	project_id: string;
	description: string;
	sequence: number;
	nominal: number;
	percentage: number;
	category: TerminCategory;
	paid: boolean;
	total_cost_in: number;
	created_at: Date;
	updated_at: Date;
}

export interface TerminCreationAttributes
	extends Optional<TerminAttributes, "id" | "created_at" | "updated_at" | "category" | "percentage"> {}

export class TerminModel extends Model<TerminAttributes, TerminCreationAttributes> implements TerminAttributes {
	public id!: string;
	public project_id!: string;
	public description!: string;
	public category!: TerminCategory;
	public sequence!: number;
	public nominal!: number;
	public percentage!: number;
	public paid!: boolean;
	public total_cost_in!: number;

	declare termin_allocations: TerminAllocationModel[];
	declare cost_in: CostInModel[];

	public created_at!: Date;
	public updated_at!: Date;
}

TerminModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			allowNull: false,
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
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		category: {
			type: DataTypes.ENUM("termin", "adendum"),
			allowNull: false,
			defaultValue: TerminCategory.TERMIN,
		},
		sequence: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		nominal: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false,
			defaultValue: 0,
		},
		total_cost_in: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: true,
			defaultValue: 0,
		},
		percentage: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 0,
		},
		paid: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "termins",
		modelName: "Termin",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		underscored: true,
	},
);
