import Branch from "../models/Branch.js";

const branchesController = {
  createBranch: async (req, res) => {
    const { name, email, phoneNumber, address, capacity, openingTime, closingTime } = req.body;
    try {
      const newBranch = await Branch.create({
        name,
        email,
        phoneNumber,
        address,
        capacity,
        openingTime,
        closingTime,
      });
      res.status(201).json(newBranch);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAllBranches: async (req, res) => {
    try {
      const allBranches = await Branch.findAll();
      res.status(200).json(allBranches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getBranchById: async (req, res) => {
    try {
      const branch = await Branch.findByPk(req.params.id);
      if (branch) {
        res.json(branch);
      } else {
        res.status(404).json({ error: "Sucursal no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateBranch: async (req, res) => {
    try {
      const branch = await Branch.findByPk(req.params.id);
      if (branch) {
        await branch.update(req.body);
        res.json(branch);
      } else {
        res.status(404).json({ error: "Sucursal no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default branchesController;
