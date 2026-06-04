import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../../api/user/userRepository";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { signJWT } from "../../common/utils/jsonWebToken";
import { toUser } from "../../common/utils/mapper";
import { logger } from "../../server";
import type { GetUserDTO, TokenDTO } from "./userDTO";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}

	async findById(id: string): Promise<ServiceResponse<GetUserDTO | null>> {
		try {
			const model = await this.userRepository.findById(id);

			if (!model) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			const user = model.get({ plain: true });

			return ServiceResponse.success("User found", toUser(user));
		} catch (ex) {
			logger.error(`Error finding user ${id}: ${(ex as Error).message}`);
			return ServiceResponse.failure("An error occurred while finding user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async findByEmail(email: string, password: string): Promise<ServiceResponse<TokenDTO | null>> {
		try {
			const model = await this.userRepository.findByEmail(email);

			if (!model) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			const user = model.get({ plain: true });

			if (user.password_hash !== password) {
				return ServiceResponse.failure("Email or Password is invalid", null, StatusCodes.BAD_REQUEST);
			}

			const jwt = signJWT(user);
			return ServiceResponse.success("Login success", { token: jwt }, StatusCodes.OK);
		} catch (ex) {
			logger.error(`Error finding user ${(ex as Error).message}`);
			return ServiceResponse.failure("An error occurred while finding user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const userService = new UserService();
