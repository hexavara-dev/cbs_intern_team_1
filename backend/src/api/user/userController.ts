import type { Request, RequestHandler } from "express";
import { userService } from "../../api/user/userService";
import { commonValidations } from "../../common/utils/commonValidation";
import type { LoginDTO } from "./userDTO";

class UserController {
	public getUserById: RequestHandler = async (req, res) => {
		const id = req.userId;

		console.log(id);

		const parsed = commonValidations.id.safeParse(id);

		if (!parsed.success) {
			return res.status(400).json({
				message: "Invalid user id",
				errors: parsed.error.format(),
			});
		}

		const serviceResponse = await userService.findById(id);

		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public login: RequestHandler = async (req: Request<unknown, unknown, LoginDTO>, res) => {
		const { email, password } = req.body;
		const serviceResponse = await userService.findByEmail(email, password);
		res.status(serviceResponse.statusCode).json(serviceResponse);
	};
}

export const userController = new UserController();
