import type { Role } from "./userSchema";

export interface GetUserDTO {
	id: string;
	email: string;
	full_name: string;
	phone: string;
	role: string;
}
export interface CreateUser {
	email: string;
	full_name: string;
	password: string;
	phone: string;
	role: Role;
}
export interface LoginDTO {
	email: string;
	password: string;
}
export interface TokenDTO {
	token: string;
}
