import express from 'express';
import { loginUser, registerUser, getMe } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { createHospital, createHospitalAdmin, deleteAdminById, deleteHospitalById, getAllHospitalAdmins, getHospitalById, getHospitals, updateHospitalById } from '../controllers/superAdmin.controller';
import { checkRole } from '../middlewares/checkRole';
const router = express.Router();

// Log incoming requests for the auth-service
router.post('/register', (req, res, next) => {
    console.log('[auth-service] Incoming request:', req.body);
    next();
  }, registerUser);  // Ensure this controller exists
router.post('/login', loginUser);
router.get('/me', verifyToken, getMe);//testing

//super admin functinalites
router.post('/hospitals',verifyToken, checkRole(['SUPER_ADMIN']) ,createHospital);    // Create hospital
router.get('/hospitals',getHospitals);       // List all hospitals
router.post('/create-admin',verifyToken,checkRole(['SUPER_ADMIN']),createHospitalAdmin);//super admins can only create admins for each hospital
router.delete('/hospitals/:id',verifyToken,checkRole(['SUPER_ADMIN']) ,deleteHospitalById);
router.put('/hospitals/:id',verifyToken,checkRole(['SUPER_ADMIN']) ,updateHospitalById);
router.get('/admins',verifyToken,checkRole(['SUPER_ADMIN']), getAllHospitalAdmins);

router.get('/hospitals/:id', verifyToken, checkRole(['SUPER_ADMIN', 'HOSPITAL_ADMIN']), getHospitalById);

router.delete('/admins/:id', verifyToken,checkRole(['SUPER_ADMIN']), deleteAdminById);
export default router;
