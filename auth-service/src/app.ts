import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import cors from 'cors';  // Use ES module import style to match your code
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
app.get('/api/auth/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

// Routes
app.use('/api/auth', authRoutes);


// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  };

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});