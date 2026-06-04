import { z } from "zod";

export const WbsCostSchema = z.object({
	id: z.string().uuid(),
	wbs_item_id: z.string().uuid(),
	cbs_category_id: z.string().uuid(),
	unit_cost: z.number().nonnegative(),
	updated_at: z.date(),
});

export type WbsCost = z.infer<typeof WbsCostSchema>;
