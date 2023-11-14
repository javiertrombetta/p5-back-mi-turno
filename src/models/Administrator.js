import Sequelize from "sequelize";

import sequelize from "../config/database.js";
import User from "./User.js";

class Administrator extends Sequelize.Model {}

Administrator.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { sequelize: sequelize, modelName: "administrators" }
);

User.hasMany(Administrator);
Administrator.belongsTo(User);

export default Administrator;
