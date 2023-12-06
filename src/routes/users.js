import express from "express";
import multer from "multer";
import userController from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import { checkSuperRole, checkAdminRole} from "../middlewares/rolesMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

//Any client not logged in
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.mailForgotPassword);
router.post("/reset-password", userController.mailResetPassword);
//All users
router.post("/send-message", auth, userController.sendMessage);
router.post("/logout", auth, userController.logout);
router.put("/me/change-password", auth, userController.changeUserPassword);
router.put("/me", auth, upload.single("photo"), userController.updateUser);
router.get("/me", auth, userController.me);
router.delete("/me", auth, userController.deleteMe);
//Admin
router.put("/:dni/depromote", auth, checkAdminRole, userController.depromoteOpertoUserByDni);
router.get("/oper", auth, checkAdminRole, userController.getAllOpersByBusiness);
//Super
router.post("/:dni/reset-password", auth, checkSuperRole, userController.adminResetPassword);
router.post("/:dni/assign-role", auth, checkSuperRole, userController.assignRoleToUser);
router.post("/", auth, checkSuperRole, userController.createUser);
router.put("/:dni", auth, checkSuperRole, upload.single("photo"), userController.updateUserByDni);
router.get("/:dni", auth, checkAdminRole, userController.getUserByDni);
router.get("/", auth, checkSuperRole, userController.getAllUsers);
router.delete("/:dni", auth, checkSuperRole, userController.deleteUserByDni);
//Oper
router.post("/users/assign", userController.assignBusinessAndBranches);

export default router;
