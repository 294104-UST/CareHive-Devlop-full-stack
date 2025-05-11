const Lab = require('../model/labDetails.model');
//for multer:
const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });
exports.upload = upload;

// Create
exports.createLab = async (req, res) => {
  try {
    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json(lab);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all
exports.getAllLabs = async (req, res) => {
  try {
    //const labs = await Lab.find();   //original
    const labs = await Lab.find().populate('testDetails.testName');
    res.json(labs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get by ID
exports.getLabById = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id).populate('testDetails.testName');;
    if (!lab) return res.status(404).json({ message: 'Lab not found' });
    res.json(lab);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateLab = async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lab) return res.status(404).json({ message: 'Lab not found' });
    res.json(lab);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteLab = async (req, res) => {
  try {
    const lab = await Lab.findByIdAndDelete(req.params.id);
    if (!lab) return res.status(404).json({ message: 'Lab not found' });
    res.json({ message: 'Lab deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateLabByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const lab = await Lab.findOneAndUpdate(
      { appointmentId },
      { $set: { testDetails: req.body.testDetails } },
      { new: true }
    );

    if (!lab) {
      return res.status(404).json({ message: 'Lab record not found for this appointment' });
    }

    res.json(lab);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteLabByAppointmentId = async (req, res) => {
  try {
    const deleted = await Lab.findOneAndDelete({ appointmentId: req.params.appointmentId });
    if (!deleted) return res.status(404).json({ message: 'Lab not found' });
    res.json({ message: 'Lab deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//get pending labdetails:
// Get all labs with status 'pending'
exports.getPendingLabs = async (req, res) => {
  try {
    const pendingLabs = await Lab.find({ 'testDetails.status': 'pending' }).populate('testDetails.testName');
    res.json(pendingLabs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//upload lab report:
exports.uploadLabReport = async (req, res) => {
  try {
    const { appointmentId, testId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const lab = await Lab.findOne({ appointmentId });
    if (!lab) {
      return res.status(404).json({ message: 'Lab record not found' });
    }

    const test = lab.testDetails.find(detail => detail._id.toString() === testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found in lab record' });
    }

    test.report = req.file.path;
    test.status = 'completed';

    await lab.save();

    res.status(200).json({ message: 'Report uploaded successfully', test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//get by appointmentID;
// Get lab record by appointmentId
exports.getLabByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const lab = await Lab.findOne({ appointmentId }).populate('testDetails.testName');
    if (!lab) {
      return res.status(404).json({ message: 'Lab record not found for this appointment' });
    }
    res.status(200).json(lab);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

