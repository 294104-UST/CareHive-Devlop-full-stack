import express from 'express';
import { PatientAuthController } from '../controllers/patient.controller';

const router = express.Router();

router.post('/login', PatientAuthController.login);
router.post('/register', PatientAuthController.register);


export default router;
