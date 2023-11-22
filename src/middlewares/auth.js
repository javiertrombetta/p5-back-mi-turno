import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Asigna el objeto decodificado a req.user
    next();
  } catch (error) {
    res.status(400).json({ message: "Token is not valid" });
  }
};


export default auth;
