import Sequelize from "sequelize";
import User from "../models/User.js";
import Branch from "../models/Branch.js";
import Business from "../models/Business.js";

import bcrypt from "bcrypt";
import { generateToken } from "../config/tokens.js";
import { transporter } from "../config/mailTransporter.js";
import validate from "../utils/validations.js";
import * as emailService from "../utils/emailTemplates.js";

const userController = {
  register: async (req, res) => {
    const { fullName, dni, email, password } = req.body;

    if (!fullName || !validate.name(fullName)) {
      return res
        .status(400)
        .json({ message: "Nombre completo inválido o no proporcionado." });
    }
    if (!dni || !validate.dni(dni)) {
      return res
        .status(400)
        .json({ message: "DNI inválido o no proporcionado." });
    }
    if (!email || !validate.email(email)) {
      return res
        .status(400)
        .json({ message: "Email inválido o no proporcionado." });
    }
    if (!password || !validate.password(password)) {
      return res
        .status(400)
        .json({ message: "Contraseña inválida o no proporcionada." });
    }

    try {
      const userExist = await User.findOne({ where: { dni } });
      if (userExist) {
        return res
          .status(400)
          .json({ message: "El usuario ya está registrado" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        fullName,
        dni,
        email,
        password: hashedPassword,
      });
      const mailOptions = emailService.welcomeEmailOptions(newUser);
      await transporter.sendMail(mailOptions);
      const userResponse = { ...newUser.toJSON(), password: undefined };
      res.status(201).json(userResponse);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al registrar el usuario" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !validate.email(email)) {
      return res
        .status(400)
        .json({ message: "Email inválido o no proporcionado." });
    }
    if (!password) {
      return res.status(400).json({ message: "Contraseña no proporcionada." });
    }

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Credenciales inválidas" });
      }
      await user.update({ lastLogin: new Date() });
      const payload = {
        dni: user.dni,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        photo: user.photo,
        lastLogin: user.lastLogin,
      };
      const token = generateToken(payload);
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({ payload, message: "Usuario logeado con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error de servidor" });
    }
  },
  logout: (req, res) => {
    if (!req.cookies.token) {
      return res.status(400).json({ message: "No hay sesión iniciada." });
    }
    res.clearCookie("token");
    res.status(204).json({ message: "Deslogueado correctamente" });
  },
  me: async (req, res) => {
    const userDni = req.user?.dni;

    if (!userDni) {
      return res.status(400).json({ message: "DNI no encontrado en el token" });
    }
    try {
      const user = await User.findOne({
        where: { dni: userDni },
        attributes: [
          "dni",
          "email",
          "fullName",
          "role",
          "phoneNumber",
          "photo",
          "lastLogin",
        ],
      });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json(user.get({ plain: true }));
    } catch (error) {
      console.error(error);
      res.status(500).send("Error de servidor");
    }
  },
  deleteMe: async (req, res) => {
    const userDni = req.user?.dni;
    if (!userDni) {
      return res.status(400).json({ message: "Autenticación requerida" });
    }
    try {
      const result = await User.destroy({ where: { dni: userDni } });
      if (!result) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  },
  changeUserPassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userDni = req.user?.dni;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({
          message: "Se requieren tanto la contraseña actual como la nueva.",
        });
    }
    if (!validate.password(newPassword)) {
      return res
        .status(400)
        .json({
          message: "La nueva contraseña no cumple con los requisitos mínimos.",
        });
    }

    try {
      const user = await User.findByPk(userDni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "La contraseña actual es incorrecta" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      res.clearCookie("token");
      res.json({
        message:
          "Contraseña cambiada correctamente, por favor iniciá sesión nuevamente",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al cambiar la contraseña" });
    }
  },
  mailForgotPassword: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "El campo email es obligatorio." });
    }
    if (!validate.email(email)) {
      return res
        .status(400)
        .json({ message: "Formato de correo electrónico inválido." });
    }
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const resetToken = generateToken({ userId: user.dni });
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
      const mailOptions = emailService.forgotPasswordEmailOptions(
        user,
        resetToken
      );
      await transporter.sendMail(mailOptions);
      res.json({
        message:
          "Se envió un correo electrónico con instrucciones para restablecer la contraseña.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  mailResetPassword: async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Se requiere un token." });
    }
    if (!newPassword) {
      return res
        .status(400)
        .json({ message: "Se requiere ingresar una nueva contraseña." });
    }
    if (!validate.password(newPassword)) {
      return res
        .status(400)
        .json({
          message: "La nueva contraseña no cumple con los requisitos mínimos.",
        });
    }
    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Sequelize.Op.gt]: Date.now() },
        },
      });
      if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado." });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      const confirmMailOptions =
        emailService.resetPasswordConfirmationEmailOptions(user);
      await transporter.sendMail(confirmMailOptions);
      res.json({ message: "Contraseña actualizada con éxito." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  updateUser: async (req, res) => {
    const { fullName, phoneNumber, photo } = req.body;
    try {
      const user = await User.findByPk(req.user.dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (fullName && !validate.name(fullName)) {
        return res
          .status(400)
          .json({
            message:
              "El nombre completo no es válido o contiene caracteres especiales.",
          });
      }
      if (phoneNumber && !validate.phone(phoneNumber)) {
        return res
          .status(400)
          .json({
            message: "El número de teléfono tiene que ser numérico y válido.",
          });
      }
      if (photo && !validate.imageFormat(photo)) {
        return res
          .status(400)
          .json({ message: "Formato de imagen inválido para la foto." });
      }
      user.fullName = fullName ?? user.fullName;
      user.phoneNumber = phoneNumber ?? user.phoneNumber;
      user.photo = photo ?? user.photo;
      await user.save();
      res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  },
  getUserByDni: async (req, res) => {
    try {
      const userDni = req.params.dni;
      if (!validate.dni(userDni)) {
        return res
          .status(400)
          .json({ message: "El DNI proporcionado no es válido." });
      }
      const user = await User.findByPk(userDni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({
        dni: user.dni,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        photo: user.photo,
        role: user.role,
        lastLogin: user.lastLogin,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al buscar usuario" });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: [
          "dni",
          "fullName",
          "email",
          "phoneNumber",
          "role",
          "photo",
          "lastLogin",
        ],
      });
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  },
  adminResetPassword: async (req, res) => {
    const { dni } = req.params;
    if (!validate.dni(dni)) {
      return res
        .status(400)
        .json({ message: "El DNI proporcionado no es válido." });
    }
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const resetToken = generateToken({ userId: user.dni });
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
      const mailOptions = emailService.adminResetPasswordEmailOptions(
        user,
        resetToken
      );
      await transporter.sendMail(mailOptions);
      res.json({
        message:
          "Se envió un correo electrónico con instrucciones para restablecer la contraseña.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  deleteUserByDni: async (req, res) => {
    const { dni } = req.params;
    if (!validate.dni(dni)) {
      return res
        .status(400)
        .json({ message: "El DNI proporcionado no es válido." });
    }
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      await user.destroy();
      res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  updateUserByDni: async (req, res) => {
    const { dni } = req.params;
    const { fullName, email, phoneNumber, photo } = req.body;
    if (!validate.dni(dni)) {
      return res
        .status(400)
        .json({ message: "El DNI proporcionado no es válido." });
    }
    if (fullName && !validate.name(fullName)) {
      return res
        .status(400)
        .json({
          message:
            "El nombre completo no puede contener caracteres especiales.",
        });
    }
    if (email && !validate.email(email)) {
      return res
        .status(400)
        .json({ message: "Formato de correo electrónico no válido." });
    }
    if (phoneNumber && !validate.phone(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "El número de teléfono tiene que ser numérico." });
    }
    if (photo && !validate.imageFormat(photo)) {
      return res
        .status(400)
        .json({ message: "Formato de imagen inválido para la foto." });
    }
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const updatedData = { fullName, email, phoneNumber, photo };
      await user.update(updatedData);
      res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  },
  depromoteOpertoUserByDni: async (req, res) => {
    const { dni } = req.params;
    if (!validate.dni(dni)) {
      return res
        .status(400)
        .json({ message: "El DNI proporcionado no es válido." });
    }
    try {
      const userToDepromote = await User.findOne({
        where: { dni, role: "oper" },
        include: [
          {
            model: Branch,
            through: { attributes: [] },
            include: [
              {
                model: Business,
                attributes: ["id"],
              },
            ],
          },
        ],
      });
      if (!userToDepromote) {
        return res.status(404).json({ message: "Operador no encontrado" });
      }
      if (
        req.user.role !== "admin" ||
        userToDepromote.Branches[0].Business.id !== req.user.businessId
      ) {
        return res
          .status(403)
          .json({
            message: "No autorizado para depromocionar a este operador",
          });
      }
      userToDepromote.role = "user";
      userToDepromote.branchId = null;
      userToDepromote.businessId = null;
      await userToDepromote.save();
      res.json({ message: "Usuario depromocionado con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  assignRoleToUser: async (req, res) => {
    const { dni } = req.params;
    const { newRole, branchId, businessId } = req.body;
    const validRoles = ["super", "admin", "oper", "user"];
    if (!validate.dni(dni)) {
      return res
        .status(400)
        .json({ message: "El DNI proporcionado es inválido." });
    }
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Rol no válido" });
    }
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      user.role = newRole;
      user.branchId = newRole === "oper" ? branchId : null;
      user.businessId = newRole === "oper" ? businessId : null;
      await user.save();
      res.json({ message: `El rol del usuario fue actualizado a ${newRole}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  createUser: async (req, res) => {
    const { dni, fullName, email, phoneNumber, role, photo } = req.body;
    if (!dni || !validate.dni(dni)) {
      return res
        .status(400)
        .json({ message: "DNI inválido o no proporcionado" });
    }
    if (!fullName || !validate.name(fullName)) {
      return res
        .status(400)
        .json({ message: "Nombre completo inválido o no proporcionado" });
    }
    if (!email || !validate.email(email)) {
      return res
        .status(400)
        .json({ message: "Email inválido o no proporcionado" });
    }
    if (phoneNumber && !validate.phone(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "El número de teléfono es inválido" });
    }
    if (photo && !validate.imageFormat(photo)) {
      return res
        .status(400)
        .json({ message: "Formato de imagen inválido para la foto" });
    }
    try {
      const existingUser = await User.findOne({ where: { dni } });
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
      const newUser = await User.create({
        dni,
        fullName,
        email,
        phoneNumber,
        role: role || "user",
        photo,
      });
      const resetToken = generateToken({ userId: newUser.dni });
      const mailOptions = emailService.createUserEmailOptions(
        newUser,
        resetToken
      );
      await transporter.sendMail(mailOptions);
      res
        .status(201)
        .json({
          message:
            "Usuario creado exitosamente. Se envió un correo a tu cuenta para establecer la contraseña.",
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default userController;
