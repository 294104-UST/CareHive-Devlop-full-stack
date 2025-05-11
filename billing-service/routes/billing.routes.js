const express = require('express');
const router = express.Router();
const billingController = require('../controller/billing.controller');

router.post('/', billingController.createBill);
// Add GET, UPDATE, DELETE as needed
// routes/billingRoutes.js
router.get('/', billingController.getAllBills);         // GET all bills
router.get('/:id', billingController.getBillById);      // GET bill by billing ID
router.get('/appointment/:appointmentId', billingController.getBillByAppointment);
router.get('/patient/:patientId', billingController.getBillsByPatient);
router.put('/update-lab-charges', billingController.updateLabCharges);


module.exports = router;
