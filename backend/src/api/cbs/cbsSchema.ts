import { z } from "zod";

export enum CBSCostType {
	PER_ITEM = "Per Item",
	BORONGAN = "Borongan",
}

export type CBS = z.infer<typeof cbsSchema>;
export const cbsSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	created_by: z.string().uuid(),
	cost_type: z.nativeEnum(CBSCostType),
	description: z.string().nullable(),
	created_at: z.date(),
	updated_at: z.date(),
	deleted_at: z.date(),
});
