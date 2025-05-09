const express = require('express');
const router = express.Router();
const appointmentController = require('../controller/appointment.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const { verify } = require('crypto');

// Route for booking an appointment
//router.post('/appointments', appointmentController.bookAppointment);

// Route for fetching available departments of a hospital
router.get('/departments',verifyToken, appointmentController.getAvailableDepartments);

// Route for fetching available doctors of a department
router.get('/doctors/:departmentId', appointmentController.getDoctorsByDepartment);

// Create an appointment (already added)
router.post(
    '/book',
    verifyToken,
    authorizeRoles('PATIENT'), // can be more like ('DOCTOR', 'PATIENT')
    appointmentController.bookAppointment
  );
// Get all appointments
router.get('/appointments', appointmentController.getAllAppointments);

// Get appointment by ID
router.get('/appointments/:id',verifyToken,authorizeRoles(['PATIENT']), appointmentController.getAppointmentById);

// Update appointment
router.put('/appointments/:id', appointmentController.updateAppointment);

// Delete appointment
router.delete('/appointments/:id', appointmentController.deleteAppointment);



router.get('/patient/:patientId', verifyToken, authorizeRoles('PATIENT'), appointmentController.getAppointmentsByPatientId);


//get hospitals
router.get('/hospitals',appointmentController.getHospitals);

//get all depts:
router.get('/departments', appointmentController.getAllDepts);

//get all doctors
router.get('/doctors', appointmentController.getAllDoctors);

//get appointments by doctorID--- called from doctor service
router.get('/appointments/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);


module.exports = router;