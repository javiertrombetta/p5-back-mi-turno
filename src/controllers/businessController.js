import models from "../models/index.js";
import validate from '../utils/validations.js';

const { Branch, Business }  = models;
const businessController = {  
  createBusiness: async (req, res) => {
    const { name, email, phoneNumber, address } = req.body;  
    if (!name) {
      return res.status(400).json({ message: "El nombre es un campo obligatorio." });
    }   
    if (!validate.name(name)) {
      return res.status(400).json({ message: "El nombre contiene caracteres inválidos." });
    }
    if (!email) {
      return res.status(400).json({ message: "El campo email es obligatorio." });
    }
    if (!validate.email(email)) {
      return res.status(400).json({ message: "El email tiene un formato incorrecto." });
    }
    if (!phoneNumber) {
      return res.status(400).json({ message: "El número de teléfono es obligatorio." });
    }
    if (!validate.phone(phoneNumber)) {
      return res.status(400).json({ message: "El número de teléfono tiene que contener solo números." });
    }
    if (!address) {
      return res.status(400).json({ message: "El campo dirección es un campo obligatiorio." });
    }
    if (!validate.address(address)) {
      return res.status(400).json({ message: "La dirección postal contiene caracteres especiales inválidos." });
    }
    try {
      const newBusiness = await Business.create({
        name,
        email,
        phoneNumber,
        address
      });
      res.status(201).json(newBusiness);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear la empresa." });
    }
  },
  updateBusiness: async (req, res) => {
    const { id } = req.params;
    const { name, email, phoneNumber, address } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Id de empresa no proporcionado." });
    }
    if (!validate.id(id)) {
      return res.status(400).json({ message: "Id de empresa inválido." });
    }
    if (name && !validate.name(name)) {
      return res.status(400).json({ message: "El nombre contiene caracteres inválidos." });
    }
    if (email && !validate.email(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }
    if (phoneNumber && !validate.phone(phoneNumber)) {
      return res.status(400).json({ message: "Formato de número de teléfono inválido." });
    }
    if (address && !validate.address(address)) {
      return res.status(400).json({ message: "Formato de dirección postal inválida" });
    }
    try {
      const business = await Business.findByPk(id);
      if (!business) {
        return res.status(404).json({ message: "Empresa no encontrada." });
      }
      const updatedBusiness = await business.update({
        name: name || business.name,
        email: email || business.email,
        phoneNumber: phoneNumber || business.phoneNumber,
        address: address || business.address
      });
      res.json(updatedBusiness);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar la empresa." });
    }
  },
  deleteBusiness: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Id de empresa no proporcionado." });
    }
    if (!validate.id(id)) {
      return res.status(400).json({ message: "Id de empresa inválido." });
    }  
    try {
      const business = await Business.findByPk(id);
      if (!business) {
        return res.status(404).json({ message: "Empresa no encontrada." });
      }
      await business.destroy();
      res.json({ message: "Empresa eliminada con éxito." });
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar la empresa." });
    }
  },
  getAllBusinesses: async (req, res) => {
    try {
      if (req.user.rol === 'super') {
        const allBusinesses = await Business.findAll();
        return res.json(allBusinesses);
      } else if (req.user.rol === 'admin') {
        const userBusinessId = req.user.businessId;
        if (!userBusinessId) {
          return res.status(404).json({ message: "Información de empresa no disponible para el usuario." });
        }
        const business = await Business.findByPk(userBusinessId);
        return res.json(business ? [business] : []);
      }
      return res.status(403).json({ message: "Usuario no autorizado." });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener las empresas." });
    }
  },
  getBusinessById: async (req, res) => {
    const businessId = req.params.id;
    if (!businessId) {
      return res.status(400).json({ message: "Id de empresa no proporcionado." });
    }
    if (!validate.id(businessId)) {
      return res.status(400).json({ message: "Id de empresa inválido." });
    }
    try {
      if (req.user.rol === 'super') {
        const business = await Business.findByPk(businessId);
        if (!business) {
          return res.status(404).json({ message: "Empresa no encontrada." });
        }
        return res.json(business);
      } else if (req.user.rol === 'admin') {
        const userBranches = await Branch.findAll({
          where: { adminId: req.user.dni }
        });
        const businessesIds = userBranches.map(branch => branch.businessId);
        if (!businessesIds.includes(parseInt(businessId))) {
          return res.status(404).json({ message: "Empresa no encontrada o no tenés acceso." });
        }
        const business = await Business.findByPk(businessId);
        return res.json(business);
      }
      return res.status(403).json({ message: "Usuario no autorizado." });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener la empresa." });
    }
  }
}; 

export default businessController;