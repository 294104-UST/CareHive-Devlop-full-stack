const axios = require('axios');

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = axiosInstance;
