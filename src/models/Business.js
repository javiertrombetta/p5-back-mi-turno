import Sequelize from "sequelize";
import sequelize from "../config/database.js";
import Reserva from "./Reservation.js";
import Branch from "./Branch.js";

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
    contact: {
      type: Sequelize.INTEGER,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  },

  { sequelize: sequelize, modelName: "business" }
);



Business.hasMany(Branch);
Branch.belongsTo(Business)

export default Business;