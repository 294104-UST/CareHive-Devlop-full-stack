import express from 'express';
import { DoctorController } from '../contollers/doctor.controller';
import { verifyToken } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

/** ─── CREATE ─────────────────────────────────────────────────────────────── */
// Only hospital admins can create new doctors
router.post(
  '/create-doctor',
  verifyToken,
  checkRole(['HOSPITAL_ADMIN']),
  DoctorController.createDoctor
);

/** ─── READ ───────────────────────────────────────────────────────────────── */
/** List & filtering */
// Get all doctors in this hospital
router.get('/hospital/:hospitalId', DoctorController.getDoctorsByHospitalId); // Public or protected based on your need

// Get all doctors in a given department
router.get(
  '/department/:departmentId',
  verifyToken,
  DoctorController.getDoctorsByDepartment
);
// Get doctors available on a selected date (for scheduling UI)
router.get(
  '/availabledates',
  verifyToken,
  checkRole(['HOSPITAL_ADMIN']),
  DoctorController.getAvailableDoctorsForScheduling
);
// Lookup by email (e.g. for invitations or internal lookups)
router.get(
  '/by-email/:email',
  DoctorController.getDoctorByEmail
);

/** “Me” & profile */
// View your own profile (DOCTOR role)
router.get(
  '/profile',
  verifyToken,
  checkRole(['DOCTOR']),
  DoctorController.getOwnProfile
);
// Get your schedule objects via the proxy endpoint
router.get(
  '/schedule/me',
  verifyToken,
  checkRole(['DOCTOR']),
  DoctorController.getScheduledDates
);

/** Individual doctor by ID */
// Note: place this *after* all the literal routes above so `/profile` and `/schedule/me` don’t get treated as `:id`
router.get(
  '/:id',
  
  DoctorController.getDoctorById
);

/** ─── UPDATE ─────────────────────────────────────────────────────────────── */
/** Full replace */
// Update basic doctor info
router.put(
  '/:id',
  verifyToken,
  DoctorController.updateDoctor
);

/** Partial updates */
// Toggle availability status (on/off)
router.patch(
  '/availability/:id',
  verifyToken,
  DoctorController.updateAvailability
);
// Add or remove leave dates (DOCTOR role)
router.patch(
  '/leave/add',
  verifyToken,
  checkRole(['DOCTOR']),
  DoctorController.addLeaveDate
);
router.patch(
  '/leave/remove',
  verifyToken,
  checkRole(['DOCTOR']),
  DoctorController.removeLeaveDate
);
// Receive schedule assignment from Hospital-Admin service
router.patch(
  '/:doctorId/schedule',
  verifyToken,
  checkRole(['HOSPITAL_ADMIN', 'DOCTOR']),
  DoctorController.addScheduleToDoctor
);

/** ─── DELETE ─────────────────────────────────────────────────────────────── */
// Delete a doctor
router.delete(
  '/:id',
  verifyToken,
  DoctorController.deleteDoctor
);

export default router;
