import express from 'express';
import branchesController from '../controllers/branchesController.js';
import auth from '../middlewares/auth.js';
import { checkAdminRole, checkSuperRole, checkOperatorRole } from '../middlewares/rolesMiddleware.js';

const router = express.Router();

// Super
router.post('/', auth, checkSuperRole, branchesController.createBranch);
router.put('/:id', auth, checkSuperRole, branchesController.updateBranch);
router.delete('/:id', auth, checkSuperRole, branchesController.deleteBranch);
// Admin
router.get('/business/:businessId', auth, checkAdminRole, branchesController.getBranchesByBusiness);
// Operator
router.get('/assigned', auth, checkOperatorRole, branchesController.getAssignedBranches);
// All users
router.get('/:id/schedules', auth, branchesController.getBranchSchedules);
router.get('/:id/available-schedules', auth, branchesController.getAvailableBranchSchedules);
router.get('/:id/critical-schedules', auth, branchesController.getCriticalBranchSchedules);
router.get('/:id', auth, branchesController.getBranchById);
router.get('/', auth, branchesController.getAllBranches);

export default router;