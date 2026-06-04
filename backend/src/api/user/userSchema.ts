import { z } from "zod";

export enum Role {
	PM = "Project Manager",
	M = "Mandor",
}

export const UserSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	full_name: z.string(),
	phone: z.string().nullable(),
	role: z.nativeEnum(Role),
	is_active: z.boolean(),
	last_login_at: z.date().nullable(),
	created_at: z.date(),
	updated_at: z.date(),
	deleted_at: z.date().nullable(),
});

export type User = z.infer<typeof UserSchema>;
