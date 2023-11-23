import User from "../models/User.js";
import Branch from "../models/Branch.js";
import bcrypt from "bcrypt";
import { generateToken } from "../config/tokens.js";
import { transporter } from '../config/mailTransporter.js';
import { validateName, validateEmail, validatePhone, validateImageFormat } from '../utils/validations.js';

const userController = {
  register: async (req, res) => {
    const { fullName, dni, email, password } = req.body;

    try {
      const userExist = await User.findOne({ where: { dni } });
      if (userExist) {
        return res.status(400).json({ message: "El usuario ya está registrado" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        fullName,
        dni,
        email,
        password: hashedPassword,
      });
      const userResponse = { ...newUser.toJSON(), password: undefined };
      res.status(201).json(userResponse);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al registrar el usuario" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
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
        lastLogin: user.lastLogin
      };
      const token = generateToken(payload);
      res.cookie("token", token, { httpOnly: true });
      res.status(200).json({ message: "Usuario logeado con éxito" });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error de servidor" });
    }
  },
  logout: (req, res) => {
    res.clearCookie("token");
    res.status(204).json({ message: 'Deslogueado correctamente' });
  },
  me: async (req, res) => {
    try { 
      const userDni = req.user.dni;  
      if (!userDni) {
        return res.status(400).json({ message: "DNI no encontrado en el token" });
      }  
      const user = await User.findOne({
        where: { dni: userDni },
        attributes: ['dni', 'email', 'fullName', 'role', 'phoneNumber', 'photo', 'lastLogin']
      });    
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }    
      const userData = user.get({ plain: true });
      res.json({
        ...userData,           
      });  
    } 
    catch (error) {
      console.error(error);
      res.status(500).send('Error de servidor');
    }
  },
  changeUserPassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;  
    try {
      const user = await User.findByPk(req.user.dni);  
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }     
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "La contraseña actual es incorrecta" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();  
      res.clearCookie("token");  
      res.json({ message: "Contraseña cambiada correctamente, por favor iniciá sesión nuevamente" });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al cambiar la contraseña" });
    }
  },
  mailForgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      const resetToken = generateToken({ userId: user.dni });
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
      const resetUrl = `${process.env.MAIL_RESET_PASSWORD_URL}/reset-password/${resetToken}`;
      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: user.email,
        subject: 'Restablecimiento de Contraseña',        
        html: `<h3>¡Hola, ${user.fullName || ''}!</h3>
              <p>Por favor, hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
              <p><a href="${resetUrl}">Hacé clic sobre este mismo link</a></p>
              <p>Si no solicitaste restablecer tu contraseña, por favor ignorá este correo electrónico.</p>
              <p>Saludos,</p>
              <p><b>Equipo de Mi Turno Web App</b></p>`
      };
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Se envió un correo electrónico con instrucciones para restablecer la contraseña.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  mailResetPassword: async (req, res) => {
    const { token, newPassword } = req.body;
    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            [Sequelize.Op.gt]: Date.now()
          }
        }
      });
      if (!user) {
        return res.status(400).json({ message: 'Token inválido o expirado.' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      const confirmMailOptions = {
        from: process.env.MAIL_USERNAME,
        to: user.email,
        subject: 'Confirmación de Cambio de Contraseña',
        html: `<h4>¡Tu contraseña fue cambiada exitosamente!</h4> 
              <p>Si no hiciste este cambio de contraseña, por favor comunicate con nuestro equipo de soporte.</p>
              <p>Si realizaste este cambio, no es necesario que realices ninguna otra acción.</p>
              <p>Saludos,</p>
              <p><b>Equipo de Mi Turno Web App</b></p>`
      };
      await transporter.sendMail(confirmMailOptions);
      res.json({ message: 'Contraseña actualizada con éxito.' });
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
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      if (fullName && !validateName(fullName)) {
        return res.status(400).json({ message: "El nombre completo no debe contener caracteres especiales" });
      }
      if (phoneNumber && !validatePhone(phoneNumber)) {
        return res.status(400).json({ message: "El número de teléfono debe ser numérico" });
      }
      if (photo && !validateImageFormat(photo)) {
        return res.status(400).json({ message: "Formato de imagen inválido para la foto" });
      }
      user.fullName = fullName ?? user.fullName;
      user.phoneNumber = phoneNumber ?? user.phoneNumber;
      user.photo = photo ?? user.photo;
      await user.save();
      res.json({ message: 'Usuario actualizado correctamente' });
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  },
  getUserByDni: async (req, res) => {
    try {
      const userDni = req.params.dni;      
      const user = await User.findByPk(userDni);
      console.log(user)
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
        lastLogin: user.lastLogin
      });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al buscar usuario" });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['dni', 'fullName', 'email', 'phoneNumber', 'role', 'photo', 'lastLogin']
      });
      res.json(users);
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  },     
  adminResetPassword: async (req, res) => {
    const { dni } = req.params;
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      const resetToken = generateToken({ userId: user.dni });
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();
      const resetUrl = `${process.env.MAIL_RESET_PASSWORD_URL}/reset-password/${resetToken}`;
      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: user.email,
        subject: 'Restablecimiento de Contraseña',
        html: `<h3>¡Hola, ${user.fullName || ''}!</h3>
              <p>Un administrador ha solicitado restablecer tu contraseña. Por favor, hacé clic en el siguiente enlace:</p>
              <p><a href="${resetUrl}">Hacé clic sobre este mismo link</a></p>
              <p>Si no solicitaste restablecer tu contraseña, por favor ignorá este correo electrónico.</p>
              <p>Saludos,</p>
              <p><b>Equipo de Mi Turno Web App</b></p>`            
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.' });
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  deleteUserByDni: async (req, res) => {
    const { dni } = req.params;
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      await user.destroy();
      res.json({ message: 'Usuario eliminado con éxito' });
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  updateUserByDni: async (req, res) => {
    const { dni } = req.params;
    const { fullName, email, phoneNumber, photo } = req.body;    
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      if (fullName && !validateName(fullName)) {
        return res.status(400).json({ message: "El nombre completo no debe contener caracteres especiales" });
      }
      if (email && !validateEmail(email)) {
        return res.status(400).json({ message: "Formato de correo electrónico no válido" });
      }
      if (phoneNumber && !validatePhone(phoneNumber)) {
        return res.status(400).json({ message: "El número de teléfono debe ser numérico" });
      }
      if (photo && !validateImageFormat(photo)) {
        return res.status(400).json({ message: "Formato de imagen inválido para la foto" });
      }
      const updatedData = { fullName, email, phoneNumber, photo };
      await user.update(updatedData);
      res.json({ message: 'Usuario actualizado correctamente' });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  },
  depromoteOpertoUserByDni: async (req, res) => {
    const { dni } = req.params;
    try {   
      const userToDepromote = await User.findOne({
        where: { dni, role: 'oper' },
        include: [{
          model: Branch,
          through: { attributes: [] },
          include: [{
            model: Business,
            attributes: ['id']
          }]
        }]
      });
      if (!userToDepromote) {
        return res.status(404).json({ message: 'Operador no encontrado' });
      }
      const adminUser = await User.findOne({
        where: { dni: req.user.dni, role: 'admin' },
        include: [{
          model: Business,
          attributes: ['id']
        }]
      });
      if (!adminUser) {
        return res.status(403).json({ message: 'Solo los administradores pueden realizar esta acción' });
      }
      if (adminUser.Business.id !== userToDepromote.Branches[0].Business.id) {
        return res.status(403).json({ message: 'No puedes depromocionar a un operador de otra empresa' });
      }
      userToDepromote.role = 'user';
      userToDepromote.branchId = null;
      userToDepromote.businessId = null;
      await userToDepromote.save();
      res.json({ message: 'Usuario depromocionado con éxito' });
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  assignRoleToUser: async (req, res) => {
    const { dni } = req.params;
    const { newRole, branchId, businessId } = req.body;
    const validRoles = ['super', 'admin', 'oper', 'user'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }
    try {
      const user = await User.findByPk(dni);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      user.role = newRole;
      if (newRole === 'user' || newRole === 'super') {
        user.branchId = null;
        user.businessId = null;
      } else {
        user.branchId = branchId;
        user.businessId = businessId;
      }
      await user.save();
      res.json({ message: `El rol del usuario ha sido actualizado a ${newRole}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  createUser: async (req, res) => {
    const { dni, fullName, email, phoneNumber, role, photo } = req.body;
    if (!dni || !fullName || !email) {
      return res.status(400).json({ message: 'DNI, nombre completo y correo electrónico son obligatorios' });
    }
    if (!validateEmail(email)) {
       return res.status(400).json({ message: 'Formato de correo electrónico inválido' });
    }
    if (phoneNumber && !validatePhone(phoneNumber)) {
      return res.status(400).json({ message: 'El número de teléfono debe contener solo números' });
    }
    if (photo && !validateImageFormat(photo)) {
      return res.status(400).json({ message: "Formato de imagen inválido para la foto" });
    }
    try {
      const existingUser = await User.findOne({ where: { dni } });
      if (existingUser) {
        return res.status(400).json({ message: 'El usuario ya existe' });
      }
      const newUser = await User.create({
        dni,
        fullName,
        email,
        phoneNumber,
        role: role || 'user',
        photo
      });
      const resetToken = generateToken({ userId: newUser.dni });
      const resetUrl = `${process.env.MAIL_RESET_PASSWORD_URL}/set-password/${resetToken}`;
      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: newUser.email,
        subject: 'Establece tu contraseña',
        html: `<h3>¡Bienvenido/a ${newUser.fullName}!</h3>,
              <p>Por favor, creá tu contraseña haciendo clic en el siguiente enlace:</p> 
              <p><a href="${resetUrl}">Hacé clic en este mismo link</a></p>
              <p>Si no solicitaste crear una contraseña, por favor ignorá este correo electrónico.</p>
              <p>Saludos,</p>
              <p><b>Equipo de Mi Turno Web App</b></p>`
      };
      await transporter.sendMail(mailOptions);
      res.status(201).json({ message: 'Usuario creado exitosamente. Se envió un correo para establecer la contraseña.' });
    } 
    catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default userController;