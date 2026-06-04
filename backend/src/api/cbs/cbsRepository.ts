import type { CreateCBSDTO, UpdateCBSDTO } from "./cbsDTO";
import { type CBSCreationAttributes, CBSModel } from "./cbsModel";

export class CBSRepository {
	async create(data: CreateCBSDTO, id: string): Promise<CBSModel> {
		const newCBS: CBSCreationAttributes = {
			name: data.name,
			description: data.description,
			cost_type: data.cost_type,
			created_by: id,
		};

		return await CBSModel.create(newCBS);
	}

	async findAll(): Promise<CBSModel[]> {
		return await CBSModel.findAll();
	}

	async findAllByUser(id: string): Promise<CBSModel[]> {
		return await CBSModel.findAll({
			where: {
				created_by: id,
			},
		});
	}

	async findByName(name: string): Promise<CBSModel | null> {
		return CBSModel.findOne({
			where: { name },
		});
	}

	async findById(id: string): Promise<CBSModel | null> {
		return CBSModel.findOne({
			where: { id },
		});
	}

	async update(data: UpdateCBSDTO, id: string): Promise<CBSModel | null> {
		const [affected, rows] = await CBSModel.update(
			{
				name: data.name,
				cost_type: data.cost_type,
			},
			{
				where: { id },
				returning: true,
			},
		);

		if (affected === 0) return null;

		return rows[0];
	}
}
