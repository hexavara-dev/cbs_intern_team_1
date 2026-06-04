import express, { type Router } from "express";
import { authMiddleware } from "../../common/middleware/auth";
import { costItemDescriptionController } from "./costItemDescriptionController";

export const costItemDescriptionRoute: Router = express.Router();

costItemDescriptionRoute.get("", authMiddleware, costItemDescriptionController.getAll);
costItemDescriptionRoute.post("", authMiddleware, costItemDescriptionController.create);
