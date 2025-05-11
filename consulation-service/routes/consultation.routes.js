const express = require('express');
const router = express.Router();
const consultationController = require('../controller/consultation.controller');
const { verifyToken } = require('../middleware/consultationMiddleware');
const { checkRole } = require('../middleware/checkRole');
//for lab test
router.get('/labtests', consultationController.getLabTests);
router.post('/',verifyToken,
    checkRole(['DOCTOR']),consultationController.createConsultation);
router.get('/', verifyToken,
    checkRole(['DOCTOR','PATIENT','NURSE']),consultationController.getAllConsultations);
router.get('/:id',verifyToken,
    checkRole(['DOCTOR','PATIENT','NURSE']), consultationController.getConsultationById);
router.put('/:id', consultationController.updateConsultation);
router.delete('/:id', verifyToken,
    checkRole(['DOCTOR']),consultationController.deleteConsultation);

router.get('/appointment/:appointmentId', consultationController.getConsultationByAppointmentId);


//get all by patient id:
router.get('/patient/:patientId', consultationController.getConsultationsByPatientId);
module.exports = router;
