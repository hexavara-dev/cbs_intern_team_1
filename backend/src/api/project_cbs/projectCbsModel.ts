import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { CBSModel } from "../cbs/cbsModel";

export interface ProjectCBSAttributes {
	id: string;
	project_id: string;
	cbs_category_id: string;
	selected_at?: Date;
	selected_by?: string | null;
}

export interface ProjectCBSCreationAttributes
	extends Optional<ProjectCBSAttributes, "id" | "selected_at" | "selected_by"> {}

export class ProjectCBSModel
	extends Model<ProjectCBSAttributes, ProjectCBSCreationAttributes>
	implements ProjectCBSAttributes
{
	public id!: string;
	public project_id!: string;
	public cbs_category_id!: string;
	public selected_at!: Date;
	public selected_by!: string | null;

	declare cbs: CBSModel;
}

ProjectCBSModel.init(
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
		cbs_category_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: "cbs_categories",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "RESTRICT",
		},
		selected_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		selected_by: {
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
		tableName: "project_cbs_selections",
		modelName: "ProjectCbs",
		underscored: true,
		timestamps: false,
		indexes: [
			{
				unique: true,
				fields: ["project_id", "cbs_category_id"],
			},
		],
	},
);
