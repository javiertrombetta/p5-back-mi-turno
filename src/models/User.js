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
  photo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  lastLogin: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },  
  resetPasswordToken: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  businessId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'businesses',
      key: 'id'
    },
    allowNull: true
  },
  branchId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'branches',
      key: 'id'
    },
    allowNull: true
  },
}, 
{ sequelize: sequelize, modelName: "users" });

export default User;