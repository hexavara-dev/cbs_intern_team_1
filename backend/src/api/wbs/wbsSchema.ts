import { z } from "zod";

export const WBSSchema = z.object({
	id: z.string().uuid(),
	wbs_id: z.string(),
	wbs_parent_id: z.string(),
	description: z.string(),
	volume: z.number(),
	unit: z.string(),
	is_leaf: z.boolean(),
	cbs_category: z.record(z.string(), z.number()).optional(),
});

export type WBS = z.infer<typeof WBSSchema>;
