import { CBSModel } from "../../src/api/cbs/cbsModel";
import { CBSCostType } from "../../src/api/cbs/cbsSchema";
import { logger } from "../../src/server";

export const seedCBS = async (userId: string) => {
	try {
		const cbsList = [
			{
				name: "Material",
				cost_type: CBSCostType.PER_ITEM,
				description: "Biaya material beton",
				created_by: userId,
			},
			{
				name: "Tenaga Kerja",
				cost_type: CBSCostType.BORONGAN,
				description: "Biaya tenaga kerja",
				created_by: userId,
			},
			{
				name: "Alat Berat",
				cost_type: CBSCostType.BORONGAN,
				description: "Sewa alat berat",
				created_by: userId,
			},
		];

		for (const cbs of cbsList) {
			const [cbsModel, created] = await CBSModel.findOrCreate({
				where: {
					name: cbs.name,
					cost_type: cbs.cost_type,
				},
				defaults: cbs,
			});

			if (created) {
				logger.info(`CBS ${cbs.name} created.`);
			} else {
				logger.info(`CBS ${cbs.name} already exists.`);
			}
		}

		logger.info("CBS seeding completed.");
	} catch (error) {
		logger.error(`Error seeding CBS: ${(error as Error).message}`);
		throw error;
	}
};
