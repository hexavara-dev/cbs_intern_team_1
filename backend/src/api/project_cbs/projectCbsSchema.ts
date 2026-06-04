import { z } from "zod";

export const ProjectCBSSchema = z.object({
	id: z.string().uuid(),
	project_id: z.string().uuid(),
	cbs_category_id: z.string().uuid(),
	selected_by: z.string().uuid(),
});

export type ProjectCBS = z.infer<typeof ProjectCBSSchema>;
