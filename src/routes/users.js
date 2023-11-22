import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import { checkAdminRole } from '../middlewares/rolesMiddleware.js';


const router = express.Router();


router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/password-reset', userController.mailPasswordReset);
router.post('/complete-password-reset', userController.profilePasswordReset);

router.get('/me', auth, userController.me);
router.get('/all', auth, userController.getAllUsers);
router.get('/:dni', auth, userController.getUserByDni);
router.put('/update', auth, userController.updateUser);
router.put('/change-password', auth, userController.changeUserPassword);

router.post('/:dni/assign-branch', auth, checkAdminRole, userController.assignBranchToOperator);

export default router;



