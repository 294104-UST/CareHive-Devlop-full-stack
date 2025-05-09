const axios = require('../utils/axiosInstance');

const DOCTOR_SERVICE_URL = 'http://localhost:3000/api/doctor';


exports.getDoctorsByDepartmentAndHospital = async (departmentId, hospitalId, token) => {
  const response = await axios.get(
    `${DOCTOR_SERVICE_URL}/department/${departmentId}?hospitalId=${hospitalId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
