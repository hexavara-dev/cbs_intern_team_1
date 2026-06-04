import { Op } from "sequelize";
import { VendorModel } from "./vendorModel";

export class VendorRepository {
	async findVendorsByName(keyword: string): Promise<VendorModel[]> {
		const words = keyword.split(" ");

		return await VendorModel.findAll({
			where: {
				[Op.and]: words.map((word) => ({
					name: {
						[Op.like]: `%${word}%`,
					},
				})),
			},
		});
	}

	async getVendorById(id: string): Promise<VendorModel | null> {
		return await VendorModel.findOne({
			where: {
				id: id,
			},
		});
	}

	async findAll(): Promise<VendorModel[]> {
		return await VendorModel.findAll();
	}

	async createNewVendor(vendorName: string): Promise<VendorModel> {
		return await VendorModel.create({
			name: vendorName,
			contact_person: "",
			phone: "",
			email: "",
			address: "",
		});
	}
}
