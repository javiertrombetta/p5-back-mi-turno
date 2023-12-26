import express from 'express';
import branchesController from '../controllers/branchesController.js';
import auth from '../middlewares/auth.js';
import {
  checkAdminRole,
  checkSuperRole,
  checkOperatorRole,
} from '../middlewares/rolesMiddleware.js';

const router = express.Router();

// Super
router.post('/', auth, checkSuperRole, branchesController.createBranch); //OK
router.put('/:id', auth, checkSuperRole, branchesController.updateBranch);
router.delete('/:id', auth, checkSuperRole, branchesController.deleteBranch);
// Admin
router.get(
  '/:businessId/business',
  auth,
  checkAdminRole,
  branchesController.getBranchesByBusiness
);

router.put(
  '/:id/schedule',
  auth,
  checkAdminRole,
  branchesController.updateSchedule
);
router.put(
  '/:id/status',
  auth,
  checkAdminRole,
  branchesController.updateBranchEnableStatus
); //OK
// Operator
router.get(
  '/assigned',
  auth,
  checkOperatorRole,
  branchesController.getAssignedBranches
);
// All users
router.get('/:id/schedules', auth, branchesController.getBranchSchedules); //OK
router.get(
  '/:id/available-schedules',
  auth,
  branchesController.getAvailableBranchSchedules
); //OK
router.get(
  '/:id/critical-schedules',
  auth,
  branchesController.getCriticalBranchSchedules
); //OK
router.get('/:id', auth, branchesController.getBranchById); //OK
router.get('/', auth, branchesController.getAllBranches); //OK

export default router;
