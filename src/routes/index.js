import express from "express";
import usersRouter from "./users.js";
import businessRouter from "./business.js";
const router = express.Router();

router.use("/users", usersRouter);
router.use("/business", businessRouter);

export default router;
