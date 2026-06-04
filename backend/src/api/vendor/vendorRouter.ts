import express, { type Router } from "express";
import { vendorController } from "./vendorController";

export const vendorRouter: Router = express.Router();

vendorRouter.get("/", vendorController.getAll);
vendorRouter.get("/find", vendorController.findByName);
vendorRouter.post("/new", vendorController.create);
