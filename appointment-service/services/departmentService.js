
const axios = require('../utils/axiosInstance');



exports.getDepartmentsByHospital = async (token) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/dept/get-dept`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Department service error:', error.response?.data || error.message);
    throw new Error('Failed to fetch departments');
  }
};
