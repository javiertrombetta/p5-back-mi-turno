import express from "express";
import User from "../models/User.js";
import { postLogin, postLogout , postCompletePasswordReset, postPasswordReset} from "../controllers/users.js";
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

router.put("/changePassword/:dni", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.dni);
    if (user) {

     user.update(req.body.password)
      await user.save();
      res.send("Contraseña cambiada correctamente");
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    res.status(500).send("Error al cambiar la contraseña del usuario");
  }
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    const { firstAndLastName, dni, email, password } = req.body;
    const userExist = await User.findOne({ where: { dni } });
    if (userExist) throw new Error("DNI existente");
    const newUser = await User.create({
      firstAndLastName,
      dni,
      email,
      password,
    });
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send(`Error al registrarse: ${error.message}`);
  }
});

router.post("/login", postLogin);
router.post("/logout", postLogout);
router.post("/password-reset", postPasswordReset);
router.post("/complete-password-reset", postCompletePasswordReset);

export default router;
