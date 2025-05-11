const express = require('express');
const router = express.Router();
const labController = require('../controller/labDetails.controller');
const { verifyToken } = require('../middleware/labMiddleware');
const { checkRole } = require('../middleware/checkRole');


router.post('/', labController.createLab);
router.get('/', labController.getAllLabs);
//newly added ones below:
// In routes/lab.routes.js or similar
router.get('/by-appointment/:appointmentId', labController.getLabByAppointmentId);
router.put('/by-appointment/:appointmentId', labController.updateLabByAppointmentId);
router.delete('/by-appointment/:appointmentId', labController.deleteLabByAppointmentId);
// to get pending details
router.get('/pending', labController.getPendingLabs);
router.get('/:id', labController.getLabById);
router.put('/:id', labController.updateLab);

//upload report
router.post(
    '/upload-report/:appointmentId/:testId',
    labController.upload.single('report'),
    labController.uploadLabReport
  );

module.exports = router;
