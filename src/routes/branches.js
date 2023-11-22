import express from 'express';
import branchesController from '../controllers/branchesController.js';
import auth from '../middlewares/auth.js';
import { checkAdminRole } from '../middlewares/rolesMiddleware.js';

const router = express.Router();

router.post('/create', auth, checkAdminRole, branchesController.createBranch);
router.get('/all', auth, branchesController.getAllBranches);
router.get('/:id', auth, branchesController.getBranchById);
router.put('/update/:id', auth, checkAdminRole, branchesController.updateBranch);

export default router;



