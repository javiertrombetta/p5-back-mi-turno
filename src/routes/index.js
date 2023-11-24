import express from 'express';
import usersRouter from './users.js';
import businessRouter from './business.js';
import branchesRouter from './branches.js';
import reservationRouter from './reservation.js';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/business', businessRouter);
router.use('/branches', branchesRouter);
router.use('/reservations', reservationRouter);

export default router;