import Sequelize  from "sequelize";

import sequelize from "../config/database.js";
import User from "./User.js"
import Branch from "./Branch.js";


class Operator extends Sequelize.Model{}

Operator.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  }
},
{ sequelize: sequelize, modelName: "administrators" }
);



User.hasMany(Operator);
Operator.belongsTo(User);
Operator.belongsTo(Branch)
Branch.hasMany(Operator)

export default Operator;