import { z } from "zod";

export const commonValidations = {
	id: z.string().uuid("Invalid UUID"),
	// ... other common validations
};
