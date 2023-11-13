import { Sequelize } from "sequelize";

import sequelize from "../config/database.js";

class Reserva extends Sequelize.Model{}

Reserva.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  }
},
{ sequelize: sequelize, modelName: "favorites" }
);

export default Reserva;