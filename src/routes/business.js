import express from 'express';
import businessController from '../controllers/businessController.js';
import auth from '../middlewares/auth.js';
import { checkAdminRole } from '../middlewares/rolesMiddleware.js';

const router = express.Router();

router.post('/create', auth, checkAdminRole, businessController.createBusiness);
router.get('/all', auth, businessController.getAllBusinesses);
router.get('/:id', auth, businessController.getBusinessById);
router.put('/update/:id', auth, checkAdminRole, businessController.updateBusiness);

export default router;


