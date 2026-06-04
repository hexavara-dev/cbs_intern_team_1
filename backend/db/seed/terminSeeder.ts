import { TerminCategory, TerminModel } from "../../src/api/termin/terminModel";
import { logger } from "../../src/server";

export const seedTermin = async (projectId: string) => {
	try {
		const termins = [
			{
				project_id: projectId,
				description: "Termin 1 - DP",
				sequence: 1,
				nominal: 30000000,
				percentage: 30,
				total_cost_in: 0,
				category: TerminCategory.TERMIN,
				paid: false,
			},
			{
				project_id: projectId,
				description: "Termin 2 - Progress",
				sequence: 2,
				nominal: 50000000,
				total_cost_in: 0,
				percentage: 50,
				paid: false,
			},
			{
				project_id: projectId,
				description: "Termin 3 - Pelunasan",
				sequence: 3,
				nominal: 20000000,
				total_cost_in: 0,
				percentage: 20,
				paid: false,
			},
		];

		for (const termin of termins) {
			const [terminModel, created] = await TerminModel.findOrCreate({
				where: {
					project_id: termin.project_id,
					sequence: termin.sequence, // unik per project
				},
				defaults: termin,
			});

			if (created) {
				logger.info(`Termin ${termin.sequence} created.`);
			} else {
				logger.info(`Termin ${termin.sequence} already exists.`);
			}
		}

		logger.info("Termin seeding completed.");
	} catch (error) {
		logger.error(`Error seeding termin: ${(error as Error).message}`);
		throw error;
	}
};
