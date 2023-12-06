import Sequelize from "sequelize";
import { config } from "dotenv";

config({ path: '.env' });

const dbName = process.env.DEV_DB_NAME;
const dbUser = process.env.DEV_DB_USER;
const dbPassword = process.env.DEV_DB_PASSWORD;
const dbHost = process.env.DEV_DB_HOST;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: "postgres",
  logging: false,
});

export default sequelize;