import type { UpdateTermin } from "./terminDTO";
import { TerminModel } from "./terminModel";

export class TerminRepository {
	async getProjectTermin(projectId: string): Promise<TerminModel[]> {
		return await TerminModel.findAll({
			where: {
				project_id: projectId,
			},
		});
	}

	async updateTermin(terminId: string, projecId: string, data: UpdateTermin): Promise<TerminModel | null> {
		const termin = await TerminModel.findOne({
			where: {
				id: terminId,
				project_id: projecId,
			},
		});
		if (!termin) {
			return null;
		}
		termin.set({
			description: data.description,
			nominal: data.nominal,
		});
		await termin.save();
		return termin;
	}

	async deleteTermin(terminId: string, projectId: string): Promise<number> {
		return await TerminModel.destroy({
			where: {
				id: terminId,
				project_id: projectId,
			},
		});
	}
}
