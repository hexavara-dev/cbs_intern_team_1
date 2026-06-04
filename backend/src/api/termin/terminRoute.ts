import express, { type Router } from "express";
import { terminController } from "./terminController";

export const terminRouter: Router = express.Router();

terminRouter.get("/:projectId/termins", terminController.getTermin);
terminRouter.patch("/:projectId/termins/termins/:terminId", terminController.updateTermin);
terminRouter.delete("/:projectId/termins/:terminId", terminController.deleteTermin);
