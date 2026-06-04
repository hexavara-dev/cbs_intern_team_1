import { seedCBS } from "./seed/cbsSeeder";
import { seedCostItemDescription } from "./seed/costItemDescriptionSeeder";
import { seedProject } from "./seed/projectSeeder";
import { seedTermin } from "./seed/terminSeeder";
import { seedUsers } from "./seed/userSeeder";
import { seedVendors } from "./seed/vendorSeeder";

(async () => {
	console.log("Starting seeding...");

	try {
		const userId = await seedUsers();
		if (!userId) {
			console.error("Seeding user failed");
			process.exit(1);
		}
		console.log("Seeding user successful");

		const successVendor = await seedVendors();
		if (!successVendor) {
			console.error("Seeding vendor failed");
			process.exit(1);
		}
		console.log("Seeding vendor successful");

		const successCostItemDesc = await seedCostItemDescription();
		if (!successCostItemDesc) {
			console.error("Seeding cost item description failed");
			process.exit(1);
		}
		console.log("Seeding cost item description successful");

		const project = await seedProject(userId);
		if (!project) {
			console.error("Seeding project failed");
			process.exit(1);
		}
		console.log("Seeding project successful");

		await seedTermin(project);
		console.log("Seeding termin successful");

		await seedCBS(userId);
		console.log("Seeding CBS successful");

		console.log("Seeding finish");
		process.exit(0);
	} catch (error) {
		console.error("Seeding error:", error);
		process.exit(1);
	}
})();
