import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";

export interface CostItemDescriptionAttribute {
	id: string;
	description: string;
}

export interface CostItemDescriptionCreationAttribute extends Optional<CostItemDescriptionAttribute, "id"> {}

export class CostItemDescriptionModel
	extends Model<CostItemDescriptionAttribute, CostItemDescriptionCreationAttribute>
	implements CostItemDescriptionAttribute
{
	public id!: string;
	public description!: string;
}

CostItemDescriptionModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
	},
	{
		sequelize,
		tableName: "cost_items_description",
		timestamps: false,
		underscored: true,
	},
);
