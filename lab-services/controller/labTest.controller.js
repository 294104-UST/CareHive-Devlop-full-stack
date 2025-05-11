const LabTest = require('../model/labTest');

// Create a new test
exports.createLabTest = async (req, res) => {
  try {
    const test = new LabTest(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all active tests
exports.getActiveLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find({ isActive: true });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get by id
exports.getActiveLabTestsById = async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (Optional) Update test
exports.updateLabTest = async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// (Optional) Delete test
exports.deleteLabTest = async (req, res) => {
  try {
    await LabTest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lab test deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//get labtest ids
// labcontroller.js in Lab Service
exports.getLabTestsByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty ID list provided.' });
    }

    const labTests = await LabTest.find({ _id: { $in: ids }, isActive: true });

    res.status(200).json(labTests);
  } catch (error) {
    console.error('Error fetching lab tests by IDs:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};



