import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import sequelize from "./config/database.js";
import router from "./routes/index.js";

const server = express();
server.use(cookieParser());
server.use(express.json());
server.use(morgan("tiny"));
server.use(express.urlencoded({ extended: true }));
server.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
server.use("/", router);
server.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});
sequelize
.sync({ force: false })
.then(() => {
  console.log("Base de datos sincronizada");
  server.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000");
  });
})
.catch((err) => {
  console.error("Error al sincronizar con la base de datos:", err);
});

export default server;