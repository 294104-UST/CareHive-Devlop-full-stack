import express from 'express';
import { NurseController } from '../controllers/nurse.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/auth.middleware';

const router = express.Router();

/** ─── CREATE ─────────────────────────────────────────────────────────────── */
// Only hospital admins can create new nurses
router.post(
  '/create-nurse',
  verifyToken,
  checkRole(['HOSPITAL_ADMIN']),
  NurseController.createNurse
);

/** ─── READ ───────────────────────────────────────────────────────────────── */
/** List & filtering */
// Get all nurses in this hospital
router.get(
    '/hospital',
    verifyToken,
    checkRole(['HOSPITAL_ADMIN']),
    NurseController.getNursesByHospital
  );
// Get all nurses in a given department
router.get(
  '/department/:departmentId',
  verifyToken,
  NurseController.getNursesByDepartment
);
// Get nurses available on a selected date (for scheduling UI)
/** ─── GET AVAILABLE NURSES FOR SCHEDULING ───────────────────────────────── */
router.get(
    '/availabledates',
    verifyToken,
    checkRole(['HOSPITAL_ADMIN']),
    NurseController.getAvailableNursesForScheduling
  );
// Lookup by email (e.g., for invitations or internal lookups)
/** ─── GET NURSE BY EMAIL ───────────────────────────────────────────────── */
router.get(
    '/by-email/:email',  // Optional: Ensure only hospital admins can access this.
    NurseController.getNurseByEmail
  );

/** “Me” & profile */
// View your own profile (NURSE role)
router.get(
  '/profile',
  verifyToken,
  checkRole(['NURSE']),
  NurseController.getOwnProfile
);
/** ─── GET SCHEDULED DATES (NURSE ROLE) ─────────────────────────────────── */
router.get(
    '/schedule/me',
    verifyToken,  // Ensure the user is authenticated
    checkRole(['NURSE']),  // Ensure the user has the 'NURSE' role
    NurseController.getScheduledDates
  );

/** Individual nurse by ID */
// Note: place this *after* all the literal routes above so `/profile` and `/schedule/me` don’t get treated as `:id`

/** ─── GET NURSE BY ID ──────────────────────────────────────────────────── */
router.get(
    '/:id',
      // Optional: Ensure the user has the 'HOSPITAL_ADMIN' role or customize as needed
    NurseController.getNurseById
  );

/** ─── UPDATE ─────────────────────────────────────────────────────────────── */
/** Full replace */
/** ─── UPDATE NURSE ─────────────────────────────────────────────────────── */
router.put(
    '/:id',
    verifyToken,  // Ensure the user is authenticated
    checkRole(['NURSE', 'HOSPITAL_ADMIN']),  // Ensure the user has the 'NURSE' or 'HOSPITAL_ADMIN' role
    NurseController.updateNurse
  );

/** Partial updates */
/** ─── TOGGLE AVAILABILITY STATUS (NURSE ROLE) ───────────────────────────── */
router.patch(
    '/availability/:id',
    verifyToken,  // Ensure the user is authenticated
    checkRole(['NURSE']),  // Ensure the user has the 'NURSE' role
    NurseController.updateAvailability
  );
// Add or remove leave dates (NURSE role)
/** ─── ADD LEAVE DATE (NURSE ROLE) ─────────────────────────────────────── */
router.patch(
    '/leave/add',
    verifyToken,  // Ensure the user is authenticated
    checkRole(['NURSE']),  // Ensure the user has the 'NURSE' role
    NurseController.addLeaveDate
  );
/** ─── REMOVE LEAVE DATE (NURSE ROLE) ──────────────────────────────────── */
router.patch(
    '/leave/remove',
    verifyToken,  // Ensure the user is authenticated
    checkRole(['NURSE']),  // Ensure the user has the 'NURSE' role
    NurseController.removeLeaveDate
  );
/** ─── ADD SCHEDULE TO NURSE (HOSPITAL_ADMIN OR NURSE ROLE) ───────────────── */
router.patch(
    '/:nurseId/schedule',
    verifyToken,  // Ensure the user is authenticated
    checkRole(['HOSPITAL_ADMIN', 'NURSE']),  // Ensure the user has 'HOSPITAL_ADMIN' or 'NURSE' role
    NurseController.addScheduleToNurse
  );

/** ─── DELETE ─────────────────────────────────────────────────────────────── */
/** ─── DELETE NURSE ──────────────────────────────────────────────────────── */
router.delete(
    '/:id',
    verifyToken,  // Ensure the user is authenticated
    checkRole(['HOSPITAL_ADMIN']),  // Ensure the user has the 'HOSPITAL_ADMIN' role
    NurseController.deleteNurse
  );

export default router;
