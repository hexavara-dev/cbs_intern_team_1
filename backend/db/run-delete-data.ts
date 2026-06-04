import { sequelize } from "../db/sequelize";

(async () => {
	await sequelize.truncate({ cascade: true });
})();
