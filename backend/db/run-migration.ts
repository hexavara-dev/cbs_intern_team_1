import { setupAssociations } from "./associations";
import { Migrate } from "./migration/migration";

(async () => {
	console.log("Starting migration...");
	try {
		setupAssociations();
		const success = await Migrate();
		if (success) {
			console.log("Migration successful");
			process.exit(0);
		} else {
			console.error("Migration failed");
			process.exit(1);
		}
	} catch (error) {
		console.error("Migration error:", error);
		process.exit(1);
	}
})();
