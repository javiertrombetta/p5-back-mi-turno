import Sequelize from "sequelize";
import sequelize from "../config/database.js";
import Reserva from "./Reservation.js";
import bcrypt, { genSaltSync } from "bcrypt";
class User extends Sequelize.Model {
  hash(password, salt) {
    return bcrypt.hash(password, salt);
  }

  validatePassword(password) {
    //al ser metodo de instancia usamos this
    return this.hash(password, this.salt).then(
      (newHash) => newHash === this.password
    );
  }
}

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
      unique: true,
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

// export const User = sequelize.define('users', {

//     dni: {
//       type: Sequelize.INTEGER,
//       primaryKey: true,
//     }

// })

User.beforeCreate((user) => {
  user.salt = genSaltSync(10);
  return user
    .hash(user.password, user.salt)
    .then((hash) => (user.password = hash));
});

User.beforeUpdate((user) => {
  user.salt = genSaltSync(10);
  return user
    .hash(user.password, user.salt)
    .then((hash) => (user.password = hash));
})

User.hasMany(Reserva);
Reserva.belongsTo(User);

export default User;
