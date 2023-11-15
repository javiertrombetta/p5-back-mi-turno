import express from "express";
import Business from "../models/Business.js";
const router = express.Router();

router.get("/allBusiness", async (req, res) => {
  try {
    const allBusinesses = await Business.findAll();
    res.send(allBusinesses);
  } catch (error) {
    res.status(500).send("Error al obtener empresas");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (business) {
      res.send(business);
    } else {
      res.status(404).json("Empresa no encontrada");
    }
  } catch (error) {
    res.status(500).json("Error al obtener empresa");
  }
});

router.post("/create", async (req, res) => {
  const { name, email, contact, address } = req.body;
  try {
    const newBusiness = await Business.create({
      name,
      email,
      contact,
      address,
    });
    res.status(201).send(newBusiness);
  } catch (error) {
    res.status(500).send("Error al crear una nueva empresa");
  }
});

export default router;
