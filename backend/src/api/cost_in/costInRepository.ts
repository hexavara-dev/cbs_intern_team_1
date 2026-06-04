import { TerminCategory, TerminModel } from "../termin/terminModel";
import { UserModel } from "../user/userModel";
import type { MakeCostInDTO } from "./costInDTO";
import { CostInModel } from "./costInModel";

export class CostInRepository {
	async getProjectCostIn(projectId: string): Promise<CostInModel[]> {
		return await CostInModel.findAll({
			where: {
				project_id: projectId,
			},
			include: [
				{
					model: TerminModel,
					as: "termin",
				},
			],
		});
	}

	async getDetailCostIn(projectId: string, recordId: string): Promise<CostInModel | null> {
		return await CostInModel.findOne({
			where: {
				project_id: projectId,
				id: recordId,
			},
			include: [
				{
					model: TerminModel,
					as: "termin",
				},
				{
					model: UserModel,
					as: "uploader",
				},
			],
		});
	}

	async updateTerminTotalCostIn(terminId: string, costIn: number): Promise<number> {
		const [affeted] = await TerminModel.update(
			{
				total_cost_in: costIn,
			},
			{ where: { id: terminId } },
		);
		return affeted;
	}

	async getTerminNotPaid(projectId: string): Promise<TerminModel[]> {
		return await TerminModel.findAll({
			where: {
				project_id: projectId,
				paid: false,
			},
		});
	}

	async getAdendumTerminNotPaid(projectId: string): Promise<TerminModel[]> {
		return await TerminModel.findAll({
			where: {
				project_id: projectId,
				paid: false,
				category: TerminCategory.ADENDUM,
			},
		});
	}

	async getCostInSummary(projectId: string) {
		return await TerminModel.findAll({
			where: {
				project_id: projectId,
			},
			include: [
				{
					model: CostInModel,
					as: "cost_in",
					include: [
						{
							model: UserModel,
							as: "uploader",
						},
					],
				},
			],
		});
	}

	async makeCostIn(
		projectId: string,
		uploader: string,
		fileUrl: string,
		terminId: string,
		data: MakeCostInDTO,
	): Promise<CostInModel | null> {
		const costIn = await CostInModel.create({
			termin_id: terminId,
			project_id: projectId,
			transaction_date: data.transaction_date,
			amount: data.amount,
			created_by: uploader,
			description: data.description,
			proof_file: fileUrl,
		});

		return await CostInModel.findOne({
			where: { id: costIn.dataValues.id },
			include: [
				{
					model: TerminModel,
					as: "termin",
				},
				{
					model: UserModel,
					as: "uploader",
				},
			],
		});
	}
}
