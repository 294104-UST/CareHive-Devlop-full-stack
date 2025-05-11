// utils/services.js
const axios = require('axios');

const BASE_URLS = {
  hospitalService: 'http://localhost:3001/api/hospitals', // adjust actual ports/paths
  consultationService: 'http://localhost:5006/api/consultations',
  labTestService: 'http://localhost:5008/api/lab-tests',
  appointmentService: 'http://localhost:3004/api/appointment', // update port if needed
  labService: 'http://localhost:5008/api/labs'

};

async function getConsultationFee(hospitalId) {
  try {
    const response = await axios.get(`${BASE_URLS.hospitalService}/${hospitalId}`);
    return response.data.consultationFee; // adjust based on actual hospital API response
  } catch (err) {
    console.error('Error fetching consultation fee:', err.message);
    return 500; // fallback default
  }
}

async function getConsultationByAppointment(appointmentId) {
  try {
    console.log(`url for consulation: ${BASE_URLS.consultationService}/appointment/${appointmentId}`)
    const response = await axios.get(`${BASE_URLS.consultationService}/appointment/${appointmentId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching consultation:', err.message);
    return null;
  }
}

async function getLabTestsByIds(labTestIds) {
  try {
    console.log('labtest ids : '+labTestIds)
    console.log(`the url for lab: ${BASE_URLS.labTestService}/by-ids`)
    const response = await axios.post(`${BASE_URLS.labTestService}/by-ids`, { ids: labTestIds });
    return response.data;
  } catch (err) {
    console.error('Error fetching lab tests:', err.message);
    return [];
  }
}

async function getAppointment(appointmentId){
  try {
    console.log('appointment id passed : '+appointmentId)
    console.log(`the url for appointment: ${BASE_URLS.appointmentService}/appointments/${appointmentId}`)
    const response = await axios.get(`${BASE_URLS.appointmentService}/appointments/${appointmentId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching appointment:', err.message);
    return [];
  }
};

//get labs by appointmentId:
async function getLabByAppointment(appointmentId) {
  try {
    console.log(`Calling lab service for appointment ID: ${appointmentId}`);
    const response = await axios.get(`${BASE_URLS.labService}/by-appointment/${appointmentId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching lab record by appointment:', err.message);
    return null;
  }
}



module.exports = {
  getConsultationFee,
  getConsultationByAppointment,
  getLabTestsByIds,
  getAppointment,
  getLabByAppointment
};
