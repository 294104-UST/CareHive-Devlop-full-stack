const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointment.routes');

const app = express();

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/appointment/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'appointment-service' });
});

// Routes
app.use('/api/appointment', appointmentRoutes);

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/appointment-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB for appointment-service'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Start server
const port = 3004;
app.listen(port, () => {
  console.log(`Appointment service running on port ${port}`);
});