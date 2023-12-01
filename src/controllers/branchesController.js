import Sequelize from 'sequelize';
import models from "../models/index.js";
import validate from '../utils/validations.js';
import reservationStepper from '../utils/reservationStepper.js';

const Op = Sequelize.Op;
const { Branch, Business, User, Reservation } = models;

const branchesController = {
  createBranch: async (req, res) => {
    const { name, email, phoneNumber, address, capacity, openingTime, closingTime, turnDuration } = req.body;    
    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio." });
    }
    if (!validate.name(name)) {
      return res.status(400).json({ message: "Nombre inválido." });
    }
    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio." });
    }
    if (!validate.email(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }
    if (!phoneNumber) {
      return res.status(400).json({ message: "El teléfono es obligatorio." });
    }
    if (!validate.phone(phoneNumber)) {
      return res.status(400).json({ message: "Formato de número de teléfono inválido." });
    }
    if (!address) {
      return res.status(400).json({ message: "La dirección postal es obligatoria." });
    }
    if (!validate.address(address)) {
      return res.status(400).json({ message: "Dirección postal inválida." });
    }
    if (!capacity) {
      return res.status(400).json({ message: "La capacidad de la sucursal es obligatoria." });
    }
    if (!validate.capacity(capacity)) {
      return res.status(400).json({ message: "Capacidad inválida." });
    }
    if (!openingTime) {
      return res.status(400).json({ message: "La hora de apertura es obligatoria." });
    }
    if (!validate.time(openingTime)) {
      return res.status(400).json({ message: "Horario de apertura inválido." });
    }
    if (!closingTime) {
      return res.status(400).json({ message: "La hora de cierre es obligatoria." });
    } 
    if (!validate.time(closingTime)) {
      return res.status(400).json({ message: "Horario de cierre inválido." });
    }
    if (turnDuration && !validate.turnDuration(turnDuration)) {
      return res.status(400).json({ message: "Duración de turno inválida." });
    }
    try {
      const newBranch = await Branch.create({
        name,
        email,
        phoneNumber,
        address,
        capacity,
        openingTime,
        closingTime,
        turnDuration: turnDuration ?? 30
      });
      res.status(201).json(newBranch);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear la sucursal." });
    }
  },
  updateBranch: async (req, res) => {
    const branchId = req.params.id;
    const { name, email, phoneNumber, address, capacity, openingTime, closingTime, turnDuration } = req.body; 
    if (name && !validate.name(name)) {
      return res.status(400).json({ message: "Nombre inválido." });
    }
    if (email && !validate.email(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }
    if (phoneNumber && !validate.phone(phoneNumber)) {
      return res.status(400).json({ message: "Formato de número de teléfono inválido." });
    }
    if (address && !validate.address(address)) {
      return res.status(400).json({ message: "Dirección inválida." });
    }
    if (capacity && !validate.capacity(capacity)) {
      return res.status(400).json({ message: "Capacidad inválida." });
    }
    if (openingTime && !validate.time(openingTime)) {
      return res.status(400).json({ message: "Horario de apertura inválido." });
    }
    if (closingTime && !validate.time(closingTime)) {
      return res.status(400).json({ message: "Horario de cierre inválido." });
    }
    if (turnDuration && !validate.turnDuration(turnDuration)) {
      return res.status(400).json({ message: "Duración de turno inválida." });
    }
    try {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ message: "Sucursal no encontrada." });
      }
      const updatedData = {
        name: name ?? branch.name,
        email: email ?? branch.email,
        phoneNumber: phoneNumber ?? branch.phoneNumber,
        address: address ?? branch.address,
        capacity: capacity ?? branch.capacity,
        openingTime: openingTime ?? branch.openingTime,
        closingTime: closingTime ?? branch.closingTime,
        turnDuration: turnDuration ?? branch.turnDuration
      };
      await branch.update(updatedData);
      res.json({ message: 'Sucursal actualizada con éxito.', branch: updatedData });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar la sucursal." });
    }
  },
  deleteBranch: async (req, res) => {
    const branchId = req.params.id;
    try {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ message: "Sucursal no encontrada." });
      }
      await branch.destroy();
      res.json({ message: 'Sucursal eliminada con éxito.' });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar la sucursal." });
    }
  },
  getBranchesByBusiness: async (req, res) => {
    const businessId = req.params.businessId;
    try {
      if (req.user.role !== 'admin' || req.user.businessId !== parseInt(businessId)) {
        return res.status(403).json({ message: "No autorizado para acceder a esta información." });
      }
      const branches = await Branch.findAll({
        where: { businessId: businessId },
        attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime', 'turnDuration']
        });
      if (branches.length === 0) {
        return res.status(404).json({ message: "No se encontraron sucursales para la empresa indicada." });
      }
      res.json(branches);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener las sucursales." });
    }
  },
  getAssignedBranches: async (req, res) => {
    try {
      if (req.user.role !== 'oper') {
        return res.status(403).json({ message: "No autorizado. Acceso restringido a operadores." });
      }
      const assignedBranches = await Branch.findAll({
        include: [{
          model: User,
          as: 'operators',
          where: { dni: req.user.dni },
          attributes: []
        }],
        attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime', 'turnDuration']
      });
      if (assignedBranches.length === 0) {
        return res.status(404).json({ message: "No se encontraron sucursales asignadas al operador." });
       }
      res.json(assignedBranches);
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener las sucursales asignadas." });
    }
  },
  getAllBranches: async (req, res) => {
    try {      
      const branches = await Branch.findAll({
        attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime', 'turnDuration'],
        include: {
          model: Business,      
          attributes: ['name']
        }
      });  
      if (!branches || branches.length === 0) {
        return res.status(404).json({ message: "No se encontraron sucursales." });
      }
      res.json(branches);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener las sucursales." });
    }
  },
  getBranchById: async (req, res) => {
    const branchId = req.params.id;
    try {
      const branch = await Branch.findByPk(branchId, {
        attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime', 'turnDuration'],
        include: {
          model: Business,
          attributes: ['name']
        }
      });
      if (!branch) {
        return res.status(404).json({ message: "Sucursal no encontrada." });
      }
      res.json(branch);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener la información de la sucursal." });
    }
  },
  getBranchSchedules: async (req, res) => {
    const branchId = req.params.id;
    const queryDate = req.query.date;
    try {
      const branch = await Branch.findByPk(branchId, {
        attributes: ['openingTime', 'closingTime', 'turnDuration']
      });
      if (!branch) {
        return res.status(404).json({ message: 'Sucursal no encontrada.' });
      }
      const allSchedules = reservationStepper.generateSchedules(branch.openingTime, branch.closingTime, branch.turnDuration);
      const reservations = await Reservation.findAll({ 
        where: { 
          branchId,
          date: queryDate
        } 
      });
      const availableSchedules = reservationStepper.filterAvailableSchedules(allSchedules, reservations, queryDate);
      res.json({ availableSchedules });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  getAvailableBranchSchedules: async (req, res) => {
    const branchId = req.params.id;
    const queryDate = req.query.date;

    try {
      const branch = await Branch.findByPk(branchId, {
        attributes: ['openingTime', 'closingTime', 'turnDuration']
      });

      if (!branch) {
        return res.status(404).json({ message: 'Sucursal no encontrada.' });
      }

      const queryStartDate = new Date(queryDate);
      queryStartDate.setHours(0, 0, 0, 0);
      const queryEndDate = new Date(queryDate);
      queryEndDate.setHours(23, 59, 59, 999);

      const reservations = await Reservation.findAll({
        where: {
          branchId,
          date: {
            [Op.between]: [queryStartDate, queryEndDate]
          }
        }
      });

      const allSchedules = reservationStepper.generateSchedules(branch.openingTime, branch.closingTime, branch.turnDuration);
      const availableSchedules = reservationStepper.filterAvailableSchedules(allSchedules, reservations, queryDate);

      res.json({ availableSchedules });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  getCriticalBranchSchedules: async (req, res) => {
    const branchId = req.params.id;
    const queryDate = req.query.date;
    try {
      const branch = await Branch.findByPk(branchId, {
        attributes: ['openingTime', 'closingTime', 'turnDuration']
      });
      if (!branch) {
        return res.status(404).json({ message: 'Sucursal no encontrada' });
      }
      const allSchedules = reservationStepper.generateSchedules(branch.openingTime, branch.closingTime, branch.turnDuration);
      const reservations = await Reservation.findAll({ 
        where: { 
          branchId,
          date: queryDate
        } 
      });
      const criticalSchedules = reservationStepper.identifyCriticalSchedules(allSchedules, reservations, queryDate);
      res.json({ criticalSchedules });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default branchesController;
