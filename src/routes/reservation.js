import express from 'express';
import reservationController from '../controllers/reservationController.js';
import auth from '../middlewares/auth.js';
import { checkOperatorRole, checkAdminRole, checkSuperRole } from '../middlewares/rolesMiddleware.js';
import { checkDevEnv } from '../middlewares/envMiddleware.js';

const router = express.Router();

//All users
router.post('/', auth, reservationController.createReservation); 
router.get('/me', auth, reservationController.getUserReservations);
//Operator
router.put('/status/:id', auth, checkOperatorRole, reservationController.updateReservationStatus);
router.get('/branch', auth, checkOperatorRole, reservationController.getBranchReservations);
//Admin
router.get('/metrics', auth, checkAdminRole, reservationController.getReservationMetrics);
//Super
router.put('/:id', auth, checkSuperRole, reservationController.modifyReservation);
router.get('/:id', auth, checkSuperRole, reservationController.getReservationById);
router.get('/', auth, checkSuperRole, reservationController.getAllReservations);
router.delete('/:id', auth, checkSuperRole, checkDevEnv, reservationController.deleteReservation);

export default router;