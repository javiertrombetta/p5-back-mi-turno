import Business from "../models/Business.js";
import Branch from "../models/Branch.js";
import { validateName, validateEmail, validatePhone } from '../utils/validations.js';

const businessController = {  
  createBusiness: async (req, res) => {
    const { name, email, phoneNumber, address } = req.body;  
    if (!name || !address) {
      return res.status(400).json({ message: "Nombre y dirección son campos obligatorios." });
    }
    if (!validateName(name)) {
      return res.status(400).json({ message: "El nombre contiene caracteres inválidos." });
    }
    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }
    if (phoneNumber && !validatePhone(phoneNumber)) {
      return res.status(400).json({ message: "Formato de número de teléfono inválido." });
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
    if (name && !validateName(name)) {
        return res.status(400).json({ message: "El nombre contiene caracteres inválidos." });
    }
    if (email && !validateEmail(email)) {
        return res.status(400).json({ message: "Formato de correo electrónico inválido." });
    }
    if (phoneNumber && !validatePhone(phoneNumber)) {
        return res.status(400).json({ message: "Formato de número de teléfono inválido." });
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
      res.status(500).json({ message: "Error al obtener la empresa" });
    }
  }
}; 

export default businessController;