import Sequelize from "sequelize";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import Branch from "../models/Branch.js";
import Business from "../models/Business.js";

import { transporter } from "../config/mailTransporter.js";

const reservationController = {
  createReservation: async (req, res) => {

    const { branchId, date, time } = req.body;
    const userId = req.user.dni;

    try {    
      if (!date || !time || !branchId) {
        return res.status(400).json({ message: "Datos de la reserva incompletos" });
      }
      const newReservation = await Reservation.create({
        userId,
        branchId,
        date,
        time,
        state: 'pendiente'
      });
      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: req.user.email,
        subject: 'Confirmación de Reserva',
        html: `<h3>Hola ${req.user.fullName},</h3>
              <p>Tu reserva ha sido creada con éxito:</p>
              <ul>
              <li>Fecha: ${date}</li>
              <li>Hora: ${time}</li>
              <li>Sucursal: ${branchId}</li>
              </ul>`
      };

      await transporter.sendMail(mailOptions);

      res.status(201).json(newReservation);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear la reserva" });
    }
  },
  getUserReservations: async (req, res) => {
    try {        
      const userDni = req.user.dni;
      const userReservations = await Reservation.findAll({
        where: { userId: req.user.dni },
        include: {
          model: Branch,
          attributes: ['name', 'address'],
          include: {
            model: Business,
            attributes: ['name']
          }
        },
        attributes: ['id', 'date', 'time', 'state']
      });
      if (userReservations.length > 0)
      {
        res.json(userReservations);
      } 
      else
      {
        res.status(404).json({ message: "No se encontraron reservas para el usuario" });
      }
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  getBranchReservations: async (req, res) => {
    try {
      if (req.user.rol !== 'oper' || !req.user.BranchId) {
        return res.status(403).json({ message: 'Acceso restringido' });
      }
      const branchReservations = await Reservation.findAll({
        where: { branchId: req.user.branchId },
        include: {
          model: User,
          attributes: ['dni', 'fullName', 'email']
        },
        attributes: ['id', 'date', 'time', 'state']
      });

      if (branchReservations.length > 0) {
        res.json(branchReservations);
      } else {
        res.status(404).json({ message: "No se encontraron reservas para la sucursal" });
      }
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  updateReservationStatus: async (req, res) => {
    const { id } = req.params;
    const { state } = req.body;

    try {
      const reservation = await Reservation.findByPk(id, {
        include: {
          model: Branch, 
          as: 'branches'
        }
      });
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
      }
      if (req.user.rol !== 'oper' || reservation.branchId !== req.user.BranchId) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
      if (!['pendiente', 'confirmado', 'cancelado', 'finalizado', 'ausente'].includes(state)) {
        return res.status(400).json({ message: 'Estado inválido' });
      }
      reservation.state = state;
      await reservation.save();
      res.json({ message: 'Estado de la reserva actualizado con éxito', reservation });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  getReservationMetrics: async (req, res) => {
    try {
      const adminBusinessId = req.user.BusinessId;
      if (!adminBusinessId) 
      {
        return res.status(400).json({ message: 'Información de empresa no disponible' });
      }
      const branches = await Branch.findAll({
        where: { businessId: adminBusinessId },
        attributes: ['id', 'name']
      });
      const branchIds = branches.map(branch => branch.id);
      const metrics = {
        peakTimes: {},
        averageCancellations: {},
        mostVisitedBranches: {},
        operatorCount: {}
      };

      const peakTimes = await Reservation.findAll({
        attributes: [
          [Sequelize.fn('date_part', 'hour', Sequelize.col('date')), 'hour'],
          [Sequelize.fn('count', Sequelize.col('id')), 'count']
        ],
        where: {
          branchId: branchIds,
          state: ['confirmado', 'finalizado']
        },
        group: ['hour'],
        order: [[Sequelize.fn('count', Sequelize.col('id')), 'DESC']],
        limit: 1
      });
      metrics.peakTimes = peakTimes;

      const cancellationCounts = await Reservation.findAll({
        attributes: [
          'branchId',
          [Sequelize.fn('count', Sequelize.col('id')), 'cancelCount']
        ],
        where: {
          branchId: branchIds,
          state: 'cancelado'
        },
        group: ['branchId']
      });
      cancellationCounts.forEach(cancelCount => {
        metrics.averageCancellations[cancelCount.branchId] = cancelCount.cancelCount / branches.length;
      }); 

      const visitedCounts = await Reservation.findAll({
        attributes: [
          'branchId',
          [Sequelize.fn('count', Sequelize.col('id')), 'visitCount']
        ],
        where: {
          branchId: branchIds,
          state: 'finalizado'
        },
        group: ['branchId'],
        order: [[Sequelize.fn('count', Sequelize.col('id')), 'DESC']],
        limit: 1
      });
      metrics.mostVisitedBranches = visitedCounts;
   
      const operatorsCount = await User.count({
        where: {
          role: 'oper',
          BranchId: branchIds
        },
        group: ['BranchId']
      });
      operatorsCount.forEach(count => {
        metrics.operatorCount[count.BranchId] = count.count;
      });

      res.json({ metrics });

    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },  
  getAllReservations: async (req, res) => {
    try {
      const allReservations = await Reservation.findAll({
        include: [
          {
            model: User,
            attributes: ['dni', 'fullName', 'email']
          },
          {
            model: Branch,
            include: {
              model: Business,
              attributes: ['name']
            },
            attributes: ['name', 'address']
          }
        ],
        attributes: ['id', 'date', 'time', 'state']
      });
      const formattedReservations = allReservations.map(reservation => {
        const timeString = reservation.time.toString().padStart(4, '0');
        const formattedTime = `${timeString.substring(0, 2)}:${timeString.substring(2)}`;
        return {
          ...reservation.get({ plain: true }),
          date: reservation.date.toISOString().substring(0, 10),
          time: formattedTime
        };
      });
      res.status(200).json(formattedReservations);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  getReservationById: async (req, res) => {
    try {
      const reservationId = req.params.id;
      const reservation = await Reservation.findByPk(reservationId, {
        include: [
          {
            model: User,          
            attributes: ['dni', 'fullName', 'email']
          },
          {
            model: Branch,
            include: {
              model: Business,        
              attributes: ['name', 'email']
            },
            attributes: ['name', 'address']
          }
        ],
        attributes: ['id', 'date', 'time', 'state']
      });
      if (!reservation) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }
      const timeString = reservation.time.toString().padStart(4, '0');
      const formattedTime = `${timeString.substring(0, 2)}:${timeString.substring(2)}`;
      const formattedReservation = {
        ...reservation.get({ plain: true }),
        date: reservation.date.toISOString().substring(0, 10),
        time: formattedTime
      };
      res.json(formattedReservation);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  modifyReservation: async (req, res) => {
    const reservationId = req.params.id;
    const { userId, branchId, date, time, state } = req.body;

    try {
      const reservation = await Reservation.findByPk(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
      }
      const formattedTime = time.toString().padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2');
      await reservation.update({
        userId: userId || reservation.userId,
        branchId: branchId || reservation.branchId,
        date: date || reservation.date,
        time: formattedTime,
        state: state || reservation.state
      });
      res.json({ message: 'Reserva modificada con éxito', reservation });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al modificar la reserva' });
    }
  },
  deleteReservation: async (req, res) => {
    const reservationId = req.params.id;
    try {
      const reservation = await Reservation.findByPk(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
      }
      await reservation.destroy();
      res.json({ message: 'Reserva eliminada con éxito' });
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar la reserva' });
    }
  }  
};

export default reservationController;