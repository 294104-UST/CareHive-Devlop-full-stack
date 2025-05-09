import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
// import { authorize } from './middleware/authMiddleware';

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

//For auth service 
app.use('/api/auth', (req, res, next) => {
  console.log(`[API Gateway] Incoming Request to /api/auth: ${req.method}`);
  next();
});

app.use(
  '/api/auth',
  createProxyMiddleware({ 
    target: 'http://localhost:3001/api/auth', 
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/auth'
    }
  })
);

//for doctor service 
app.use('/api/doctor', (req, res, next) => {
  console.log(`[API Gateway] Incoming Request to /api/doctor: ${req.method}`);
  next();
});
app.use(
  '/api/doctor',
  createProxyMiddleware({ target: 'http://localhost:3002/api/doctor', changeOrigin: true})
);

//for department service 
app.use('/api/dept', (req, res, next) => {
  console.log(`[API Gateway] Incoming Request to /api/dept: ${req.method}`);
  next();
});
app.use(
  '/api/dept',
  createProxyMiddleware({ target: 'http://localhost:3003/api/dept', changeOrigin: true})
);

//for appointment service 
app.use('/api/appointment', (req, res, next) => {
  console.log(`[API Gateway] Incoming Request to /api/appointment: ${req.method}`);
  next();
});
app.use(
  '/api/appointment',
  createProxyMiddleware({ target: 'http://localhost:3004/api/appointment', changeOrigin: true})
);

//for hospital-admin-scheduling-service
app.use('/api/scheduling', (req, res, next) => {
  console.log(`[API Gateway] Incoming Request to /api/scheduling: ${req.method}`);
  next();
});
app.use(
  '/api/scheduling',
  createProxyMiddleware({ target: 'http://localhost:3005/api/scheduling', changeOrigin: true})
);

//for patient-service
app.use('/api/patient', (req, res, next) => {
  console.log(`[API Gateway] Incoming Request to /api/patient: ${req.method}`);
  next();
});
app.use(
  '/api/patient',
  createProxyMiddleware({ 
    target: 'http://localhost:3006/api/patient', 
    changeOrigin: true,
    pathRewrite: {
      '^/api/patient': '/api/patient'
    }
  })
);


//for the nurse service 
app.use('/api/nurse', (req, res, next) => {
  console.log(`[API Gateway] Incoming Request to /api/nurse: ${req.method}`);
  next();
});
app.use(
  '/api/nurse',
  createProxyMiddleware({ target: 'http://localhost:3007/api/nurse', changeOrigin: true})
);





app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});