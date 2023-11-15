

import jwt from 'jsonwebtoken';

//lo unico que certifica que tenemos iniciado la sesion es el TOKEN y ese token viaja a traves de las cookies
export const generateToken = (payload)=>{
  //payload:contenido que queremos guardar
//con el secret lo encriptamos
return jwt.sign({ user: payload }, process.env.JWT_SECRET, { expiresIn: "2d"})

};




export const validateToken = (token)=>{
  return jwt.verify(token, process.env.JWT_SECRET)
}