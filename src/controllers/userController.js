import Sequelize from "sequelize";
import models from "../models/index.js";
import bcrypt from "bcrypt";
import { generateToken } from "../config/tokens.js";
import { transporter } from "../config/mailTransporter.js";
import validate from "../utils/validations.js";
import emailTemplates from "../utils/emailTemplates.js";

const { User, Branch, Business, Reservation } = models;
const userController = {
  register: async (req, res) => {
    const { fullName, dni, email, phoneNumber, password } = req.body;
    if (!fullName) {
      return res.status(400).json({ message: "Nombre completo no proporcionado." });
    }
    if (!dni) {
      return res.status(400).json({ message: "DNI no proporcionado." });
    }
    if (!validate.dni(dni)) {
      return res.status(400).json({ 
        message: "El DNI no cumple con las condiciones mínimas:\n" +
                 "✓ Solo se aceptan números.\n" +
                 "✓ 8 dígitos de largo."                  
      });
    }
    if (!email) {
      return res.status(400).json({ message: "Email no proporcionado." });
    }
    if (!validate.email(email)) {
      return res.status(400).json({ message: "El email tiene un formato incorrecto." });
    }
    if (!phoneNumber) {
      return res.status(400).json({ message: "Número de teléfono no proporcionado." });
    }
    if (!validate.phone(phoneNumber)) {
      return res.status(400).json({ message: "El número de teléfono tiene un formato incorrecto." });
    }
    if (!password) {
      return res.status(400).json({ message: "Contraseña no proporcionada." });
    }
    if (!validate.name(fullName)) {
      return res.status(400).json({ message: "El nombre completo contiene caracteres inválidos." });
    }   
    if (!validate.password(password)) {
      return res.status(400).json({ 
        message: "La nueva contraseña no cumple con los requisitos mínimos:\n" +
                 "✓ Solo letras y números.\n" +
                 "✓ 1 letra mayúscula.\n" +
                 "✓ 1 letra minúscula.\n" +
                 "✓ 1 número.\n" +
                 "✓ 8 caracteres de largo." 
      });
    }
    try {
      const userExist = await User.findOne({ where: { dni } });
      if (userExist) {
        return res.status(400).json({ message: "El usuario ya se encuentra registrado." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        fullName,
        dni,
        email,
        phoneNumber,
        password: hashedPassword,
      });      
      const mailOptions = emailTemplates.welcome(newUser);
      await transporter.sendMail(mailOptions);      
      const userResponse = { ...newUser.toJSON(), password: undefined };
      res.status(201).json(userResponse);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al registrar el usuario." });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email no proporcionado." });
    }
    if (!validate.email(email)) {
      return res.status(400).json({ message: "El email no tiene un formato correcto." });
    }
    if (!password) {
      return res.status(400).json({ message: "Contraseña no proporcionada." });
    }

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado." });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Contraseña inválida." });
      }
      await user.update({ lastLogin: new Date() });
      const payload = {
        dni: user.dni,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        photo: user.photo,        
        businessId: user.businessId,
        branchId: user.businessId,
        lastLogin: user.lastLogin,
      };
      const token = generateToken(payload);
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({ payload, message: "Usuario logeado con éxito." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error de servidor." });
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
      return res.status(400).json({ message: "DNI no encontrado en el token." });
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
          "businessId",
          "branchId",
          "lastLogin",
        ],
      });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
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
      return res.status(400).json({ message: "Autenticación requerida." });
    }
    try {
      const user = await User.findOne({ where: { dni: userDni } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }      
      await User.destroy({ where: { dni: userDni } });
      const mailOptions = emailTemplates.accountDeletion(user);
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Usuario eliminado con éxito." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar el usuario." });
    }
  },
  changeUserPassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userDni = req.user?.dni;
    if (!currentPassword) { 
      return res.status(400).json({ message: "Se requiere la contraseña actual."});
    }
    if (!newPassword) { 
      return res.status(400).json({ message: "Se requiere la contraseña nueva."});
    }
    if (!validate.password(newPassword)) {
      return res.status(400).json({ 
        message: "La nueva contraseña no cumple con los requisitos mínimos:\n" +
                 "✓ Solo letras y números.\n" +
                 "✓ 1 letra mayúscula.\n" +
                 "✓ 1 letra minúscula.\n" +
                 "✓ 1 número.\n" +
                 "✓ 8 caracteres de largo." 
      });
    }
    try {
      const user = await User.findByPk(userDni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "La contraseña actual es incorrecta." });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      const mailOptions = emailTemplates.passwordChanged(user);
      await transporter.sendMail(mailOptions);
      res.clearCookie("token");
      res.json({ message: "Contraseña cambiada correctamente, por favor iniciá sesión nuevamente." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al cambiar la contraseña." });
    }
  },
  mailForgotPassword: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "El campo email es obligatorio." });
    }
    if (!validate.email(email)) {
      return res.status(400).json({ message: "El formato de correo electrónico es inválido." });
    }
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no registrado." });
      }
      const resetToken = generateToken({ userId: user.dni });
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
      const mailOptions = emailTemplates.forgotPassword(user, resetToken);
      await transporter.sendMail(mailOptions);
      res.json({ message: "Se envió un correo electrónico con instrucciones para restablecer la contraseña." });
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
      return res.status(400).json({ message: "Se requiere ingresar una nueva contraseña." });
    }
    if (!validate.password(newPassword)) {
      return res.status(400).json({ 
        message: "La nueva contraseña no cumple con los requisitos mínimos:\n" +
                 "✓ Solo letras y números.\n" +
                 "✓ 1 letra mayúscula.\n" +
                 "✓ 1 letra minúscula.\n" +
                 "✓ 1 número.\n" +
                 "✓ 8 caracteres de largo." 
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
      const confirmMailOptions = emailTemplates.resetPasswordConfirmation(user);
      await transporter.sendMail(confirmMailOptions);
      res.json({ message: "Contraseña actualizada con éxito." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  updateUser: async (req, res) => {
    const { fullName, phoneNumber } = req.body;
    let updatedFields = [];
    const photo = req.file;    
    try {
      const user = await User.findByPk(req.user.dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      if (fullName && !validate.name(fullName)) {
        return res.status(400).json({ message: "El nombre completo contiene caracteres especiales." });
      }
      if (phoneNumber && !validate.phone(phoneNumber)) {
        return res.status(400).json({ message: "El número de teléfono tiene que contener solo números." });
      }
      if (photo && !!validate.imageFormat(photo)) {
        return res.status(400).json({ message: "El formato de imagen es inválido para la foto." });
      }
      if (fullName && fullName !== user.fullName) {
        user.fullName = fullName;
        updatedFields.push('Nombre Completo');
      }
      if (phoneNumber && phoneNumber !== user.phoneNumber) {
        user.phoneNumber = phoneNumber;
        updatedFields.push('Número de Teléfono');
      }
      if (photo && photo !== user.photo) {
        user.photo = photo;
        updatedFields.push('Foto');
      }
      await user.save();
      if (updatedFields.length > 0) {
        const mailOptions = emailTemplates.userDetailsUpdated(user, updatedFields);
        await transporter.sendMail(mailOptions);
      }
      res.json({ message: "Usuario actualizado correctamente." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar usuario." });
    }
  },
  getUserByDni: async (req, res) => {
    try {
      const userDni = req.params.dni;
      if (!userDni) {
        return res.status(400).json({ message: "DNI no propocionado." });
      }
      if (!validate.dni(userDni)) {
        return res.status(400).json({ message: "El DNI es inválido." });
      }
      const user = await User.findByPk(userDni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      res.json({
        dni: user.dni,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        photo: user.photo,
        role: user.role,
        businessId: user.businessId,
        branchId: user.businessId,
        lastLogin: user.lastLogin,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al buscar usuario." });
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
          "businessId",
          "branchId",
          "lastLogin",
        ],
      });
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener usuarios." });
    }
  },
  getAllOpersByBusiness: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No autorizado. Solo los administradores pueden realizar esta acción.' });
      } 
      const userBusinessId = req.user.businessId;
      const opers = await User.findAll({
        where: {
          role: 'oper',
          businessId: userBusinessId
        },
        include: [
          {
            model: Business,
            as: 'Business',
            attributes: ['id', 'name']
          }
        ],
        attributes: ['dni', 'fullName', 'email', 'phoneNumber', 'role', 'photo', 'lastLogin']
      });  
      if (opers.length === 0) {
        return res.status(404).json({ message: 'No se encontraron operadores para esta empresa.' });
      }  
      res.status(200).json(opers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los operadores.' });
    }
  },
  adminResetPassword: async (req, res) => {
    const { dni } = req.params;
    if (!validate.dni(dni)) {
      return res.status(400).json({ message: "El DNI es inválido." });
    }
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      const resetToken = generateToken({ userId: user.dni });
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
      const mailOptions = emailTemplates.adminResetPassword(user, resetToken);
      await transporter.sendMail(mailOptions);
      res.json({ message: "Se envió un correo electrónico con instrucciones para restablecer la contraseña." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  deleteUserByDni: async (req, res) => {
    const { dni } = req.params;
    if (!validate.dni(dni)) {
      return res.status(400).json({ message: "El DNI es inválido." });
    }
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }  
      await Reservation.destroy({ where: { userId: dni } });
      const mailOptions = emailTemplates.accountDeletion(user);
      await transporter.sendMail(mailOptions);
      await user.destroy();
      res.json({ message: "Usuario eliminado con éxito." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  updateUserByDni: async (req, res) => {
    const { dni } = req.params;
    const { fullName, email, phoneNumber, role, businessId, branchId } = req.body; // businessId y branchId agregado x fran
    const photo = req.file;
    let updatedFields = [];    
    if (!validate.dni(dni)) {
      return res.status(400).json({ message: "El DNI es inválido." });
    }    
    if (fullName && !validate.name(fullName)) {
      return res.status(400).json({ message: "El nombre completo no puede contener caracteres especiales." });
    }
    if (email && !validate.email(email)) {
      return res.status(400).json({ message: "Formato de correo electrónico no válido." });
    }
    if (phoneNumber && !validate.phone(phoneNumber)) {
      return res.status(400).json({ message: "El número de teléfono tiene que ser numérico." });
    }
    if (role && !validate.role(role)) {
      return res.status(400).json({ message: "El rol ingresado es inválido." });
    }
    if (photo && !validate.imageFormat(photo)) {
      return res.status(400).json({ message: "Formato de imagen inválido para la foto." });
    }
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      if (fullName && fullName !== user.fullName) updatedFields.push('Nombre Completo');
      if (email && email !== user.email) updatedFields.push('Correo Electrónico');
      if (phoneNumber && phoneNumber !== user.phoneNumber) updatedFields.push('Número de Teléfono');
      if (role && role !== user.role) updatedFields.push('Rol');
      if (photo && photo !== user.photo) updatedFields.push('Foto');
      if (businessId && businessId !== user.businessId) updatedFields.push('Empresa'); // agrgado x fran
      if (branchId && branchId !== user.branchId) updatedFields.push('Sucursal'); // agregado x fran
      const updatedData = { fullName, email, phoneNumber, photo, businessId, branchId }; // businessId y branchId agrgados x fran
      await user.update(updatedData);
      if (updatedFields.length > 0) {
        const mailOptions = emailTemplates.userDetailsUpdated(user, updatedFields);
        await transporter.sendMail(mailOptions);
      }
      res.json({ message: "Usuario actualizado correctamente." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar usuario." });
    }
  },
  depromoteOpertoUserByDni: async (req, res) => {
    const { dni } = req.params;
    if (!validate.dni(dni)) {
      return res.status(400).json({ message: "El DNI es inválido." });
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
        return res.status(404).json({ message: "Operador no encontrado." });
      }
      if (
        req.user.role !== "admin" ||
        userToDepromote.Branches[0].Business.id !== req.user.businessId
      ) {
        return res.status(403).json({ message: "No autorizado para depromocionar a este operador." });
      }
      userToDepromote.role = "user";
      userToDepromote.branchId = null;
      userToDepromote.businessId = null;
      await userToDepromote.save();
      res.json({ message: "Usuario depromocionado con éxito." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  assignBusinessAndBranches: async (req, res) => {
    const { dni, businessId, branchIds } = req.body;
    if (!dni) {
      return res.status(400).json({ message: "DNI no proporcionado." });
    }
    if (!validate.dni(dni)) {
        return res.status(400).json({ message: "DNI inválido." });
    }
    if (!businessId) {
        return res.status(400).json({ message: "ID de empresa no proporcionado." });
    }
    if (!validate.id(businessId)) {
        return res.status(400).json({ message: "ID de empresa inválido." });
    }
    if (!branchIds || branchIds == undefined || branchIds == []) {
      return res.status(400).json({ message: "No se enviaron las sucursales solicitadas." });
    }
    if (!validate.branchIds(branchIds)) {
      return res.status(400).json({ message: "IDs de sucursales inválidos." });
    }
    try {
        const user = await User.findByPk(dni);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        user.businessId = businessId;
        if (user.role === 'oper' && branchIds && Array.isArray(branchIds)) {
            await user.setBranches(branchIds);
        } else {
            await user.setBranches([]);
        }
        await user.save();
        res.json({ message: "Empresa y sucursales asignadas correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
  },
  assignRoleToUser: async (req, res) => {
    const { dni } = req.params;
    const { newRole, branchId, businessId } = req.body;
    if (!validate.dni(dni)) {
      return res.status(400),json({ message: "El DNI proporcionado es inválido." });
    }
    if (!validate.role(newRole)) {
      return res.status(400).json({ message: "El rol ingresado es inválido" });
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
      res.json({ message: `El rol del usuario fue actualizado a ${newRole}.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  createUser: async (req, res) => {
    const { dni, fullName, email } = req.body;
    if (!dni) {
      return res.status(400).json({ message: "DNI no proporcionado." });
    }
    if (!fullName) {
      return res.status(400).json({ message: "Nombre completo no proporcionado." });
    }
    if (!email) {
      return res.status(400).json({ message: "Email no proporcionado." });
    }   
    if (!validate.dni(dni)) {
      return res.status(400).json({ message: "DNI inválido." });
    }
    if (!validate.name(fullName)) {
      return res.status(400).json({ message: "Nombre completo inválido." });
    }
    if (!validate.email(email)) {
      return res.status(400).json({ message: "Email inválido." });
    }      
    try {
      const existingUser = await User.findOne({ where: { dni } });
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe." });
      }
      const newUser = await User.create({
        dni,
        fullName,
        email
      });
      const resetToken = generateToken({ userId: newUser.dni });
      const mailOptions = emailTemplates.createUser(newUser, resetToken);
      await transporter.sendMail(mailOptions);
      res.status(201).json({ 
        message: "Usuario creado exitosamente.\nSe envió un correo a tu cuenta para establecer la contraseña." 
      });      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  sendMessage: async (req, res) => {
    const { message } = req.body;
    const user = req.user;
    const adminEmail = "miturnowebapp@gmail.com"; 
    try {
      const userMailOptions = emailTemplates.userQueryConfirmation(user, message);
      await transporter.sendMail(userMailOptions);

      const adminMailOptions = emailTemplates.adminNotificationOfUserQuery(adminEmail, user, message);
      await transporter.sendMail(adminMailOptions);

      res.json({ message: "Mensaje enviado con éxito." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al enviar el mensaje." });
    }
  }
};

export default userController;
