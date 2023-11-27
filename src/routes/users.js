import express from "express";
import userController from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import {
  checkSuperRole,
  checkAdminRole,
} from "../middlewares/rolesMiddleware.js";
import { checkDevEnv } from "../middlewares/envMiddleware.js";

const router = express.Router();

//Any client not logged in
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", auth, userController.logout);
router.post("/forgot-password", userController.mailForgotPassword);
router.post("/reset-password", userController.mailResetPassword);
//All users
router.put("/me/change-password", auth, userController.changeUserPassword);
router.put("/me", auth, userController.updateUser);
router.get("/me", auth, userController.me);
router.delete("/me", auth, userController.deleteMe);
//Admin
router.put(
  "/:dni/depromote",
  auth,
  checkAdminRole,
  userController.depromoteOpertoUserByDni
);
//Super
router.post(
  "/:dni/reset-password",
  auth,
  checkSuperRole,
  userController.adminResetPassword
);
router.post(
  "/:dni/assign-role",
  auth,
  checkSuperRole,
  userController.assignRoleToUser
);
router.post("/", auth, checkSuperRole, checkDevEnv, userController.createUser);
router.put("/:dni", auth, checkSuperRole, userController.updateUserByDni);
router.get("/:dni", auth, checkSuperRole, userController.getUserByDni);
router.get("/", auth, checkSuperRole, userController.getAllUsers);
router.delete(
  "/:id",
  auth,
  checkSuperRole,
  checkDevEnv,
  userController.deleteUserByDni
);

export default router;
