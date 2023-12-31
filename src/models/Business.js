import Sequelize from "sequelize";
import sequelize from "../config/database.js";

class Business extends Sequelize.Model {}

Business.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
    },
    phoneNumber: {
      type: Sequelize.BIGINT,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { sequelize: sequelize, modelName: "businesses" }
);

export default Business;
