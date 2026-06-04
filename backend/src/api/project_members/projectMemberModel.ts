import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";

export interface ProjectMemberAttributes {
	id: string;
	project_id: string;
	user_id: string;
	assigned_at?: Date;
	assigned_by?: string | null;
	created_at?: Date;
	deleted_at?: Date | null;
}

export interface ProjectMemberCreationAttributes
	extends Optional<ProjectMemberAttributes, "id" | "assigned_at" | "assigned_by" | "created_at" | "deleted_at"> {}

export class ProjectMemberModel
	extends Model<ProjectMemberAttributes, ProjectMemberCreationAttributes>
	implements ProjectMemberAttributes
{
	public id!: string;
	public project_id!: string;
	public user_id!: string;
	public assigned_at!: Date;
	public assigned_by!: string | null;

	public readonly created_at!: Date;
	public readonly deleted_at!: Date | null;
}

ProjectMemberModel.init(
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
				model: "projects",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		user_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		assigned_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		assigned_by: {
			type: DataTypes.UUID,
			allowNull: true,
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
		tableName: "project_members",
		modelName: "ProjectMember",
		underscored: true,
		timestamps: true,
		paranoid: true,
		createdAt: "created_at",
		updatedAt: false,
		deletedAt: "deleted_at",
		indexes: [
			{
				unique: true,
				fields: ["project_id", "user_id"],
				where: {
					deleted_at: null,
				},
			},
		],
	},
);
