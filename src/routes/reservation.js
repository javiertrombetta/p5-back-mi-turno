import express from 'express';
import reservationController from '../controllers/reservationController.js';
import auth from '../middlewares/auth.js';
import { checkOperatorRole, checkAdminRole, checkSuperRole } from '../middlewares/rolesMiddleware.js';
import { checkDevEnv } from '../middlewares/envMiddleware.js';

const router = express.Router();

router.put('/qr/:qrToken/status', auth, checkOperatorRole, reservationController.updateReservationStatusByQrToken);
router.get('/qr/:qrToken', auth, reservationController.getReservationByQrToken);
router.get('/me', auth, reservationController.getUserReservations); //OK
router.get('/branch', auth, checkOperatorRole, reservationController.getBranchReservations);
router.get('/dashboard', auth, checkAdminRole, reservationController.getReservationMetrics); //OK
router.put('/:id/cancel', auth, reservationController.cancelReservationById); //OK
router.put('/:id/status', auth, checkOperatorRole, reservationController.updateReservationStatus);
router.put('/:id', auth, checkSuperRole, reservationController.modifyReservation);
router.delete('/:id', auth, checkSuperRole, checkDevEnv, reservationController.deleteReservation);
router.get('/:id', auth, reservationController.getReservationById); //OK
router.get('/', auth, checkSuperRole, reservationController.getAllReservations);
router.post('/', auth, reservationController.createReservation); 

export default router;