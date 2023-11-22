import Sequelize from "sequelize";
import sequelize from "../config/database.js";

class Branch extends Sequelize.Model {}

Branch.init(
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
      type: Sequelize.INTEGER,
    },
    address: {
      type: Sequelize.STRING,
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    openingTime: {
      type: Sequelize.STRING,
    },
    closingTime: {
      type: Sequelize.STRING,
    }
  },
  { sequelize: sequelize, modelName: "branches" }
);

export default Branch;
