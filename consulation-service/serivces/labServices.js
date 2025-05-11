const axios = require('axios');
const qs = require('qs');

const LAB_SERVICE_URL = 'http://localhost:5008/api/labs'; // or from process.env.LAB_SERVICE_URL

exports.getAvailableLabTests = async () => {
  // Assuming lab test options are served from Lab Service
  const res = await axios.get('http://localhost:5008/api/lab-tests');
  return res.data;
};

exports.createLabRecord = async ({ patientId, appointmentId, doctorId, labTests }) => {
  if (!labTests || labTests.length === 0) return;

  const payload = {
    patientId,
    appointmentId,
    orderedBy: doctorId,
    testDetails: labTests.map(testName => ({ testName }))
  };

  await axios.post(LAB_SERVICE_URL, payload);
};

//proer deletion of consultation
exports.deleteLabRecordByAppointmentId = async (appointmentId) => {
  await axios.delete(`${LAB_SERVICE_URL}/by-appointment/${appointmentId}`);
};


exports.getLabTestById = async (id) => {
  try {
    const labTestIdStr = id.toString();
    console.log(`the id from labservice.js: ${labTestIdStr}`)
    console.log(`Making request to: ${LAB_SERVICE_URL}/${labTestIdStr}`);
    const response = await axios.get(`http://localhost:5008/api/lab-tests/${labTestIdStr}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching lab test with ID ${id}:`, error.message);
    return null; // return null so we can filter it later
  }
};



// new additions for update and delete
exports.updateLabRecordByAppointmentId = async (appointmentId, updatedLabTests) => {
  try {
    // Update lab records associated with the appointment ID
    const payload = {
      testDetails: updatedLabTests.map(testName => ({ testName })),
    };

    await axios.put(`${LAB_SERVICE_URL}/by-appointment/${appointmentId}`, payload);
  } catch (error) {
    console.error('Error updating lab record:', error);
    throw new Error('Failed to update lab record');
  }
};


//deletion of corresponding labtest
// exports.deleteLabRecord = async (labTestId) => {
//   try {
//     await axios.delete(`http://localhost:5008/api/lab-tests/${labTestId}`);
//   } catch (error) {
//     console.error(`Failed to delete lab test ${labTestId}:`, error.message);
//   }
// };

