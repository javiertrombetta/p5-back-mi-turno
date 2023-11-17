import Sequelize from "sequelize";
import { config } from "dotenv";

config();

const sequelize = new Sequelize(process.env.DB_NAME, null, null, {
  host: process.env.DB_HOST,

  dialect: "postgres",
  logging: false,
});

export default sequelize;
