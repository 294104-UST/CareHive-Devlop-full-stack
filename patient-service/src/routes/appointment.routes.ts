import express from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { verifyToken, allowRoles } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/book', verifyToken, allowRoles(['PATIENT']), AppointmentController.book);
router.get('/me', verifyToken, allowRoles(['PATIENT']), AppointmentController.getMyAppointments);

export default router;
