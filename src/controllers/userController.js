import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateToken } from "../config/tokens.js";
import User from "../models/User.js";

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
    } catch (error) {
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
    } catch (error) {
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
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Error de servidor');
    }
  },
  changeUserPassword: async (req, res) => {  

    const { newPassword } = req.body;

    try {
      const user = await User.findByPk(req.user.dni);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Contraseña cambiada correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al cambiar la contraseña" });
    }
  },
  mailPasswordReset: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: "Recuperación de Contraseña",
        html: `Hacé clic en el siguiente enlace para restablecer tu contraseña: <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Restablecer Contraseña</a>`
      };

      await transporter.sendMail(mailOptions);

      res.json({ message: "Correo de recuperación enviado con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al enviar el correo de recuperación" });
    }
  },
  profilePasswordReset: async (req, res) => {
    const { newPassword } = req.body;

    try { 
      
      console.log(req.body)

      const user = await User.findByPk(dni);
      
      if (!user) {
        return res.status(403).json({ error: "Usuario no encontrado" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Contraseña actualizada con éxito" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al actualizar la contraseña" });
    }
  },
  updateUser: async (req, res) => {    
    const updateData = req.body;

    try {
      const user = await User.findByPk(req.user.dni);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (updateData.photo) user.photo = updateData.photo;

      await user.save();

      res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  },  
   assignBranchToOperator: async (req, res) => {
    const { dni } = req.params;
    const { branchId } = req.body;

    try {
      const user = await User.findByPk(dni);
      if (!user || user.rol !== 'oper') {
        return res.status(404).json({ message: 'Operador no encontrado o rol incorrecto' });
      }

      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ message: 'Sucursal no encontrada' });
      }
      
      await user.addBranch(branch);

      res.json({ message: 'Sucursal asignada al operador con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al asignar la sucursal al operador' });
    }
  },

};

export default userController;