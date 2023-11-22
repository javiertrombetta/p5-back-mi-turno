import Business from "../models/Business.js";

const businessController = {
  getAllBusinesses: async (req, res) => {
    try {
      const allBusinesses = await Business.findAll();
      res.status(200).json(allBusinesses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getBusinessById: async (req, res) => {
    try {
      const business = await Business.findByPk(req.params.id);
      if (business) {
        res.json(business);
      } else {
        res.status(404).json({ error: "Empresa no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createBusiness: async (req, res) => {
    const { name, email, contact, address } = req.body;
    try {
      const newBusiness = await Business.create({
        name,
        email,
        contact,
        address,
      });
      res.status(201).json(newBusiness);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateBusiness: async (req, res) => {
    try {
      const business = await Business.findByPk(req.params.id);
      if (business) {
        await business.update(req.body);
        res.json(business);
      } else {
        res.status(404).json({ error: "Empresa no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default businessController;
