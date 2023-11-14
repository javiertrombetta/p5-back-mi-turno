import Sequelize from "sequelize";

const sequelize = new Sequelize("mtw", null, null, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

export default sequelize;
