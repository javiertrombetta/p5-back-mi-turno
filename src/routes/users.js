import express from "express";
import User from "../models/User.js";
const router = express.Router();

router.get("/user/:dni", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.dni);
    if (user) {
      res.send(user);
    } else {
      res.status(404).json("Usuario no encontrado");
    }
  } catch (error) {
    res.status(500).json("Error al buscar usuario");
  }
});

router.get("/allUsers", async (req, res) => {
  try {
    const allUsers = await User.findAll();
    res.send(allUsers);
  } catch (error) {
    res.status(500).send("Error al obtener usuarios");
  }
});

router.put("/update/:dni", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.dni);
    if (user) {
      await user.update(req.body);
      res.send(user);
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    res.status(500).send("Error al actualizar usuario");
  }
});

export default router;
