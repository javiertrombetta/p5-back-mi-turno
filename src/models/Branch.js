import Sequelize from "sequelize";
import sequelize from "../config/database.js";
// import Reserva from "./Reserva.js";

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
    contact: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    capacity: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    openingtime: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    closingtime: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },

  { sequelize: sequelize, modelName: "branches", timestamps: false }
);

export default Branch;

// User.hasMany(Reserva);
// Reserva.belongsTo(User)
