import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
//import routes
import authRoutes from './routes/auth.routes';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import appRoutes from './routes/appointment.routes';


import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';


dotenv.config();

const app = express();

// Apply CORS middleware before other middleware
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }
 app.use(cors(corsOptions))
// Parse JSON body and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Add a simple health check endpoint to test connectivity
app.get('/api/patient/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'patient-service' });
});

//Routes
app.use('/api/patient', authRoutes);
app.use('/api/patient', appRoutes);




// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  };

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Patient service running on port ${PORT}`);
});