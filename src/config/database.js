
import Sequelize from "sequelize";
import { config } from "dotenv";

if (process.env.NODE_ENV === "production") {
  config({ path: '.env.production' });
} else {
  config({ path: '.env' });
}

const dbName = process.env.NODE_ENV === 'production' ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME;
const dbUser = process.env.NODE_ENV === 'production' ? process.env.PROD_DB_USER : process.env.DEV_DB_USER;
const dbPassword = process.env.NODE_ENV === 'production' ? process.env.PROD_DB_PASSWORD : process.env.DEV_DB_PASSWORD;
const dbHost = process.env.NODE_ENV === 'production' ? process.env.PROD_DB_HOST : process.env.DEV_DB_HOST;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: "postgres",
  logging: false,
});

export default sequelize;