import { VendorModel } from "../../src/api/vendor/vendorModel";
import { logger } from "../../src/server";

export const seedVendors = async () => {
	try {
		// tambah data seed vendor disini
		const vendors = [
			{
				name: "PT Maju Jaya Abadi",
				contact_person: "Budi Santoso",
				phone: "081234567890",
				email: "budi@majuyaya.com",
				address: "Jl. Raya Industri No. 12, Surabaya",
			},
			{
				name: "CV Sumber Rejeki",
				contact_person: "Andi Wijaya",
				phone: "082233445566",
				email: "andi@sumberrejeki.co.id",
				address: "Jl. Kenjeran No. 45, Surabaya",
			},
			{
				name: "PT Global Konstruksi",
				contact_person: "Rina Hartati",
				phone: "083344556677",
				email: "rina@globalkonstruksi.com",
				address: "Jl. Ahmad Yani No. 88, Surabaya",
			},
		];

		for (const vendor of vendors) {
			const [vendorModel, created] = await VendorModel.findOrCreate({
				where: { name: vendor.name }, // unique constraint by name
				defaults: vendor,
			});

			if (created) {
				logger.info(`Vendor ${vendor.name} created.`);
			} else {
				logger.info(`Vendor ${vendor.name} already exists.`);
			}
		}

		logger.info("Vendor seeding completed.");
		return true;
	} catch (error) {
		logger.error(`Error seeding vendors: ${(error as Error).message}`);
		return false;
	}
};
