import Reservation from "../models/Reservation.js";

const reservationController = {
  createReservation: async (req, res) => {
    const { userId, branchId, date, time, state } = req.body;

    try {      
      const newReservation = await Reservation.create({
        userId,
        branchId,
        date,
        time,
        state: state || 'pendiente'
      });

      res.status(201).json(newReservation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear la reserva" });
    }
  },
  getAllReservations: async (req, res) => {
    try {
      const allReservations = await Reservation.findAll();
      res.status(200).json(allReservations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getReservationById: async (req, res) => {
    try {
      const reservation = await Reservation.findByPk(req.params.id);
      if (reservation) {
        res.json(reservation);
      } else {
        res.status(404).json({ error: "Reserva no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getUserReservations: async (req, res) => {
    try {
      const userDni = req.params.dni;
      const userReservations = await Reservation.findAll({
        where: { userDni },
      });
      if (userReservations.length > 0) {
        res.json(userReservations);
      } else {
        res.status(404).json({ error: "No se encontraron reservas para el usuario" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateReservation: async (req, res) => {
    try {
      const updatedReservation = await Reservation.findByPk(req.params.id);
      if (updatedReservation) {
        await updatedReservation.update(req.body);
        res.json(updatedReservation);
      } else {
        res.status(404).json({ error: "Reserva no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default reservationController;

