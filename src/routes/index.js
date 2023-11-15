import express from "express";
import usersRouter from "./users.js";
import businessRouter from "./business.js";
import branchesRouter from "./branches.js";
const router = express.Router();
import { getSecret, getMe } from "../controllers/users.js";
import auth from "../middlewares/auth.js";

router.use("/users", usersRouter);
router.use("/business", businessRouter);
router.use("/branches", branchesRouter);

router.get("/me", auth, getMe);
router.get("/secret", getSecret);

export default router;
