import { CostItemDescriptionModel } from "../../src/api/cost_item_description/costItemDescriptionModel";
import { logger } from "../../src/server";

export const seedCostItemDescription = async () => {
	try {
		const costItemDesc = [
			{ description: "Pasir Beton (truk)" },
			{ description: "Besi Beton 10mm" },
			{ description: "Semen Holcim 50kg" },
			{ description: "Batu Bata Merah" },
			{ description: "Paku Beton 10cm" },
			{ description: "Besi Beton 10mm" },
			{ description: "Kayu Kaso 4x6" },
		];

		for (const item of costItemDesc) {
			const [model, created] = await CostItemDescriptionModel.findOrCreate({
				where: { description: item.description },
				defaults: item,
			});

			if (created) {
				logger.info(`Cost Item Description "${item.description}" created.`);
			} else {
				logger.info(`Cost Item Description "${item.description}" already exists.`);
			}
		}

		logger.info("Cost Item Description seeding completed.");
		return true;
	} catch (error) {
		logger.error(`Error seeding cost item descriptions: ${(error as Error).message}`);
		return false;
	}
};
