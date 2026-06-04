import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { TerminModel } from "../termin/terminModel";
import type { ProjectStatus } from "./projectSchema";

export interface ProjectAttributes {
	id: string;
	created_by: string;
	name: string;
	description: string;
	location: string;
	budget: number;
	start_date: Date;
	end_date: Date;
	status: ProjectStatus;
	is_termin_by_progress: boolean;
	progress: number;
	created_at?: Date;
	updated_at?: Date;
	deleted_at?: Date;
}

export interface ProjectCreationAttributes
	extends Optional<ProjectAttributes, "id" | "progress" | "status" | "created_at" | "updated_at" | "deleted_at"> {}

export class ProjectModel extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
	public id!: string;
	public name!: string;
	public description!: string;
	public location!: string;
	public budget!: number;
	public start_date!: Date;
	public end_date!: Date;
	public status!: ProjectStatus;
	public is_termin_by_progress!: boolean;
	public progress!: number;
	public created_by!: string;

	declare termin: TerminModel[];

	public readonly created_at!: Date;
	public readonly updated_at!: Date;
	public readonly deleted_at!: Date;
}

ProjectModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		location: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		budget: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false,
			defaultValue: 0,
		},
		start_date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		end_date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("ongoing", "finish", "closed", "maintenance", "canceled", "hold"),
			allowNull: false,
			defaultValue: "ongoing",
		},
		is_termin_by_progress: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		progress: {
			type: DataTypes.DECIMAL(5, 2),
			allowNull: false,
			defaultValue: 0,
		},
		created_by: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "RESTRICT",
		},
	},
	{
		sequelize,
		tableName: "projects",
		modelName: "Project",
		underscored: true,
		timestamps: true,
		paranoid: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
	},
);
