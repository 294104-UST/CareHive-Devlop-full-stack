import { Request, Response } from 'express';
import { DoctorService } from '../services/doctor.service';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { Document } from 'mongoose';
import { Doctor } from '../models/doctor.model';

const doctorService = new DoctorService();

interface PopulatedDoctor extends Document {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  departmentId: {
    _id: string;
    name: string;
  };
  hospitalId: string;
  available: boolean;
  leaveDates: Date[];
  scheduledDates: string[];
}

export class DoctorController {
  // Create doctor (already implemented)
  static async createDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, departmentId, password } = req.body;
      const user = req.user as { id: string; role: string; hospitalId: string };
  
      // Validate required fields
      if (!name || !email || !departmentId || !password) {
        res.status(400).json({ message: 'All fields are required: name, email, departmentId, password' });
        return;
      }
  
      // Authorization check
      if (user.role !== 'HOSPITAL_ADMIN') {
        res.status(403).json({ message: 'Only Hospital Admins can create doctors' });
        return;
      }
  
      if (!user.hospitalId) {
        res.status(400).json({ message: 'Missing hospital ID in token' });
        return;
      }
  
      // ✅ Department validation
      try {
        const response = await axios.get(`http://localhost:3000/api/dept/${departmentId}`, {
          headers: {
            Authorization: req.headers.authorization || ''
          }
        });
  
        if (!response.data || response.status !== 200) {
          res.status(404).json({ message: 'Department not found' });
          return;
        }
      } catch (err: any) {
        console.error('Department validation error:', err.message || err);
        res.status(502).json({
          message: 'Failed to validate department',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
        return;
      }
  
      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // ✅ Create doctor in local DB
      const newDoctor = await doctorService.createDoctor({
        name,
        email,
        departmentId,
        hospitalId: user.hospitalId,
        password: hashedPassword,
      });
  
      // ✅ Register with auth-service
      try {
        await axios.post(
          `http://localhost:3000/api/auth/register`,
          {
            name,
            email,
            password,
            role: 'DOCTOR',
            hospitalId: user.hospitalId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Service-Auth': process.env.SERVICE_AUTH_SECRET || '', // Make sure this is set
            },
          }
        );
      } catch (authError: any) {
        console.error('Auth-service registration failed:', authError.message);
        res.status(500).json({
          message: 'Failed to register doctor in auth-service',
          error: process.env.NODE_ENV === 'development' ? authError.message : undefined,
        });
        return;
      }
  
      // ✅ Omit password in response
      const { password: _, ...doctorData } = newDoctor.toObject();
  
      res.status(201).json(doctorData);
  
    } catch (error: any) {
      console.error('Error creating doctor:', error);
  
      if (error.code === 11000 || error.message.includes('duplicate')) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }
  
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
  
  

  // Get all doctors by hospitalId
  static async getDoctorsByHospitalId(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId } = req.params;
  
      // ✅ Use the class name to call the static method
      const doctors = await DoctorService.getDoctorsByHospital(hospitalId);
  
      const transformedDoctors = doctors.map((doctor: any) => ({
        _id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        departmentId: doctor.departmentId._id.toString(),
        department:  doctor.department.name,
        hospitalId: doctor.hospitalId.toString(),
        available: doctor.available,
        leaveDates: doctor.leaveDates,
        scheduledDates: doctor.scheduledDates
      }));
      console.log(transformedDoctors);
  
      res.status(200).json(transformedDoctors);
    } catch (error) {
      console.error('Error fetching doctors by hospital ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all doctors by departmentId and hospital id for patients
 // src/controllers/doctor.controller.ts

static async getDoctorsByDepartment(req: Request, res: Response): Promise<void> {
  try {
    const { departmentId } = req.params;
    const { hospitalId } = req.query;

    if (!hospitalId || typeof hospitalId !== 'string') {
      res.status(400).json({ message: 'Hospital ID is required as a query parameter' });
      return;
    }

    const doctors = await doctorService.getDoctorsByDepartmentAndHospital(departmentId, hospitalId);
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors by department and hospital:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


  // Get doctor by ID
  static async getDoctorById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const doctor = await doctorService.getDoctorById(id);

      if (!doctor) {
        res.status(404).json({ message: 'Doctor not found' });
        return;
      }

      res.status(200).json(doctor);
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update doctor information
  static async updateDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, departmentId } = req.body;

      const updatedDoctor = await doctorService.updateDoctor(id, { name, email, departmentId });

      if (!updatedDoctor) {
        res.status(404).json({ message: 'Doctor not found' });
        return;
      }

      res.status(200).json(updatedDoctor);
    } catch (error) {
      console.error('Error updating doctor:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete doctor
  static async deleteDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deletedDoctor = await doctorService.deleteDoctor(id);

      if (!deletedDoctor) {
        res.status(404).json({ message: 'Doctor not found' });
        return;
      }

      res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  //update the availability
  // controllers/doctor.controller.ts
static async updateAvailability(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      res.status(400).json({ message: 'available must be a boolean' });
      return;
    }

    const updatedDoctor = await doctorService.updateAvailability(id, available);
    if (!updatedDoctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


// controllers/doctor.controller.ts

static async addLeaveDate(req: Request, res: Response): Promise<void> {
  try {
    
    const { leaveDates } = req.body;
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const id = req.user.id;
    if (!leaveDates) {
      res.status(400).json({ message: 'leaveDate is required' });
      return;
    }
    
    const updatedDoctor = await doctorService.addLeaveDate(id, new Date(leaveDates));
    if (!updatedDoctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error('Error adding leave date:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

static async removeLeaveDate(req: Request, res: Response): Promise<void> {
  try {
    
    const { leaveDate } = req.body;
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const id = req.user.id;

    if (!leaveDate) {
      res.status(400).json({ message: 'leaveDate is required' });
      return;
    }

    const updatedDoctor = await doctorService.removeLeaveDate(id, new Date(leaveDate));
    if (!updatedDoctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error('Error removing leave date:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

static async getOwnProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as { id: string; role: string };

    if (user.role !== 'DOCTOR') {
      res.status(403).json({ message: 'Only doctors can access this route' });
      return;
    }

    const doctor = await doctorService.getDoctorById(user.id);
    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


static async getScheduledDates(req: Request, res: Response): Promise<void> {
  try {
    // 1) Verify doctor exists
    const user = req.user as { id: string; role: string };
    const doctor = await DoctorService.getDoctorByUserId(user.id);
    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    // 2) Forward JWT and fetch full schedule objects
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Missing auth token' });
      return;
    }

    const scheduleRes = await axios.get(
      `http://localhost:3000/api/scheduling/user/${doctor._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 3) Respond with the array of schedule objects
    res.status(200).json(scheduleRes.data);
  } catch (err: any) {
    console.error('Error fetching schedules:', err);
    if (err.response) {
      // Bubble up schedule-service HTTP errors
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

static async getAvailableDoctorsForScheduling(req:Request, res: Response): Promise<void> {
  try {
    const { departmentId, date } = req.query;

    if (!req.user?.hospitalId) {
      res.status(400).json({ message: 'Hospital ID missing in token' });
      return;
    }

    if (!departmentId || !date) {
      res.status(400).json({ message: 'Missing departmentId or date in query' });
      return;
    }

    const availableDoctors = await DoctorService.findAvailableDoctorsForDate(
      req.user.hospitalId,
      departmentId as string,
      new Date(date as string)
    );
    

    res.status(200).json(availableDoctors);
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

static async getDoctorByEmail(req:Request, res: Response): Promise<void> {
  console.log("requested email id"+req.params.email);
  const doctor = await Doctor.findOne({ email: req.params.email });
  if (!doctor){
     res.status(404).json({ message: 'Doctor not found' });
     return ;
  }
  res.json(doctor);
}

// doctor.controller.ts
static async addScheduleToDoctor(req: Request, res: Response) {
  try {
    const { doctorId } = req.params;
    const { scheduleId } = req.body;

    const updated = await DoctorService.addSchedule(doctorId, scheduleId);
    if (!updated) {
      res.status(404).json({ message: 'Doctor not found' });
      return ;
    }

    res.json(updated);
  } catch (err) {
    console.error('Error in DoctorController.addScheduleToDoctor', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
  
}
