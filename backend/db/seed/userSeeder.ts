import { UserModel } from "../../src/api/user/userModel";
import { Role } from "../../src/api/user/userSchema";
import { logger } from "../../src/server";

export const seedUsers = async () => {
	try {
		const users = [
			{
				email: "admin@hexavara.com",
				password_hash: "admin123",
				full_name: "Admin Hexavara",
				role: Role.PM,
				is_active: true,
			},
			{
				email: "mandor@hexavara.com",
				password_hash: "mandor123",
				full_name: "Mandor Lapangan",
				role: Role.M,
				is_active: true,
			},
			{
				email: "nainggolanben12@gmail.com",
				password_hash: "aldoger",
				full_name: "Geraldo",
				role: Role.PM,
				is_active: true,
			},
		];

		let selectedUserId: string | null = null;

		for (const user of users) {
			const [userModel, created] = await UserModel.findOrCreate({
				where: { email: user.email },
				defaults: user,
			});

			if (created) {
				logger.info(`User ${user.email} created.`);
			} else {
				logger.info(`User ${user.email} already exists.`);
			}

			// ambil id user aldoger
			if (user.email === "nainggolanben12@gmail.com") {
				selectedUserId = userModel.dataValues.id;
			}
		}

		logger.info("User seeding completed.");

		if (!selectedUserId) {
			throw new Error("Target user not found");
		}

		return selectedUserId;
	} catch (error) {
		logger.error(`Error seeding users: ${(error as Error).message}`);
		throw error; // lebih baik throw supaya bisa di-chain ke seeder lain
	}
};
