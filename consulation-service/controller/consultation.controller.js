const Consultation = require('../model/consultation.model');
const labService = require('../serivces/labServices');
const jwt = require('jsonwebtoken');

exports.createConsultation = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, 'supersecretkey');

    if (decoded.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Forbidden: Only doctors can create consultations' });
    }

    const doctorId = decoded.id; 


    //below is already there above is new 
    //const { patientId, appointmentId, doctorId, labTests } = req.body; //og
    const { patientId, appointmentId, labTests } = req.body;

    //const consultation = new Consultation(req.body); //og
    const consultation = new Consultation({
      ...req.body,
      doctorId
    });
    

    await consultation.save();

    // Post to Lab Service
    await labService.createLabRecord({
      patientId,
      appointmentId,
      doctorId,
      labTests
    });

    res.status(201).json(consultation);
  } catch (error) {
    console.error('Create consultation failed:', error.message);
    res.status(400).json({ message: error.message });
  }
};


exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find(); //populate('labTests') .exec();;
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; //original one


// exports.getConsultationById = async (req, res) => {
//   try {
//     const consultation = await Consultation.findById(req.params.id);
//     if (!consultation) return res.status(404).json({ message: 'Not found' });
//     res.status(200).json(consultation);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };  //original one


exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id).lean();

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // If labTests array exists, enrich each test using Lab Service
    if (consultation.labTests && consultation.labTests.length > 0) {
      const enrichedLabTests = [];

      for (const labTestId of consultation.labTests) {
        console.log('Fetching Lab Test for ID:', labTestId);
        const labTestIdStr = labTestId.toString();

        console.log('the string version Lab Test for ID:', labTestIdStr);
        const labTest = await labService.getLabTestById(labTestIdStr); // Axios call to Lab Service
        if (labTest) enrichedLabTests.push(labTest);
      }

      consultation.labTests = enrichedLabTests;
    }

    //res.status(200).json({ consultation });
    res.status(200).json(consultation);

  } catch (error) {
    console.error('Error fetching consultation by ID:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// exports.updateConsultation = async (req, res) => {
//   try {
//     const consultation = await Consultation.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.status(200).json(consultation);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// }; //original one
exports.updateConsultation = async (req, res) => {
  try {
    // Find and update the consultation in the database
    const consultation = await Consultation.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Determine which lab tests have been added or removed
    const labTestsToAdd = req.body.labTests.filter(
      (labTest) => !consultation.labTests.includes(labTest._id)
    );
    const labTestsToRemove = consultation.labTests.filter(
      (labTest) => !req.body.labTests.includes(labTest._id)
    );

    // Add new lab tests to the Lab Service if there are any
    if (labTestsToAdd.length > 0) {
      await labService.createLabRecord({
        patientId: consultation.patientId,
        appointmentId: consultation.appointmentId,
        doctorId: consultation.doctorId,
        labTests: labTestsToAdd
      });
    }

    // Remove lab tests from the Lab Service if there are any
    // if (labTestsToRemove.length > 0) {
    //   await Promise.all(
    //     labTestsToRemove.map((labTest) =>
    //       labService.deleteLabRecord(labTest._id)
    //     )
    //   );
    // }

    // Now update the lab record associated with the consultation's appointment
    await labService.updateLabRecordByAppointmentId(
      consultation.appointmentId, 
      req.body.labTests // Updated lab tests from the consultation
    );

    // Return the updated consultation
    res.status(200).json(consultation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// exports.deleteConsultation = async (req, res) => {
//   try {
//     await Consultation.findByIdAndDelete(req.params.id);
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };// original ones


exports.deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Delete related lab record
    await labService.deleteLabRecordByAppointmentId(consultation.appointmentId);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.getLabTests = async (req, res) => {
  try {
    const tests = await labService.getAvailableLabTests(); // ✅ await here
    res.json(tests);
  } catch (error) {
    console.error('Error fetching lab tests:', error.message);
    res.status(500).json({ error: 'Failed to fetch lab tests' });
  }
};

//get consultations by appoitment id:
exports.getConsultationByAppointmentId = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    console.log('the id passed'+appointmentId)
    const consultation = await Consultation.findOne({ appointmentId: appointmentId });

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};



//get consultations by patient Id:
exports.getConsultationsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    const consultations = await Consultation.find({ patientId });

    res.status(200).json(consultations);
  } catch (error) {
    console.error('Fetch consultations failed:', error.message);
    res.status(500).json({ message: 'Failed to fetch consultations' });
  }
};
