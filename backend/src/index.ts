import { ConnectDB, sequelize } from "../db/sequelize";
import { env } from "./common/utils/envConfig";
import app, { logger } from "./server";

(async () => {
	try {
		await ConnectDB(sequelize);
		logger.info("DB connected");
	} catch (err) {
		logger.error(`DB connection failed ${err}`);
		process.exit(1);
	}

	const server = app.listen(env.PORT, env.HOST, () => {
		const { NODE_ENV, HOST, PORT } = env;
		logger.info(`Server (${NODE_ENV}) running on http://${HOST}:${PORT}`);
	});

	const onCloseSignal = () => {
		logger.info("SIGINT received, shutting down");
		server.close(() => {
			logger.info("server closed");
			process.exit(0);
		});

		setTimeout(() => process.exit(1), 10000).unref();
	};

	process.on("SIGINT", onCloseSignal);
	process.on("SIGTERM", onCloseSignal);
})();
