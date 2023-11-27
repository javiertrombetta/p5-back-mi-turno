import Branch from "../models/Branch.js";
import Business from "../models/Business.js";
import User from "../models/User.js";
import Reservation from "../models/Reservation.js";

import { validateName, validateEmail, validatePhone, validateAddress, validateCapacity, validateTime } from '../utils/validations.js';
import * as reservationStepper from '../utils/reservationStepper.js';

const branchesController = {
  createBranch: async (req, res) => {
    const { name, email, phoneNumber, address, capacity, openingTime, closingTime } = req.body;
    if (!name || !email || !phoneNumber || !address || !capacity || !openingTime || !closingTime) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }
    if (!validateName(name)) {
      return res.status(400).json({ message: "Nombre inválido." });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }
    if (!validatePhone(phoneNumber)) {
      return res.status(400).json({ message: "Formato de número de teléfono inválido." });
    }
    if (!validateAddress(address)) {
      return res.status(400).json({ message: "Dirección inválida." });
    }
    if (!validateCapacity(capacity)) {
      return res.status(400).json({ message: "Capacidad inválida." });
    }
    if (!validateTime(openingTime) || !validateTime(closingTime)) {
      return res.status(400).json({ message: "Horarios de apertura y cierre inválidos." });
    }
    try {
      const newBranch = await Branch.create({
        name,
        email,
        phoneNumber,
        address,
        capacity,
        openingTime,
        closingTime
      });
      res.status(201).json(newBranch);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear la sucursal" });
    }
  },
  updateBranch: async (req, res) => {
    const branchId = req.params.id;
    const { name, email, phoneNumber, address, capacity, openingTime, closingTime } = req.body;
    if (!name && !email && !phoneNumber && !address && !capacity && !openingTime && !closingTime) {
      return res.status(400).json({ message: "No hay datos para actualizar." });
    }
    if (name && !validateName(name)) {
      return res.status(400).json({ message: "Nombre inválido." });
    }
    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }
    if (phoneNumber && !validatePhone(phoneNumber)) {
      return res.status(400).json({ message: "Formato de número de teléfono inválido." });
    }
    if (address && !validateAddress(address)) {
      return res.status(400).json({ message: "Dirección inválida." });
    }
    if (capacity && !validateCapacity(capacity)) {
      return res.status(400).json({ message: "Capacidad inválida." });
    }
    if ((openingTime && !validateTime(openingTime)) || (closingTime && !validateTime(closingTime))) {
      return res.status(400).json({ message: "Horarios de apertura y cierre inválidos." });
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
        closingTime: closingTime ?? branch.closingTime
      };
      await branch.update(updatedData);
      res.json({ message: 'Sucursal actualizada con éxito', branch: updatedData });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar la sucursal" });
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
      res.status(500).json({ message: "Error al eliminar la sucursal" });
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
        attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime']
        });
      if (branches.length === 0) {
        return res.status(404).json({ message: "No se encontraron sucursales para la empresa indicada." });
      }
      res.json(branches);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener las sucursales" });
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
        attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime']
      });
      if (assignedBranches.length === 0) {
        return res.status(404).json({ message: "No se encontraron sucursales asignadas al operador." });
       }
      res.json(assignedBranches);
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener las sucursales asignadas" });
    }
  },
  getAllBranches: async (req, res) => {
    try {
      let branches;
      switch (req.user.role) {
        case 'super':
          branches = await Branch.findAll({
            attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime'],
            include: {
              model: Business,
              attributes: ['name']
            }
          });
          break;
        case 'admin':
          branches = await Branch.findAll({
            where: { businessId: req.user.businessId },
            attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime']
          });
          break;
        case 'oper':
          branches = await Branch.findAll({
            include: [{
              model: User,
              as: 'operators',
              where: { dni: req.user.dni },
              attributes: []
            }],
            attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime']
          });
          break;
        default:
          return res.status(403).json({ message: "Acceso no autorizado." });
        }
        if (!branches || branches.length === 0) {
          return res.status(404).json({ message: "No se encontraron sucursales." });
        }
        res.json(branches);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener las sucursales" });
    }
  },
  getBranchById: async (req, res) => {
    const branchId = req.params.id;
    try {
      let branch;
      switch (req.user.role) {
        case 'super':  
          branch = await Branch.findByPk(branchId, {
            attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime'],
            include: {
              model: Business,
              attributes: ['name']
            }
          });
          break;
        case 'admin':
          branch = await Branch.findOne({
            where: { 
              id: branchId,
              businessId: req.user.businessId 
            },
            attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime']
          });
          break;
        case 'oper':
          branch = await Branch.findOne({
            where: { id: branchId },
            include: [{
              model: User,
              as: 'operators',
              where: { dni: req.user.dni },
              attributes: []
            }],
            attributes: ['id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 'openingTime', 'closingTime']
          });
          break;
        default:
          return res.status(403).json({ message: "Acceso no autorizado." });
        }
        if (!branch) {
          return res.status(404).json({ message: "Sucursal no encontrada." });
        }
        res.json(branch);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener la información de la sucursal" });
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
        return res.status(404).json({ message: 'Sucursal no encontrada' });
      }
      if (req.user.role !== 'admin' && (req.user.role !== 'oper' || req.user.branchId !== branch.id)) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
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
        return res.status(404).json({ message: 'Sucursal no encontrada' });
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
