import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
//import routes
import authRoutes from './routes/nurse.routes';
import dotenv from 'dotenv';
import { connectDB } from './config/db';


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
app.get('/api/nurse/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Nurse-service' });
});

//Routes
app.use('/api/nurse', authRoutes);


// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  };

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Nurse service running on port ${PORT}`);
});