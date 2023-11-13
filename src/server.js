import express from "express";
import morgan from "morgan";
import sequelize from "./config/database.js";

const server = express();

server.use(express.json());
server.use(morgan("tiny"));
server.use(express.urlencoded({ extended: true }));

server.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

sequelize
  .sync({ force: true })
  .then(() => {
    server.listen(3000, () =>
      console.log("Servidor escuchando en el puerto 3000")
    );
  })
  .catch((err) => {
    console.error("Error al sincronizar modelo:", err);
  });

export default server;
