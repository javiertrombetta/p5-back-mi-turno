import express from "express";
import usersRouter from "./users.js";
const router = express.Router();
import { getSecret, getMe } from "../controllers/users.js";
import auth  from '../middlewares/auth.js'

router.use("/users", usersRouter);

router.get("/me", auth, getMe)
router.get("/secret", getSecret)

export default router;
