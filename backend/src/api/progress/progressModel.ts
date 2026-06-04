import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import { ProjectModel } from "../projects/projectModel";
import { TerminModel } from "../termin/terminModel";
import { TerminAllocationModel } from "../termin_allocations/terminAllocationModel";
import { WBSModel } from "../wbs/wbsModel";

export interface ProgressAttributes {
	id: string;
	wbs_item_id: string;
	termin_id: string;
	termin_allocation_id: string;
	project_id: string;
	is_finished: boolean;
	actual_volume: number;
	description: string;
	photo: string[];
	updated_at: Date;
}

export interface ProgressCreationAttributes extends Optional<ProgressAttributes, "id" | "updated_at" | "photo"> {}

export class ProgressModel extends Model<ProgressAttributes, ProgressCreationAttributes> implements ProgressAttributes {
	public id!: string;
	public termin_id!: string;
	public termin_allocation_id!: string;
	public wbs_item_id!: string;
	public project_id!: string;

	public is_finished!: boolean;
	public description!: string;
	public actual_volume!: number;
	public photo!: string[];

	declare wbs: WBSModel;
	declare termin: TerminModel;
	declare termin_allocation: TerminAllocationModel;

	public updated_at!: Date;
}

ProgressModel.init(
	{
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
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
		termin_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: TerminModel,
				key: "id",
			},
		},
		termin_allocation_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: TerminAllocationModel,
				key: "id",
			},
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		actual_volume: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		is_finished: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		photo: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: true,
		},
	},
	{
		sequelize,
		tableName: "progress",
		modelName: "Progress",
		underscored: true,
		timestamps: true,
		paranoid: true,
		updatedAt: "updated_at",

		indexes: [
			{
				unique: true,
				fields: ["wbs_item_id", "termin_allocation_id"],
			},
		],
	},
);
