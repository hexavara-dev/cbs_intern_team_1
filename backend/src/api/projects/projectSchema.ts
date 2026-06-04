import { z } from "zod";

export enum ProjectStatus {
	ONGOING = "ongoing",
	FINISH = "finish",
	CLOSED = "closed",
	MAINTENANCE = "maintenance",
	CANCELED = "canceled",
	HOLD = "hold",
}

export const ProjectSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string(),
	location: z.string(),
	budget: z.number(),
	start_date: z.date(),
	end_date: z.date(),
	status: z.nativeEnum(ProjectStatus),
	progress: z.number(),
	created_by: z.string().uuid(),
	created_at: z.date(),
	updated_at: z.date(),
	deleted_at: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectTerminSchema = z.object({
	sequence: z.number().int().positive(),
	nominal: z.number().nonnegative(),
	description: z.string(),
});

export const UpdateProjectSchema = z
	.object({
		name: z.string().min(1).optional(),
		description: z.string().optional(),
		location: z.string().optional(),
		budget: z.number().nonnegative().optional(),
		start_date: z.coerce.date().optional(),
		end_date: z.coerce.date().optional(),
		status: z.nativeEnum(ProjectStatus).optional(),
		progress: z.number().min(0).max(100).optional(),
		termin: z.array(ProjectTerminSchema).optional(),
	})
	.refine(
		(data) => {
			// Validasi: jika start_date & end_date ada, end_date harus > start_date
			if (data.start_date && data.end_date) {
				return data.end_date > data.start_date;
			}
			return true;
		},
		{
			message: "end_date must be after start_date",
			path: ["end_date"],
		},
	);
