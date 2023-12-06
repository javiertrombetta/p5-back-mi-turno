
import Sequelize from "sequelize";

const dbName = process.env.DEV_DB_NAME || 'mtw';
const dbUser = process.env.DEV_DB_USER || null;
const dbPassword = process.env.DEV_DB_PASSWORD || null;
const dbHost = process.env.DEV_DB_HOST || 'localhost';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: "postgres",
  logging: false,
});

export default sequelize;