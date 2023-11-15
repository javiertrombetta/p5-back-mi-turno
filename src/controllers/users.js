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