
const axios = require('../utils/axiosInstance');

const HOSPITAL_SERVICE_URL = 'http://localhost:3000/api/auth'; // replace with actual hospital service URL

exports.getHospitals = async () => {
  const response = await axios.get(`${HOSPITAL_SERVICE_URL}/hospitals`);
  return response.data;
};