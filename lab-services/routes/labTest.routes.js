const express = require('express');
const router = express.Router();
const labTestController = require('../controller/labTest.controller');
const { verifyToken } = require('../middleware/labMiddleware');
const { checkRole } = require('../middleware/checkRole');
//new one:

router.post('/by-ids', labTestController.getLabTestsByIds);
router.post('/', verifyToken,
    checkRole(['HOSPITAL_ADMIN']),labTestController.createLabTest);
router.get('/', labTestController.getActiveLabTests);
router.get('/:id', labTestController.getActiveLabTestsById);
router.put('/:id', verifyToken,
    checkRole(['HOSPITAL_ADMIN']),labTestController.updateLabTest);
router.delete('/:id',verifyToken,
    checkRole(['HOSPITAL_ADMIN']), labTestController.deleteLabTest);

module.exports = router;
