import Sequelize from "sequelize";
import { config } from "dotenv";

config();

const sequelize = new Sequelize(process.env.DB_NAME, null, null, {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: "postgres",
  logging: false,
});

export default sequelize;