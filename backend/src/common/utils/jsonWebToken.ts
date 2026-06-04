import jwt from "jsonwebtoken";
import type { UserAttributes } from "../../api/user/userModel";
import type { Role } from "../../api/user/userSchema";
import { env } from "./envConfig";

type UserPayload = {
	id: string;
	email: string;
	full_name: string | null;
	phone: string | null;
	role: Role;
};

export function signJWT(user: UserAttributes): string {
	const payload: UserPayload = {
		id: user.id,
		email: user.email,
		full_name: user.full_name,
		phone: user.phone,
		role: user.role,
	};

	const secret = env.JWT_SECRET;

	const token = jwt.sign(payload, secret, {
		expiresIn: 60 * 60,
	});

	return token;
}

export function verifyJWT(token: string): UserPayload | null {
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET);

		return decoded as UserPayload;
	} catch {
		return null;
	}
}
