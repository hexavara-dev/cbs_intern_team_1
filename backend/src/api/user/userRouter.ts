import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { userController } from "./userController";

export const userRouter: Router = express.Router();

userRouter.get("/me", authMiddleware, userController.getUserById);

userRouter.post("/login", userController.login);
