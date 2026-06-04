import z from "zod";

export const TerminSchema = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	sequence: z.number(),
	description: z.string(),
	nominal: z.number(),
	created_at: z.date(),
	updated_at: z.date(),
});

export type Termin = z.infer<typeof TerminSchema>;
