const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const labDetailsRoutes = require('./routes/labDetails.routes');
const labTestRoutes = require('./routes/labTest.routes');
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};



const app = express();

// Middleware
app.use(bodyParser.json());
//app.use(cors());
app.use(cors(corsOptions));


// Routes
app.use('/api/labs', labDetailsRoutes);
app.use('/api/lab-tests', labTestRoutes);

mongoose.connect('mongodb://127.0.0.1:27017/lab-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


// Start the server
const port =  5008; //process.env.PORT ||
app.listen(port, () => {
  console.log(`Consultation service running on port ${port}`);
});
