// controllers/billingController.js
const Billing = require('../model/billing.model');

const {
    getConsultationFee,
    getConsultationByAppointment,
    getLabTestsByIds,
    getAppointment,
    getLabByAppointment
  } = require('../services');
  
// Assume we fetch consultationFee from hospital service or a config for now

// exports.createBill = async (req, res) => {
//   try {
//     const { appointmentId } = req.body;

//      const appointment = await getAppointment(appointmentId);
//      console.log('apponitment for consultation is : '+appointment)
//     if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
//     console.log('apponitment is : '+appointmentId)
//     const consultation = await getConsultationByAppointment(appointmentId);
//     if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

//     // Dummy consultation fee (you can replace this with an API call to hospital service)
//     const consultationFee = 500;

//     let labTests = [];
//     let totalLabCost = 0;

//     if (consultation.labTests.length > 0) {
//       console.log('the labtest ids:'+consultation.labTests)
//       const tests = await getLabTestsByIds(consultation.labTests || []);//.find({ _id: { $in: consultation.labTests } });

//       labTests = tests.map(test =>
//          ({
//         labTestId: test._id,
//         testName: test.name,
//         cost: test.cost || 0
//       }));

//       totalLabCost = tests.reduce((sum, test) => sum + (test.cost || 0), 0);
//     }

//     const totalAmount = consultationFee + totalLabCost;

//     const billing = new Billing({
//       patientId: appointment.patientId,
//       appointmentId: appointment._id,
//       hospitalId: appointment.hospitalId,
//       consultationFee,
//       labTests,
//       totalAmount
//     });

//     await billing.save();
//     res.status(201).json(billing);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating bill' });
//   }
// };original one

exports.createBill = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await getAppointment(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const consultation = await getConsultationByAppointment(appointmentId);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

    // ✅ Step 1: Fetch lab record by appointment
    const labRecord = await getLabByAppointment(appointmentId);
    if (!labRecord) return res.status(404).json({ message: 'Lab record not found' });

    // ✅ Step 2: Check for incomplete lab tests
    const pendingTests = labRecord.testDetails
      .filter(test => test.status !== 'completed')
      .map(test => ({
        testId: test.testName,
        name: test.testName // Optional: resolve actual test name from master list
      }));

    if (pendingTests.length > 0) {
      return res.status(400).json({
        message: 'Billing cannot be created. Some lab tests are not yet completed.',
        pendingTests
      });
    }

    // ✅ Proceed with billing
    const consultationFee = 500;
    let labTests = [];
    let totalLabCost = 0;

    if (consultation.labTests.length > 0) {
      const tests = await getLabTestsByIds(consultation.labTests);

      labTests = tests.map(test => ({
        labTestId: test._id,
        testName: test.name,
        cost: test.cost || 0
      }));

      totalLabCost = tests.reduce((sum, test) => sum + (test.cost || 0), 0);
    }

    const totalAmount = consultationFee + totalLabCost;

    const billing = new Billing({
      patientId: appointment.patientId,
      appointmentId: appointment._id,
      hospitalId: appointment.hospitalId,
      consultationFee,
      labTests,
      totalAmount
    });

    await billing.save();
    res.status(201).json(billing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating bill' });
  }
};



// to update the bill based on labtests change
exports.updateLabCharges = async (req, res) => {
    try {
      const { appointmentId } = req.body;
      console.log('the appointment:'+appointmentId)
      const billing = await Billing.findOne({ appointmentId });
      console.log('the bill:'+billing)
      if (!billing) return res.status(404).json({ message: 'Billing record not found' });
  
      const consultation = await getConsultationByAppointment(appointmentId);
      if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
  
      // Find new lab tests not already in billing
      const existingTestIds = billing.labTests.map(t => t.labTestId.toString());
      console.log('the existing bill:'+existingTestIds)
      const newLabTestIds = consultation.labTests.filter(
        testId => !existingTestIds.includes(testId.toString())
      );
  
      if (newLabTestIds.length === 0) {
        return res.status(200).json({ message: 'No new lab tests to add', billing });
      }
  
      const newTests = await getLabTestsByIds(newLabTestIds);
  
      const newLabTestsFormatted = newTests.map(test => ({
        labTestId: test._id,
        testName: test.name,
        cost: test.cost || 0
      }));
  
      billing.labTests.push(...newLabTestsFormatted);
  
      const newLabTotal = newTests.reduce((sum, test) => sum + (test.cost || 0), 0);
      billing.totalAmount += newLabTotal;
      billing.updatedAt = new Date();
  
      await billing.save();
      res.status(200).json({ message: 'Billing updated with new lab tests', billing });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating bill' });
    }
  };
  



 
  //bill by appointment id
exports.getBillByAppointment = async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const billing = await Billing.findOne({ appointmentId });
      if (!billing) return res.status(404).json({ message: 'No bill found' });
      res.json(billing);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  //get bill by patient id
  exports.getBillsByPatient = async (req, res) => {
    try {
      const { patientId } = req.params;
      const bills = await Billing.find({ patientId });
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  // Get bill by billing ID
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Billing.findById(id);
    if (!bill) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.status(200).json(bill);
  } catch (error) {
    console.error('Error getting bill by ID:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find();
    res.status(200).json(bills);
  } catch (error) {
    console.error('Error getting all bills:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

