import express from "express";
import Reservation from "../models/Reservation.js";
const router = express.Router();

router.get("/allReservations", async (req, res) => {
  try {
    const allReservations = await Reservation.findAll();
    res.status(200).json(allReservations);
  } catch (error) {
    res.status(500).send("Error al obtener las reservas");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);

    if (reservation) {
      res.status(200).send(reservation);
    } else {
      res.status(404).send("Reserva no encontrada");
    }
  } catch (error) {
    res.status(500).send("Error al obtener la reserva");
  }
});

router.get("/get/:dni", async (req, res) => {
  try {
    const userDni = req.params.dni;
    const userReservations = await Reservation.findAll({
      where: { userDni },
    });
    if (userReservations.length > 0) {
      res.status(200).send(userReservations);
    } else {
      res.status(404).send("No se encontraron reservas para el usuario");
    }
  } catch (error) {
    res.status(500).send("Error al obtener las reservas del usuario");
  }
});

export default router;
