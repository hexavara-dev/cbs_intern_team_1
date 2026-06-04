import z from "zod";

export const TerminAllocationSchema = z.object({
	id: z.string(),
	project_id: z.string(),
	termin_id: z.string(),
	wbs_item_id: z.string(),
	allocated_volume: z.string(),
	created_at: z.date(),
	updated_at: z.date(),
});

export type TerminAllocation = z.infer<typeof TerminAllocationSchema>;
