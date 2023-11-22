import express from "express";
import morgan from "morgan";
import sequelize from "./config/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";

import "./models/User.js";
import "./models/Reservation.js";
import "./models/Branch.js";
import "./models/Business.js";
const server = express();

server.use(cookieParser());
server.use(express.json());
//CORS
server.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
server.use(morgan("tiny"));
server.use(express.urlencoded({ extended: true }));
server.use("/", router);
server.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

sequelize
  .sync({ force: false })
  .then(() => {
    server.listen(5000, () =>
      console.log("Servidor escuchando en el puerto 5000")
    );
  })
  .catch((err) => {
    console.error("Error al sincronizar modelo:", err);
  });

export default server;
