import express from "express";
import Branch from "../models/Branch.js";
const router = express.Router();

router.post("/create", async (req, res) => {
  const { name, email, address, contact, capacity, openingtime, closingtime } =
    req.body;
  try {
    const newBranch = await Branch.create({
      name,
      email,
      contact,
      address,
      capacity,
      openingtime,
      closingtime,
    });
    res.status(201).send(newBranch);
  } catch (error) {
    res.status(500).send("Error al crear una nueva sucursal");
  }
});

router.get("/allBranches", async (req, res) => {
  try {
    const allBranches = await Branch.findAll();
    res.send(allBranches);
  } catch (error) {
    res.status(500).send("Error al obtener sucursales");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (branch) {
      res.send(branch);
    } else {
      res.status(404).send("Sucursal no encontrada");
    }
  } catch (error) {
    res.status(500).send("Error al obtener sucursal");
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (branch) {
      await branch.update(req.body);
      res.send(branch);
    } else {
      res.status(404).send("Sucursal no encontrada");
    }
  } catch (error) {
    res.status(500).send("Error al actualizar sucursal");
  }
});

export default router;
