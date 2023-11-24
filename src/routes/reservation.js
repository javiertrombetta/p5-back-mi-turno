import express from 'express';
import reservationController from '../controllers/reservationController.js';
import auth from '../middlewares/auth.js';
import { checkOperatorRole, checkAdminRole, checkSuperRole } from '../middlewares/rolesMiddleware.js';

const router = express.Router();

//Super
router.get('/all', auth, checkSuperRole, reservationController.getAllReservations);
router.get('/:id', auth, checkSuperRole, reservationController.getReservationById);
router.put('/modify/:id', auth, checkSuperRole, reservationController.modifyReservation);
router.delete('/:id', auth, checkSuperRole, reservationController.deleteReservation);
//Admin
router.get('/metrics', auth, checkAdminRole, reservationController.getReservationMetrics);
//Operator
router.get('/branch', auth, checkOperatorRole, reservationController.getBranchReservations);
router.put('/update/:id', auth, checkOperatorRole, reservationController.updateReservationStatus);
//All users
router.post('/create', auth, reservationController.createReservation); 
router.get('/my', auth, reservationController.getUserReservations);

export default router;