import express from 'express';
import businessController from '../controllers/businessController.js';
import auth from '../middlewares/auth.js';
import { checkAdminRole, checkSuperRole } from '../middlewares/rolesMiddleware.js';

const router = express.Router();

// Super
router.post('/create', auth, checkSuperRole, businessController.createBusiness);
router.put('/update/:id', auth, checkSuperRole, businessController.updateBusiness);
router.delete('/:id', auth, checkSuperRole, businessController.deleteBusiness);
// Super | Admin
router.get('/all', auth, checkAdminRole, businessController.getAllBusinesses);
router.get('/:id', auth, checkAdminRole, businessController.getBusinessById);

export default router;