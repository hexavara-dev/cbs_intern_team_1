import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../../../db/sequelize";
import type { Role } from "./userSchema";

export interface UserAttributes {
	id: string;
	email: string;
	password_hash: string;
	full_name: string;
	phone: string | null;
	role: Role;
	is_active: boolean;
	last_login_at?: Date | null;
	created_at?: Date;
	updated_at?: Date;
	deleted_at?: Date | null;
}

export interface UserCreationAttributes
	extends Optional<UserAttributes, "id" | "created_at" | "updated_at" | "deleted_at" | "phone" | "last_login_at"> {}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
	public id!: string;
	public email!: string;
	public password_hash!: string;
	public full_name!: string;
	public phone!: string | null;
	public role!: Role;
	public is_active!: boolean;
	public last_login_at!: Date | null;

	public readonly created_at!: Date;
	public readonly updated_at!: Date;
	public readonly deleted_at!: Date | null;
}

UserModel.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
		},
		password_hash: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		full_name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		phone: {
			type: DataTypes.STRING(20),
			allowNull: true,
		},
		role: {
			type: DataTypes.ENUM("Project Manager", "Mandor"),
			allowNull: false,
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		last_login_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		sequelize,
		tableName: "users",
		timestamps: true,
		paranoid: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		deletedAt: "deleted_at",
	},
);
