const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const billingRoutes = require('./routes/billing.routes');

const app = express();

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
// Health check endpoint
app.get('/api/billing/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'billing-service' });
});

// Routes
app.use('/api/billing', billingRoutes);

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/billing-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB for billing-service'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Start server
const port = 5009;
app.listen(port, () => {
  console.log(`billing service running on port ${port}`);
});