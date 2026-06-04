import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";

export interface VendorAttributes {
	id: string;
	name: string;
	contact_person: string;
	phone: string;
	email: string;
	address: string;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

export type VendorCreationAttributes = Optional<
	VendorAttributes,
	"id" | "created_at" | "updated_at" | "deleted_at" | "contact_person" | "phone" | "email" | "address"
>;

export class VendorModel extends Model<VendorAttributes, VendorCreationAttributes> implements VendorAttributes {
	public id!: string;
	public name!: string;
	public contact_person!: string;
	public phone!: string;
	public email!: string;
	public address!: string;
	public created_at!: Date;
	public updated_at!: Date;
	public deleted_at!: Date | null;
}

VendorModel.init(
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
		contact_person: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		phone: {
			type: DataTypes.STRING(50),
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		address: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		updated_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		deleted_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		sequelize,
		tableName: "vendors",
		timestamps: true,
		paranoid: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
		underscored: true,
		indexes: [
			{
				name: "vendors_name_idx",
				fields: ["name"],
			},
		],
	},
);
