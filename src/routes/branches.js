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
router.put('/:id/schedule', auth, checkAdminRole, branchesController.updateSchedule);
router.put('/:id/enable-status', auth, checkAdminRole, branchesController.updateBranchEnableStatus);
// Operator
router.get('/assigned', auth, checkOperatorRole, branchesController.getAssignedBranches);
// All users
router.get('/:id/schedules', auth, branchesController.getBranchSchedules); //OK
router.get('/:id/available-schedules', auth, branchesController.getAvailableBranchSchedules); //OK
router.get('/:id/critical-schedules', auth, branchesController.getCriticalBranchSchedules); //OK
router.get('/:id', auth, branchesController.getBranchById); //OK
router.get('/', auth, branchesController.getAllBranches); //OK

export default router;