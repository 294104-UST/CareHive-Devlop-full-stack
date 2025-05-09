import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';
import {authorizeRoles, verifyToken} from '../middleware/auth.middleware'
const router = Router();

// Route to assign schedule to a doctor/nurse/staff
router.post('/assign',verifyToken,authorizeRoles(['HOSPITAL_ADMIN']),ScheduleController.assignSchedule);

// Route to get all schedules for the hospital (user must be associated with the hospital)
router.get(
  '/hospital',
  verifyToken,
  ScheduleController.getSchedulesByHospital
);

// Route to get schedules for a specific user (doctor/nurse/staff)
router.get(
  '/user/:assignedTo',
  verifyToken,authorizeRoles(['HOSPITAL_ADMIN','DOCTOR','NURSE']),
  ScheduleController.getSchedulesForUser
);

export default router;
