import type { RequestHandler } from "express";
import { verifyJWT } from "../utils/jsonWebToken";

export const authMiddleware: RequestHandler = (req, res, next) => {
	const authHeader = req.headers.authorization as string;

	if (!authHeader.startsWith("Bearer "))
		return res.status(401).json({
			message: "Unauthorize",
		});

	const token = authHeader.split(" ")[1];
	const user = verifyJWT(token);

	if (!user) {
		return res.status(401).json({
			message: "Unauthorize",
		});
	}

	req.userId = user?.id as string;
	req.full_name = user?.full_name as string;
	req.role = user?.role as string;
	req.email = user?.email as string;
	next();
};
