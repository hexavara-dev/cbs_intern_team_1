import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { setupAssociations } from "../db/associations";
import { cbsRouter } from "./api/cbs/cbsRouter";
import { costInRouter } from "./api/cost_in/costInRouter";
import { costItemDescriptionRoute } from "./api/cost_item_description/costItemDescriptionRoute";
import {
	costRecordApprovelRouter,
	costRecordReportRouter,
	costRecordRouter,
} from "./api/cost_records/costRecordRouter";
import { healthCheckRouter } from "./api/healthCheck/healthCheckRouter";
import { progressRouter } from "./api/progress/progressRouter";
import { projectCbsRouter } from "./api/project_cbs/projectCBSRouter";
import { projectRouter } from "./api/projects/projectRouter";
import { terminRouter } from "./api/termin/terminRoute";
import { terminAllocationRouter } from "./api/termin_allocations/terminAllocationRoute";
import { userRouter } from "./api/user/userRouter";
import { vendorRouter } from "./api/vendor/vendorRouter";
import { wbsRouter } from "./api/wbs/wbsRouter";
import errorHandler from "./common/middleware/errorHandler";
import rateLimiter from "./common/middleware/rateLimiter";
import requestLogger from "./common/middleware/requestLogger";
import { env } from "./common/utils/envConfig";

export const logger = pino({
	name: "server",
});
const app: Express = express();

setupAssociations();

// Set the application to trust the reverse proxy { error message might set false }
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: [env.CORS_ORIGIN, env.FRONTEND_URL],
		credentials: false,
	}),
);
app.use("/nota", express.static("nota"));
app.use("/bukti", express.static("bukti"));
app.use("/progress", express.static("progress"));
app.use("/receipt", express.static("receipt"));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/cbs", cbsRouter);
app.use("/projects", costRecordRouter);
app.use("/projects", projectRouter);
app.use("/projects", projectCbsRouter);
app.use("/projects", wbsRouter);
app.use("/projects", terminRouter);
app.use("/projects", terminAllocationRouter);
app.use("/vendors", vendorRouter);
app.use("/cost-item-description", costItemDescriptionRoute);
app.use("/projects", progressRouter);
app.use("/projects", costInRouter);
app.use("/cost-report", costRecordReportRouter);
app.use("/costs", costRecordApprovelRouter);

// Error handlers
app.use(errorHandler());

export default app;
