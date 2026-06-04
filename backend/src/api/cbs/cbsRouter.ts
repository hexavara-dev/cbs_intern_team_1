import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { cbsController } from "./cbsController";

export const cbsRouter: Router = express.Router();

cbsRouter.get("/", authMiddleware, cbsController.getAllCBS);

cbsRouter.post("/", authMiddleware, cbsController.createCBS);

cbsRouter.put("/:id", authMiddleware, cbsController.updateCBS);
