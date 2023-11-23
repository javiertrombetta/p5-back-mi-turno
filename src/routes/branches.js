import express from 'express';
import branchesController from '../controllers/branchesController.js';
import auth from '../middlewares/auth.js';
import { checkAdminRole, checkSuperRole, checkOperatorRole } from '../middlewares/rolesMiddleware.js';

const router = express.Router();

// Super
router.post('/create', auth, checkSuperRole, branchesController.createBranch);
router.put('/update/:id', auth, checkSuperRole, branchesController.updateBranch);
router.delete('/delete/:id', auth, checkSuperRole, branchesController.deleteBranch);
// Admin
router.get('/by-business/:businessId', auth, checkAdminRole, branchesController.getBranchesByBusiness);
// Operator
router.get('/assigned', auth, checkOperatorRole, branchesController.getAssignedBranches);
// All users
router.get('/all', auth, branchesController.getAllBranches);
router.get('/:id', auth, branchesController.getBranchById);

export default router;