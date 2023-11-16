import { generateToken } from "../config/tokens.js";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const getMe = (req, res) => {
  res.send(req.user);
};

export const getSecret = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const validateToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Esteeeeee validatetokennn',validateToken);
    console.log('Valor de dni en validateToken:', validateToken.dni);

    const user = await User.findOne({
      where: { dni: validateToken.user.dni },
      attributes: ["dni", "email", "firstAndLastName"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;

 try {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isValid = await user.validatePassword(password);

  if (!isValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const payload = {
    dni: user.dni,
    email: user.email
  };

  const token = generateToken(payload);

  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({ message: "User logged in successfully" });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
  
};

export const postLogout = (req, res) =>{
  res.clearCookie("token")
  res.sendStatus(204)
  }


  //RECUPERO DE CONTRASEÑA
  export const postPasswordReset = (req, res) => {
  const { email } = req.body;

  // Buscamos al usuario por su dirección de correo electrónico en la base de datos
  User.findOne({
    where: { email: email },
  })
    .then((user) => {
      if (!user) {
        // si el usuario no existe, respondemos con un error
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Generamos un token de recuperación de contraseña
      const token = jwt.sign({ userId: user.id }, "tu_secreto", {
        expiresIn: "1h",
      });

      // Enviamos el correo electrónico al usuario con el enlace de recuperación
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "belenbanegasbanegas@gmail.com",
          pass: "los del espacio",
        },
      });

      const mailOptions = {
        from: "belenbanegasbanegas@gmail.com",
        to: email,
        subject: "Recuperación de Contraseña",
        html: `Haz clic en el siguiente enlace para restablecer tu contraseña: <a href="http://localhost:3000/reset-password?token=${token}">Restablecer Contraseña</a>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res
            .status(500)
            .json({ error: "Error al enviar el correo de recuperación" });
        } else {
          console.log("Correo de recuperación enviado: " + info.response);
          res.json({ message: "Correo de recuperación enviado con éxito" });
        }
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Error al buscar al usuario" });
    });
};

// Ruta para completar el restablecimiento de contraseña
export const postCompletePasswordReset = async (req, res) => {
  console.log(req.body);
  const { token, newPassword } = req.body;

  try {
    // Verificamos y decodificamos el token
    const decoded = jwt.verify(token, "tu_secreto");

    // Buscamos al usuario por ID
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(403).json({ error: "Usuario no encontrado" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizamos la contraseña del usuario en la base de datos
    user.password = hashedPassword;
    await user.save();

    // Respondemos con un mensaje de éxito
    res.json({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la contraseña" });
  }
};