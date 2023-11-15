import express from "express";
import Branch from "../models/Branch.js";
const router = express.Router();

router.post("/create", async (req, res) => {
  const { name, email, contact, capacity, openingtime, closingtime } = req.body;
  try {
    const newBranch = await Branch.create({
      name,
      email,
      contact,
      capacity,
      openingtime,
      closingtime,
    });
    res.status(201).send(newBranch);
  } catch (error) {
    res.status(500).send("Error al crear una nueva sucursal");
  }
});

export default router;
