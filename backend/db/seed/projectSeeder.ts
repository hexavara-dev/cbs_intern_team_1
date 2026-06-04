import { ProjectModel } from "../../src/api/projects/projectModel";
import { logger } from "../../src/server";

export const seedProject = async (userId: string) => {
	try {
		const projects = [
			{
				name: "Project A",
				description: "Pembangunan Gedung A",
				location: "Jakarta",
				budget: 100000000,
				start_date: new Date("2024-01-01"),
				end_date: new Date("2024-12-31"),
				created_by: userId,
				is_termin_by_progress: false,
			},
			{
				name: "Project B",
				description: "Renovasi Gedung B",
				location: "Bandung",
				budget: 50000000,
				start_date: new Date("2024-02-01"),
				end_date: new Date("2024-10-31"),
				created_by: userId,
				is_termin_by_progress: false,
			},
		];

		let selectedProject: string | null = null;

		for (const project of projects) {
			const [projectModel, created] = await ProjectModel.findOrCreate({
				where: {
					name: project.name, // unique identifier (adjust kalau perlu)
				},
				defaults: project,
			});

			if (created) {
				logger.info(`Project ${project.name} created.`);
			} else {
				logger.info(`Project ${project.name} already exists.`);
			}

			// ambil Project A
			if (project.name === "Project A") {
				selectedProject = projectModel.dataValues.id;
			}
		}

		logger.info("Project seeding completed.");

		if (!selectedProject) {
			throw new Error("Target project not found");
		}

		return selectedProject;
	} catch (error) {
		logger.error(`Error seeding project: ${(error as Error).message}`);
		throw error;
	}
};
