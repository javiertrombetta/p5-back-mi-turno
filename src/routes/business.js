import express from 'express';
import businessController from '../controllers/businessController.js';
import auth from '../middlewares/auth.js';
import { checkAdminRole, checkSuperRole } from '../middlewares/rolesMiddleware.js';

const router = express.Router();

// Super
router.post('/', auth, checkSuperRole, businessController.createBusiness);
router.put('/:id', auth, checkSuperRole, businessController.updateBusiness);
router.delete('/:id', auth, checkSuperRole, businessController.deleteBusiness);
// Super | Admin
router.get('/:id', auth, checkAdminRole, businessController.getBusinessById);
router.get('/', auth, checkAdminRole, businessController.getAllBusinesses);

export default router;