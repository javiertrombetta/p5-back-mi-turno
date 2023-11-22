import Sequelize from "sequelize";
import sequelize from "../config/database.js";
class User extends Sequelize.Model {   
}

User.init({
  dni: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  fullName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
  },
  phoneNumber: {
    type: Sequelize.INTEGER,
  },
  role: {
    type: Sequelize.ENUM("super", "admin", "oper", "user"),
    defaultValue: "user",
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },  
  photo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  lastLogin: {
    type: Sequelize.DATE,
    allowNull: true,
  },
}, 
{ sequelize: sequelize, modelName: "users" });

export default User;

