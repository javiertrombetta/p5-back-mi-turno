import Sequelize from 'sequelize';
import models from "../models/index.js";
import validate from '../utils/validations.js';
import reservationStepper from '../utils/reservationStepper.js';

const Op = Sequelize.Op;
const { Branch, Business, User, Reservation } = models;

const branchesController = {
  createBranch: async (req, res) => {
    const { name, email, phoneNumber, address, capacity, openingTime, closingTime, turnDuration, isEnable, schedule, specificDates } = req.body;    
    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio." });
    }
    if (!validate.fantasyName(name)) {
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
    if (!turnDuration) {
      return res.status(400).json({ message: "Se requiere completar la duración de turno." });
    }
    if (!validate.turnDuration(turnDuration)) {
      return res.status(400).json({ message: "Duración de turno inválida. Tiene que ser mayor a 5 minutos y menor a ." });
    }
    if (isEnable == undefined) {
      return res.status(400).json({ message: "Debe haber un valor (Si o No) en ¿Sucursal habilitada?." });
    }
    if (!validate.isEnable(isEnable)) {
      return res.status(400).json({ message: "El valor de en ¿Sucursal habilitada? es inválido. Debe ser booleano." });
    }
    if (schedule && !validate.schedule(schedule)) {
      return res.status(400).json({ message: "Formato de horario inválido. Verifique el formato de los días y horas deshabilitadas." });
    }
    if (specificDates && !validate.specificDates(specificDates)) {
      return res.status(400).json({ message: "Formato de fechas específicas inválido. Asegúrese de que las fechas y los estados sean válidos." });
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
        turnDuration: turnDuration ?? 30,
        isEnable: isEnable ?? true,
        schedule: schedule ?? [],
        specificDates: specificDates ?? []
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
    const { name, email, phoneNumber, address, capacity, openingTime, closingTime, turnDuration, isEnable, schedule, specificDates } = req.body;
    if (!branchId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    }
    if (!validate.fantasyName(name)) {
      return res.status(400).json({ message: "Nombre inválido." });
    }
    if (!validate.email(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }
    if (!validate.phone(phoneNumber)) {
      return res.status(400).json({ message: "Formato de número de teléfono inválido." });
    }
    if (!validate.address(address)) {
      return res.status(400).json({ message: "Dirección inválida." });
    }
    if (!validate.capacity(capacity)) {
      return res.status(400).json({ message: "Capacidad inválida." });
    }
    if (!validate.time(openingTime)) {
      return res.status(400).json({ message: "Horario de apertura inválido." });
    }
    if (!validate.time(closingTime)) {
      return res.status(400).json({ message: "Horario de cierre inválido." });
    }
    if (!validate.turnDuration(turnDuration)) {
      return res.status(400).json({ message: "Duración de turno inválida." });
    }
    if (isEnable !== undefined && !validate.isEnable(isEnable)) {
      return res.status(400).json({ message: "Valor de isEnable inválido. Debe ser booleano." });
    }
    if (schedule && !validate.schedule(schedule)) {
      return res.status(400).json({ message: "Formato de horario inválido. Verifique el formato de los días y horas deshabilitadas." });
    }
    if (specificDates && !validate.specificDates(specificDates)) {
      return res.status(400).json({ message: "Formato de fechas específicas inválido. Asegúrese de que las fechas y los estados sean válidos." });
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
        turnDuration: turnDuration ?? branch.turnDuration,
        isEnable: isEnable ?? branch.isEnable,
        schedule: schedule ?? branch.schedule,
        specificDates: specificDates ?? branch.specificDates
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
    if (!branchId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    }
    try {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ message: "Sucursal no encontrada." });
      } 
      const users = await User.findAll({ where: { branchId } });
      if (users.length > 0) {
        return res.status(400).json({ message: "No se puede eliminar la sucursal porque hay usuarios que la referencian." });
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
    if (!businessId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(businessId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    }
    try {
      if (req.user.role !== 'super') {
        return res.status(403).json({ message: "No autorizado para acceder a esta información." });
      }
      const branches = await Branch.findAll({
        where: { businessId: businessId },
        attributes: [
          'id', 'name', 'email', 'phoneNumber', 'address', 
          'capacity', 'openingTime', 'closingTime', 'turnDuration', 
          'isEnable', 'schedule', 'specificDates'
        ]
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
    if (!req.user.role) {
      return res.status(400).json({ message: "Rol no proporcionado." });
    }
    if (!validate.role(req.user.role)) {
      return res.status(400).json({ message: "El rol es inválido." });
    }
    try {
      if (req.user.role !== 'oper') {
        return res.status(403).json({ message: "No autorizado. Acceso restringido a operadores." });
      }
      const assignedBranches = await Branch.findAll({
        include: [{
          model: User,  
          where: { dni: req.user.dni },
          attributes: []
        }],
        attributes: [
          'id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 
          'openingTime', 'closingTime', 'turnDuration', 
          'isEnable', 'schedule', 'specificDates'
        ]
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
        attributes: [
          'id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 
          'openingTime', 'closingTime', 'turnDuration', 
          'isEnable', 'schedule', 'specificDates' 
        ],
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
    if (!branchId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    }
    try {
      const branch = await Branch.findByPk(branchId, {
        attributes: [
          'id', 'name', 'email', 'phoneNumber', 'address', 'capacity', 
          'openingTime', 'closingTime', 'turnDuration', 
          'isEnable', 'schedule', 'specificDates'
        ],
        include: {
          model: Business,
          attributes: ['name', 'email', 'phoneNumber', 'address']
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
    if (!branchId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    }
    if (!queryDate) {
      return res.status(400).json({ message: "No hay una fecha válida pasada como params." });
    }
    if (!validate.isValidDate(queryDate)) {
      return res.status(400).json({ message: "No pasaste una fecha válida en params." });
    }
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

    if (!branchId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    }
    if (!queryDate) {
      return res.status(400).json({ message: "Fecha de consulta no proporcionada." });
    }
    if (!validate.isValidDate(queryDate)) {
      return res.status(400).json({ message: "Fecha de consulta inválida." });
    }
    try {
      const branch = await Branch.findByPk(branchId, {
        attributes: ['openingTime', 'closingTime', 'turnDuration', 'capacity', 'isEnable', 'schedule', 'specificDates']
      });

      if (!branch) {
        return res.status(404).json({ message: 'Sucursal no encontrada.' });
      }

      if (!branch.isEnable) {
        return res.status(403).json({ message: 'La sucursal no está habilitada.' });
      }     
      const allSchedules = reservationStepper.generateSchedules(branch.openingTime, branch.closingTime, branch.turnDuration);
      let availableSchedules = reservationStepper.filterSchedulesByDate(allSchedules, branch.schedule, branch.specificDates, queryDate);
      const reservations = await Reservation.findAll({
        where: {
          branchId,
          date: queryDate
        }
      });
      availableSchedules = reservationStepper.filterAvailableSchedules(availableSchedules, reservations, branch.capacity, queryDate);

      res.json({ availableSchedules });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  getCriticalBranchSchedules: async (req, res) => {
    const branchId = req.params.id;
    const queryDate = req.query.date;
    if (!branchId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    }
    if (!queryDate) {
      return res.status(400).json({ message: "No hay una fecha válida pasada como params." });
    }
    if (!validate.isValidDate(queryDate)) {
      return res.status(400).json({ message: "No pasaste una fecha válida en params." });
    }
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
  updateSchedule: async (req, res) => {
    const branchId = req.params.id;
    const { schedule, specificDates } = req.body;
    if (!branchId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    } 
    try {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ message: "Sucursal no encontrada." });
      }
      if (schedule && !validate.schedule(schedule)) {
        return res.status(400).json({ message: "Formato de horario inválido. Verifique el formato de los días y horas deshabilitadas." });
      }
      if (specificDates && !validate.specificDates(specificDates)) {
        return res.status(400).json({ message: "Formato de fechas específicas inválido. Asegúrese de que las fechas y los estados sean válidos." });
      }
      await branch.update({ schedule, specificDates });
      res.json({ message: 'Horario de sucursal actualizado con éxito.', branch });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar el horario de la sucursal." });
    }
  },
  updateBranchEnableStatus: async (req, res) => {
    const branchId = req.params.id;
    const { isEnable } = req.body;
    if (!branchId) {
      return res.status(400).json({ message: "Id de sucursal no proporcionado." });
    }
    if (!validate.id(branchId)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    }    
    if (!validate.isEnable(isEnable)) {
      return res.status(400).json({ message: "Id de sucursal inválido." });
    } 
    try {
        const branch = await Branch.findByPk(branchId);
        if (!branch) {
            return res.status(404).json({ message: "Sucursal no encontrada." });
        }

        await branch.update({ isEnable });

        res.status(200).json({ message: "Estado de habilitación actualizado con éxito.", branch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el estado de habilitación de la sucursal." });
    }
  }
};

export default branchesController;
