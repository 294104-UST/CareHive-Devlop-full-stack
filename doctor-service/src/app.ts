import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/doctor.routes';
import cors from 'cors';  // Use ES module import style to match your code
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

dotenv.config();

const app = express();

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions));
// Parse JSON body and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Add a simple health check endpoint to test connectivity
app.get('/api/doctor/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'doctor-service' });
});

// Routes
app.use('/api/doctor', authRoutes);


// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  };

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Doctor service running on port ${PORT}`);
});