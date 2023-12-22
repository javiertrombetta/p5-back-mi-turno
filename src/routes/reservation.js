import express from 'express';
import reservationController from '../controllers/reservationController.js';
import auth from '../middlewares/auth.js';
import {
  checkOperatorRole,
  checkAdminRole,
  checkSuperRole,
} from '../middlewares/rolesMiddleware.js';

const router = express.Router();

router.put(
  '/qr/:qrToken/status',
  auth,
  checkOperatorRole,
  reservationController.updateReservationStatusByQrToken
);
router.get('/qr/:qrToken', auth, reservationController.getReservationByQrToken);
router.get('/me', auth, reservationController.getUserReservations); //OK

router.get(
  '/branch',
  auth,
  checkOperatorRole,
  reservationController.getBranchReservations
);
router.get(
  '/dashboard/:id',
  auth,
  checkAdminRole,
  reservationController.getReservationMetricsById
);
router.get(
  '/dashboard',
  auth,
  checkSuperRole,
  reservationController.getReservationMetrics
);
router.put('/:id/cancel', auth, reservationController.cancelReservationById); //OK
router.put(
  '/:id/status',
  auth,
  checkOperatorRole,
  reservationController.updateReservationStatus
);
router.put(
  '/:id',
  auth,
  checkSuperRole,
  reservationController.modifyReservation
);
router.delete(
  '/:id',
  auth,
  checkSuperRole,
  reservationController.deleteReservation
);
router.get('/:id', auth, reservationController.getReservationById); //OK
router.get(
  '/',
  auth,
  checkOperatorRole,
  reservationController.getAllReservations
);
router.post('/', auth, reservationController.createReservation);

export default router;
