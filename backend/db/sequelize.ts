import { Sequelize } from "sequelize";
import { env } from "../src/common/utils/envConfig";
import "pg";

const isProduction = env.NODE_ENV === "production";

const poolConfig = { max: 5, min: 0, idle: 10000, acquire: 30000 };

export const sequelize = isProduction
	? new Sequelize(env.POSTGRES_PRODUCTION_URL as string, {
			dialect: "postgres",
			logging: false,
			dialectOptions: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			},
			pool: poolConfig,
		})
	: new Sequelize({
			dialect: "postgres",
			host: env.DB_HOST,
			port: env.DB_PORT,
			username: env.DB_USERNAME,
			password: env.DB_PASSWORD,
			database: env.DB_NAME,
			logging: false,
			pool: poolConfig,
		});

export async function ConnectDB(db: Sequelize): Promise<void> {
	try {
		await db.authenticate();
		console.info("Database connection established");
	} catch (err) {
		console.error("Unable to connect to the database:", (err as Error).message);
		throw err;
	}
}
