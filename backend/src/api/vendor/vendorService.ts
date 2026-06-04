import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { logger } from "../../server";
import type { GetVendorDTO } from "./vendorDTO";
import { VendorRepository } from "./vendorRepository";

export class VendorService {
	private repository: VendorRepository;

	constructor(repository: VendorRepository = new VendorRepository()) {
		this.repository = repository;
	}

	async findVendorByName(name: string): Promise<ServiceResponse<GetVendorDTO[] | null>> {
		try {
			const model = await this.repository.findVendorsByName(name);
			if (model.length === 0) {
				return ServiceResponse.success("Vendors not found", null, StatusCodes.OK);
			}
			const vendors = model.map((vendor) => {
				return vendor.get({ plain: true });
			});
			const vendorData: GetVendorDTO[] = vendors.map((vendor) => {
				return {
					id: vendor.id,
					name: vendor.name,
				};
			});
			return ServiceResponse.success("Vendor found", vendorData, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async getAll(): Promise<ServiceResponse<GetVendorDTO[] | null>> {
		try {
			const model = await this.repository.findAll();
			if (model.length === 0) {
				return ServiceResponse.success("Vendors not found", null, StatusCodes.OK);
			}
			const vendors = model.map((vendor) => {
				return vendor.get({ plain: true });
			});
			const vendorData: GetVendorDTO[] = vendors.map((vendor) => {
				return {
					id: vendor.id,
					name: vendor.name,
				};
			});
			return ServiceResponse.success("Vendor found", vendorData, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async makeNewVendor(name: string): Promise<ServiceResponse<GetVendorDTO | null>> {
		try {
			const model = await this.repository.createNewVendor(name);
			const vendor = model.get({ plain: true });
			const vendorData: GetVendorDTO = {
				id: vendor.id,
				name: vendor.name,
			};
			return ServiceResponse.success("Vendor created successfully", vendorData, StatusCodes.OK);
		} catch (err) {
			logger.error(err);

			return ServiceResponse.failure("Internal server error", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const vendorService = new VendorService();
