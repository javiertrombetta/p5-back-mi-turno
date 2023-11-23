import jwt from 'jsonwebtoken';

export const generateToken = (payload)=>{
return jwt.sign({ user: payload }, process.env.JWT_SECRET, { expiresIn: "2d"})
};
export const validateToken = (token)=>{
  return jwt.verify(token, process.env.JWT_SECRET)
}