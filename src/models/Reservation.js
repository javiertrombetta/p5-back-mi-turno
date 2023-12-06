import Sequelize from "sequelize";
import sequelize from "../config/database.js";

class Reservation extends Sequelize.Model {}

Reservation.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    state: {
      type: Sequelize.ENUM(
        "pendiente",
        "confirmado",
        "cancelado",
        "finalizado",
        "ausente"
      ),
      defaultValue: "pendiente",
    },
    clientName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    clientPhone: {
      type: Sequelize.BIGINT,
    },
    clientEmail: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    qrToken: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    branchId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "branches",
        key: "id",
      },
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "dni",
      },
    },
  },
  { sequelize: sequelize, modelName: "reservations" }
);

Reservation.addHook('beforeCreate', async (reservation, options) => {
  const existingReservation = await Reservation.findOne({
    where: { qrToken: reservation.qrToken }
  });
  if (existingReservation) {
    throw new Error('qrToken must be unique');
  }
});

export default Reservation;


