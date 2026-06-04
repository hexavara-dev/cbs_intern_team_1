import { DataTypes, Model, type Optional, UUIDV4 } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import { ProjectModel } from "../projects/projectModel";
import { TerminModel } from "../termin/terminModel";
import { UserModel } from "../user/userModel";

export interface CostInAttributes {
	id: string;
	termin_id: string;
	project_id: string;
	created_by: string;
	transaction_date: Date;
	description: string;
	amount: number;
	proof_file: string;
}

export interface CostInCreationAttributes extends Optional<CostInAttributes, "id"> {}

export class CostInModel extends Model<CostInAttributes, CostInCreationAttributes> implements CostInAttributes {
	public id!: string;
	public termin_id!: string;
	public project_id!: string;
	public created_by!: string;
	public transaction_date!: Date;
	public description!: string;
	public amount!: number;
	public proof_file!: string;

	declare termin: TerminModel;
	declare uploader: UserModel;
}

CostInModel.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: UUIDV4,
		},
		project_id: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: ProjectModel,
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
		created_by: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: UserModel,
				key: "id",
			},
		},
		transaction_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		amount: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false,
		},
		proof_file: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "cost_in",
		modelName: "CostIn",
		timestamps: false,
		underscored: true,
	},
);
