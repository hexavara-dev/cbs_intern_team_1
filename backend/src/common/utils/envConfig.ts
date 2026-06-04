import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	JWT_SECRET: z.string().default("aldoger"),

	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),

	HOST: z.string().min(1).default("localhost"),

	PORT: z.coerce.number().int().positive().default(8080),

	CORS_ORIGIN: z.string().url().default("http://localhost:3000"),

	COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(1000),

	COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

	DB_HOST: z.string().default("localhost"),

	DB_USERNAME: z.string().default("aldoger"),

	DB_PORT: z.coerce.number().int().default(5432),

	DB_PASSWORD: z.string().default("aldoger"),

	DB_NAME: z.string().default("hexavara"),

	POSTGRES_PRODUCTION_URL: z.string().optional(),

	FRONTEND_URL: z.string().default("https://hexavara-cbs-frontend.vercel.app"),

	APP_URL: z.string().default("http://localhost:8080"),
});

export const env = (() => {
	const parsed = envSchema.parse(process.env);

	return {
		...parsed,
		isDevelopment: parsed.NODE_ENV === "development",
		isProduction: parsed.NODE_ENV === "production",
		isTest: parsed.NODE_ENV === "test",
	};
})();
