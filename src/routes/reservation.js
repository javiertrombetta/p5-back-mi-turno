
import express from 'express';
import reservationController from '../controllers/reservationController.js';

const router = express.Router();

router.post('/create', reservationController.createReservation); 
router.get('/all', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);
router.put('/update/:id', reservationController.updateReservation);

export default router;

