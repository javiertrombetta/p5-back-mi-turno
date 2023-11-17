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
    },
    contact: {
      type: Sequelize.INTEGER,
    },
    address: {
      type: Sequelize.STRING,
   
    },
    capacity: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    openingtime: {
      type: Sequelize.STRING,
    },
    closingtime: {
      type: Sequelize.STRING,
    }
  },

  { sequelize: sequelize, modelName: "branches" }
);

export default Branch;


// User.hasMany(Reserva);
// Reserva.belongsTo(User)