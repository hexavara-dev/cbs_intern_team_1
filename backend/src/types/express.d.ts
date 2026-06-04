import "express";

declare global {
	namespace Express {
		interface Request {
			userId: string;
			role: string;
			email: string;
			full_name: string;
		}
	}
}
