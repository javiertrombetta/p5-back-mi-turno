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
      allowNull: false,
    },
    phoneNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    openingTime: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    closingTime: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    turnDuration: {
      type: Sequelize.INTEGER, 
      allowNull: false,
      defaultValue: 30
    },
    businessId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'businesses',
        key: 'id'
      }
    },
  },
  { sequelize: sequelize, modelName: "branches", timestamps: false }
);

export default Branch;