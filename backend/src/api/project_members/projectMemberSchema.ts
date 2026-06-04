import { z } from "zod";

export const ProjectMemberSchema = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	user_id: z.string().uuid(),
	assigned_at: z.date(),
	assigned_by: z.string().uuid().nullable(),
	created_at: z.date(),
	deleted_at: z.date().nullable(),
});

export type ProjectMember = z.infer<typeof ProjectMemberSchema>;
