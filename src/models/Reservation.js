import Sequelize  from "sequelize";

import sequelize from "../config/database.js";
import Branch from "./Branch.js"

class Reservation extends Sequelize.Model{}

Reservation.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false
  },

  time: {
type: Sequelize.INTEGER,
allowNull: false
  },
  state : {
    type: Sequelize.ENUM("pendiente", "confirmado", "cancelado", "asistio", "ausente"),
    defaultValue: "pendiente"
  }
},
{ sequelize: sequelize, modelName: "reservations" }
);



Branch.hasMany(Reservation);
Reservation.belongsTo(Branch)

export default Reservation;