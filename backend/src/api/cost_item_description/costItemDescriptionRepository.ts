import type { CreateCostItemDescriptionDTO } from "./costItemDescriptionDTO";
import { type CostItemDescriptionCreationAttribute, CostItemDescriptionModel } from "./costItemDescriptionModel";

export class CostItemDescriptionRepository {
	async getAll(): Promise<CostItemDescriptionModel[]> {
		return await CostItemDescriptionModel.findAll();
	}

	async create(data: CreateCostItemDescriptionDTO): Promise<CostItemDescriptionModel> {
		const costItemDesc: CostItemDescriptionCreationAttribute = {
			description: data.description,
		};
		return await CostItemDescriptionModel.create(costItemDesc);
	}
}
