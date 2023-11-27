import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import sequelize from "./config/database.js";
import router from "./routes/index.js";
import { config } from "dotenv";

if (process.env.NODE_ENV === "production") {
  config({ path: ".env.production" });
} else {
  config();
}

const forceSync = process.env.NODE_ENV !== "production";
const server = express();
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3001";
const serverPort = process.env.SERVER_PORT || 3000;

server.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
server.use(cookieParser());
server.use(express.json());
server.use(morgan("tiny"));
server.use(express.urlencoded({ extended: true }));
server.use("/", router);
server.use((req, res, next, err) => {
  console.error(err);
  if (process.env.NODE_ENV === "production") {
    res.status(500).send("Internal Server Error");
  } else {
    res.status(500).send(err.message);
  }
});
sequelize
  .sync({ force: forceSync })
  .then(() => {
    console.log(
      `Base de datos sincronizada (force: ${forceSync ? "TRUE" : "FALSE"})`
    );
    server.listen(serverPort, () => {
      console.log(`Servidor escuchando en el puerto ${serverPort}`);
    });
  })
  .catch((err) => {
    console.error("Error al sincronizar con la base de datos:", err);
  });

export default server;
