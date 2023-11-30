import Sequelize from "sequelize";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import Branch from "../models/Branch.js";
import Business from "../models/Business.js";

import { transporter } from "../config/mailTransporter.js";
import validate from '../utils/validations.js';
import formatData from '../utils/formatData.js';
import emailService from '../utils/emailTemplates.js';
import dashboard from '../utils/metrics.js';

const reservationController = {
  createReservation: async (req, res) => {
    const { branchId, date, time, clientName, clientPhone, clientEmail } = req.body;
    const userId = req.user.dni;   
    if (!userId) {
      return res.status(400).json({ message: "Usuario no encontrado." });
    }
    if (!branchId) {
      return res.status(400).json({ message: "Se debe ingresar una sucursal." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "La sucursal ingresada es inválida." });
    }
    if (!date) {
      return res.status(400).json({ message: "Se debe ingresar una fecha." });
    }
    if (!validate.date(date)) {
      return res.status(400).json({ message: "La fecha seleccionada es inválida" });
    }
    if (!time) {
      return res.status(400).json({ message: "Se debe ingresar una hora." });
    }  
    if (!validate.time(time)) {
      return res.status(400).json({ message: "El horario seleccionado es inválido" });
    }
    if (!clientName) {
      return res.status(400).json({ message: "Se debe ingresar un nombre y apellido de la persona que asista." });
    }
    if (!validate.name(clientName)) {
      return res.status(400).json({ message: "El nombre y apellido no puede contener caracteres especiales." });
    }
    if (!clientPhone) {
      return res.status(400).json({ message: "Se debe ingresar un número de contacto de la persona que asista." });
    }
    if (!validate.phone(clientPhone)) {
      return res.status(400).json({ message: "El número de teléfono tiene que ser numérico." });
    }
    if (!clientEmail) {
      return res.status(400).json({ message: "Se debe ingresar un correo electrónico válido de la persona que asista." });
    }
    if (!validate.email(clientEmail)) {
      return res.status(400).json({ message: "Formato de correo electrónico no válido." });
    }       
    try {
      const newReservation = await Reservation.create({
        userId,
        branchId,
        date,
        time,
        state: 'pendiente',
        clientName,
        clientPhone,
        clientEmail
      });
      const userMailOptions = emailService.createReservation(req.user, {
        date: newReservation.date,
        time: newReservation.time,
        branchId: newReservation.branchId
      });
      const clientMailOptions = emailService.createReservationForClient(req.user, {
        clientName,
        clientEmail,
        date: newReservation.date,
        time: newReservation.time,
        branchId: newReservation.branchId
      });
      await transporter.sendMail(userMailOptions);
      if (req.user.email !== clientEmail) {
        await transporter.sendMail(clientMailOptions);
      }
      res.status(201).json(newReservation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear la reserva." });
    }
  },
  getUserReservations: async (req, res) => {
    try {        
      const userDni = req.user.dni;
      if (!userDni) {
        return res.status(400).json({ message: "Usuario no encontrado." });
      }
      if (!validate.dni(userDni)) {
        return res.status(400).json({ message: "DNI inválido." });
      }
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
        attributes: ['id', 'date', 'time', 'state', 'clientName', 'clientPhone', 'clientEmail']
      });
      if (userReservations.length > 0)
      {
        res.json(userReservations);
      } 
      else
      {
        res.status(404).json({ message: "No se encontraron reservas para el usuario." });
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
        attributes: ['id', 'date', 'time', 'state', 'clientName', 'clientPhone', 'clientEmail']
      });
      if (branchReservations.length > 0) {
        res.json(branchReservations);
      } else {
        res.status(404).json({ message: "No se encontraron reservas para la sucursal." });
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
    if (!state) {
      return res.status(400).json({ message: "Estado de reserva no ingresado." });
    }
    if (!validate.id(id)) {
      return res.status(400).json({ message: "El número de reserva es inválido." });
    }
    if (!validate.state(state)) {
      return res.status(400).json({ message: "El estado de la reserva es inválido." });
    }    
    try {
      const reservation = await Reservation.findByPk(id, {
        include: {
          model: Branch, 
          as: 'branches',
          include: {
            model: User,
            attributes: ['email', 'fullName']
          }
        }
      });
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada.' });
      }
      if (req.user.rol !== 'oper' || reservation.branchId !== req.user.BranchId) {
        return res.status(403).json({ message: 'Acceso denegado.' });
      }      
      reservation.state = state;
      await reservation.save();
      const userEmail = reservation.User.email;
      const userName = reservation.User.fullName;
      if (userEmail) {
        const mailOptions = emailTemplates.statusUpdateNotification({
          email: userEmail,
          fullName: userName,
          reservationId: id,
          newState: state
        });

        await transporter.sendMail(mailOptions);
      }
      res.json({ 
        message: 'Estado de la reserva actualizado con éxito', 
        reservation
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  getReservationMetrics: async (req, res) => {
    const adminBusinessId = req.user.BusinessId;
    if (!adminBusinessId) {
      return res.status(400).json({ message: 'Información de empresa no disponible.' });
    }
    if (!validate.id(adminBusinessId)) {
      return res.status(400).json({ message: 'Información de empresa inválida.' });
    }
    try {
      const branches = await Branch.findAll({
        where: { businessId: adminBusinessId },
        attributes: ['id', 'name']
      });
      const branchIds = branches.map(branch => branch.id);
      const metrics = {
        peakTimes: await dashboard.getPeakTimes(branchIds),
        averageCancellations: await dashboard.getAverageCancellations(branchIds, branches.length),
        mostVisitedBranches: await dashboard.getMostVisitedBranches(branchIds),
        operatorCount: await dashboard.getOperatorCount(branchIds)
      };
      res.json({ metrics });
    } catch (error) {
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
        attributes: ['id', 'date', 'time', 'state', 'clientName', 'clientPhone', 'clientEmail']
      });
      const formattedReservations = formatData.formatReservationData(allReservations);
      res.status(200).json(formattedReservations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  getReservationById: async (req, res) => {
    const reservationId = req.params.id;   
    try {      
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
        attributes: ['id', 'date', 'time', 'state', 'clientName', 'clientPhone', 'clientEmail']
      });
      if (!reservation) {
        return res.status(404).json({ error: "Reserva no encontrada." });
      }
      const formattedReservation = formatData.formatSingleReservation(reservation);
      res.json(formattedReservation);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  modifyReservation: async (req, res) => {
    const reservationId = req.params.id;
    const { userId, branchId, date, time, state, clientName, clientPhone, clientEmail } = req.body;
    if (!validate.id(reservationId)) {
      return res.status(400).json({ message: "Número de reserva inválido." });
    }    
    if (!userId) {
      return res.status(400).json({ message: "Usuario no proporcionado." });
    }
    if (!validate.id(userId)) {
      return res.status(400).json({ message: "Usuario inválido." });
    }
    if (!branchId) {
      return res.status(400).json({ message: "Sucursal no proporcionada." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Sucursal inválida." });
    }
    if (!date) {
      return res.status(400).json({ message: "Tenés que ingresar una fecha." });
    }         
    if (!validate.date(date)) {
      return res.status(400).json({ message: "Fecha inválida." });
    }
    if (!time) {
      return res.status(400).json({ message: "Tenés que ingresar una hora." });
    }
    if (!validate.time(time)) {
      return res.status(400).json({ message: "Hora inválida." });
    }
    if (!state) {
      return res.status(400).json({ message: "La reserva tiene que tener un estado." });
    }
    if (!validate.state(state)) {
      return res.status(400).json({ message: "Estado inválido." });
    }
    if (!clientName) {
      return res.status(400).json({ message: "Nombre del cliente no proporcionado." });
    }
    if (!validate.name(clientName)) {
      return res.status(400).json({ message: "Nombre del cliente inválido." });
    }
    if (!clientPhone) {
      return res.status(400).json({ message: "Teléfono del cliente no proporcionado." });
    }
    if (!validate.phone(clientPhone)) {
      return res.status(400).json({ message: "Teléfono del cliente inválido." });
    }
    if (!clientEmail) {
      return res.status(400).json({ message: "Correo electrónico del cliente no proporcionado." });
    }
    if (!validate.email(clientEmail)) {
      return res.status(400).json({ message: "Correo electrónico del cliente inválido." });
    } 
    try {
      const reservation = await Reservation.findByPk(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada.' });
      }
      const formattedTime = formatData.formatTime(time);
      await reservation.update({
        userId: userId || reservation.userId,
        branchId: branchId || reservation.branchId,
        date: date || reservation.date,
        time: formattedTime || reservation.time,
        state: state || reservation.state,
        clientName: clientName || reservation.clientName,
        clientPhone: clientPhone || reservation.clientPhone,
        clientEmail: clientEmail || reservation.clientEmail
      });
      const updatedReservation = formatData.formatSingleReservation(reservation);
      res.json({ message: 'Reserva modificada con éxito.', updatedReservation });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al modificar la reserva.' });
    }
  },  
  deleteReservation: async (req, res) => {
    const reservationId = req.params.id;    
    if (!validate.id(reservationId)) {
      return res.status(400).json({ message: "Número de reserva inválido." });
    }  
    try {
      const reservation = await Reservation.findByPk(reservationId, {
        include: {
          model: User,
          attributes: ['email', 'fullName']
        }
      });
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada.' });
      }
      const userEmail = reservation.User.email;
      const userName = reservation.User.fullName;
      if (userEmail) {
        const mailOptions = emailTemplates.cancellationNotification({ 
          email: userEmail, 
          fullName: userName, 
          reservationId 
        });
        await transporter.sendMail(mailOptions);
      }
      await reservation.destroy();
      res.json({ message: 'Reserva eliminada con éxito.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar la reserva.' });
    }
  }
};

export default reservationController;