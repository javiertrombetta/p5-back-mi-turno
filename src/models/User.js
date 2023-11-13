import Sequelize from "sequelize";
import sequelize from "../config/database.js";
import Reserva from "./Reserva.js";

class User extends Sequelize.Model {}

User.init(
  {
    dni: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    firstAndLastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
    },
    contact: {
      type: Sequelize.INTEGER,
    },
    rol: {
      type: Sequelize.ENUM("admin", "user", "oper"),
      defaultValue: "user",
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    salt: {
      type: Sequelize.STRING,
    },
  },

  { sequelize: sequelize, modelName: "users" }
);

User.hasMany(Reserva);
Reserva.belongsTo(User)


export default User;
