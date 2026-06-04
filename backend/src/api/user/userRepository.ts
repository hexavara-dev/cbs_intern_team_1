import type { UserCreationAttributes } from "../../api/user/userModel";
import { UserModel } from "../../api/user/userModel";

export class UserRepository {
	async register(data: UserCreationAttributes): Promise<UserModel> {
		return UserModel.create(data);
	}

	async findAll(): Promise<UserModel[]> {
		return UserModel.findAll();
	}

	async findById(id: string): Promise<UserModel | null> {
		return await UserModel.findOne({
			where: {
				id: id,
			},
		});
	}

	async findByEmail(email: string): Promise<UserModel | null> {
		return await UserModel.findOne({
			where: {
				email: email,
			},
		});
	}
}
