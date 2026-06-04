import express, { type Router } from "express";
import { terminAllocationController } from "./terminAllocationController";

export const terminAllocationRouter: Router = express.Router();

terminAllocationRouter.get("/:projectId/wbs-termin-planning", terminAllocationController.getAllocatedWBSInTermin);
terminAllocationRouter.post("/:projectId/termin-allocations", terminAllocationController.allocateWBS);
