import Sequelize from "sequelize";
import models from "../models/index.js";
import { transporter } from "../config/mailTransporter.js";
import validate from '../utils/validations.js';
import formatData from '../utils/formatData.js';
import emailTemplates from "../utils/emailTemplates.js";
import dashboard from '../utils/metrics.js';

const { Branch, Business, User, Reservation }   = models;
const reservationController = {
  createReservation: async (req, res) => {
    const { branchId, date, time, clientName, clientPhone, clientEmail } = req.body;
    const userId = req.user.dni;   
    if (!userId) {
      return res.status(400).json({ message: "Usuario no encontrado." });
    }
    if (!validate.dni(userId)) {
      return res.status(400).json({ message: "El dni del usuario es inválido." });
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
      const userMailOptions = emailTemplates.createReservation(req.user, {
        date: newReservation.date,
        time: newReservation.time,
        branchId: newReservation.branchId
      });
      const clientMailOptions = emailTemplates.createReservationForClient(req.user, {
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
          attributes: ['name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime', 'turnDuration'],
          include: {
            model: Business,
            attributes: ['name', 'email', 'phoneNumber', 'address']
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
      if (req.user.role !== 'oper' || !req.user.BranchId) {
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
    
    if (!id) {
      return res.status(400).json({ message: "Id de reserva no proporcionado." });
    }
    if (!validate.id(id)) {
      return res.status(400).json({ message: "El número de reserva es inválido." });
    }
    if (!state) {
      return res.status(400).json({ message: "Estado de reserva no ingresado." });
    }    
    if (!validate.state(state)) {
      return res.status(400).json({ message: "El estado de la reserva es inválido." });
    } 
    try {
      const reservation = await Reservation.findByPk(id, {
        include: [{
          model: Branch, 
          include: [{
            model: User,           
            attributes: ['email', 'fullName']
          }]
        }]
      });
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada.' });
      } 
      if (req.user.role === 'user') {
        return res.status(403).json({ message: 'Acceso denegado.' });
      }
      if (req.user.role === 'oper' && reservation.branchId !== req.user.BranchId) {
        return res.status(403).json({ message: 'Acceso denegado.' });
      }
      if (req.user.role === 'admin') {
        const isAdminBranch = req.user.Business.Branches.some(branch => branch.id === reservation.BranchId);
        if (!isAdminBranch) {
          return res.status(403).json({ message: 'Acceso denegado.' });
        }
      }
      reservation.state = state;
      await reservation.save();      
      if (reservation && reservation.branch && reservation.branch.users && reservation.branch.users.length > 0) {
        const user = reservation.branch.users[0];
        const userEmailOptions = emailTemplates.statusUpdateNotification({
          email: user.email,
          fullName: user.fullName,
          reservationId: reservation.id
        });
        await transporter.sendMail(userEmailOptions);
      }  

      if (reservation.clientEmail && reservation.clientEmail !== User.email) {
        const clientEmailOptions = emailTemplates.statusUpdateNotification({
          email: reservation.clientEmail,
          fullName: reservation.clientName,
          reservationId: reservation.id
        });
        await transporter.sendMail(clientEmailOptions);
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
    const userRole = req.user.role;
    let branchIds;
    try {
      if (userRole === 'super') {
        const allBranches = await Branch.findAll({ attributes: ['id'] });
        branchIds = allBranches.map(branch => branch.id);
      } else {
        const adminBusinessId = req.user.businessId;
        if (!adminBusinessId || !validate.id(adminBusinessId)) {
          return res.status(400).json({ message: 'Información de empresa inválida.' });
        }
        const branches = await Branch.findAll({
          where: { businessId: adminBusinessId },
          attributes: ['id']
        });
        branchIds = branches.map(branch => branch.id);
      }
      const metrics = {
        peakTimes: await dashboard.getPeakTimes(branchIds),
        averageCancellations: await dashboard.getAverageCancellations(branchIds),
        mostVisitedBranches: await dashboard.getMostVisitedBranches(branchIds),
        operatorCount: await dashboard.getOperatorCount(branchIds),
        totalReservations: await dashboard.getTotalReservationsByBranch(branchIds),
        totalCancellations: await dashboard.getTotalCancellationsByBranch(branchIds),
        totalAttendances: await dashboard.getTotalAttendancesByBranch(branchIds)
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
              attributes: ['name', 'email', 'phoneNumber', 'address']
            },
            attributes: ['name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime', 'turnDuration'],
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
    const userId = req.user.dni;
    const userRole = req.user.role;
    if (!reservationId) {
      return res.status(400).json({ message: "Número de reserva no proporcionado." });
    }
    if (!validate.id(reservationId)) {
      return res.status(400).json({ message: "El número de reserva es inválido." });
    }    
    if (!userId) {
      return res.status(400).json({ message: "Usuario no encontrado." });
    }
    if (!validate.dni(userId)) {
      return res.status(400).json({ message: "DNI inválido." });
    }
    if (!userRole) {
      return res.status(400).json({ message: "El usuario tiene un rol inválido." });
    }
    if (!validate.role(userRole)) {
      return res.status(400).json({ message: "El rol del usuario es inválido." });
    }
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
                        attributes: ['name', 'email', 'phoneNumber', 'address']
                    },
                    attributes: ['name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime', 'turnDuration'],
                }
            ],
            attributes: ['id', 'date', 'time', 'state', 'clientName', 'clientPhone', 'clientEmail', 'userId']
        });

        if (!reservation) {
            return res.status(404).json({ error: "Reserva no encontrada." });
        }
        if (userRole !== 'super' && reservation.userId !== userId) {
            return res.status(403).json({ error: "Acceso denegado." });
        }

        const formattedReservation = formatData.formatSingleReservation(reservation);
        res.json(formattedReservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
  },
  cancelReservationById: async (req, res) => {
    const reservationId = req.params.id;
    if (!reservationId) {
      return res.status(400).json({ message: "Número de reserva no proporcionado." });
    }
    if (!validate.id(reservationId)) {
      return res.status(400).json({ message: "El número de reserva es inválido." });
    }   
    try {
      const reservation = await Reservation.findByPk(reservationId, {
        include: [{ model: User, attributes: ['dni', 'fullName', 'email'] }]
      });  
      if (!reservation) {
        return res.status(404).json({ message: 'Reserva no encontrada.' });
      }  
      reservation.state = 'cancelado';
      await reservation.save();  

      const userEmailOptions = emailTemplates.cancellationNotification({
        email: reservation.user.email,
        fullName: reservation.user.fullName,
        reservationId: reservation.id
      });
      await transporter.sendMail(userEmailOptions);  

      if (reservation.clientEmail && reservation.clientEmail !== reservation.user.email) {
        const clientEmailOptions = emailTemplates.cancellationNotification({
          email: reservation.clientEmail,
          fullName: reservation.clientName,
          reservationId: reservation.id
        });
        await transporter.sendMail(clientEmailOptions);
      }  
      res.status(200).json({ message: 'Reserva cancelada con éxito.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al cancelar la reserva.' });
    }
  },
  modifyReservation: async (req, res) => {
    const reservationId = req.params.id;
    const { userId, branchId, date, time, state, clientName, clientPhone, clientEmail } = req.body;
    if (!reservationId) {
      return res.status(400).json({ message: "Número de reserva no proporcionado." });
    }
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
    if (!reservationId) {
      return res.status(400).json({ message: "Número de reserva no proporcionado." });
    }    
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
      const userEmail = reservation.user.email;
      const userName = reservation.user.fullName;
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