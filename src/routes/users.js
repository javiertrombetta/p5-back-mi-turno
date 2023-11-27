import express from "express";
import userController from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import {
  checkSuperRole,
  checkAdminRole,
} from "../middlewares/rolesMiddleware.js";

const router = express.Router();

//Super
router.post("/create", auth, checkSuperRole, userController.createUser);
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
router.put("/:dni", auth, checkSuperRole, userController.updateUserByDni);
router.get("/all", auth, checkSuperRole, userController.getAllUsers);
router.get("/me", auth, userController.me);
router.get("/:dni", auth, checkSuperRole, userController.getUserByDni);
router.delete("/:dni", auth, checkSuperRole, userController.deleteUserByDni);
//Admin
router.put(
  "/:dni/depromote",
  auth,
  checkAdminRole,
  userController.depromoteOpertoUserByDni
);
//All users
router.put("/me/change-password", auth, userController.changeUserPassword);
router.put("/me", auth, userController.updateUser);
//Any client not logged in
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.mailForgotPassword);
router.post("/reset-password", userController.mailResetPassword);

export default router;
