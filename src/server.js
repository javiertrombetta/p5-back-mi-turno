import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import sequelize from "./config/database.js";
import router from "./routes/index.js";
import { config } from "dotenv";
import './config/scheduleTasks.js';

config();

const forceSyncArg = process.argv[2];
const forceSync = forceSyncArg === 'true';

const server = express();
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3001";
const serverHost = process.env.SERVER_HOST || "http://localhost:3000";
const serverPort = process.env.SERVER_PORT || 3000;

server.use( cors({ origin: corsOrigin, credentials: true }) );
server.use(cookieParser());
server.use(express.json());
server.use(morgan("tiny"));
server.use(express.urlencoded({ extended: true }));
server.use("/", router);
server.use((req, res, next, err) => {
  console.error(err);  
});
sequelize
  .sync({ force: forceSync })
  .then(() => {
    console.log(`Base de datos sincronizada (force: ${forceSync ? "TRUE" : "FALSE"})`);
    server.listen(serverPort, () => {
      console.log(`Servidor escuchando en ${serverHost}:${serverPort}`);
    });
  })
  .catch((err) => {
    console.error("Error al sincronizar con la base de datos:", err);
  });

export default server;
