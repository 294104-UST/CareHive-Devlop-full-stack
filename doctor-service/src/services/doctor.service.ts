import { Doctor } from '../models/doctor.model';
import axios from 'axios';
import bcrypt from 'bcrypt';
import mongoose, { Types } from 'mongoose';
export class DoctorService {
  // doctor.service.ts

  async createDoctor(data: {
    name: string;
    email: string;
    departmentId: string;
    hospitalId: string;
    password: string;
    specialization?: string;
  }) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Save doctor in DB (returns full document)
      const doctor = await Doctor.create({ ...data, password: hashedPassword }) as mongoose.Document;


      // Register in auth-service
      await axios.post(
        `http://localhost:3000/api/auth/register`,
        {
          name: data.name,
          email: data.email,
          password: data.password, // Raw password
          role: 'DOCTOR',
          hospitalId: data.hospitalId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Service-Auth': process.env.SERVICE_AUTH_SECRET || ''
          }
        }
      );

      // Remove password before returning
      const { password, ...doctorData } = doctor.toObject();
      return doctorData;

    } catch (error) {
      console.error('Error creating doctor:', error);

      if (axios.isAxiosError(error)) {
        throw new Error(`Auth service error: ${error.response?.data?.message || error.message}`);
      }

      throw error;
    }
  }

  
  static async getDoctorsByHospital(hospitalId: string) {
    const doctors = await Doctor.find({ hospitalId: new Types.ObjectId(hospitalId) })
      .select('name email specialization departmentId hospitalId available leaveDates scheduledDates')
      .lean(); // Returns plain JS objects
  
    // Fetch department name for each doctor
    const enrichedDoctors = await Promise.all(
      doctors.map(async (doctor) => {
        try {
          const deptResponse = await axios.get(`http://localhost:3000/api/dept/${doctor.departmentId}`);
          const departmentName = deptResponse.data?.name || 'Unknown';
  
          return {
            ...doctor,
            department: {
              name: departmentName
            }
          };
        } catch (err:any) {
          console.error(`Failed to fetch department for ID: ${doctor.departmentId}`, err.message);
          return {
            ...doctor,
            department: {
              name: 'Unavailable'
            }
          };
        }
      })
    );
    console.log(enrichedDoctors);
  
    return enrichedDoctors;
  }





  async getDoctorsByDepartmentAndHospital(departmentId: string, hospitalId: string) {
    return Doctor.find({
      departmentId,
      hospitalId
    })
    .select('name email specialization departmentId hospitalId available leaveDates scheduledDates')
    .populate({
      path: 'departmentId',
      select: 'name',
      model: 'Department'
    });
  }
  
  async getDoctorById(id: string) {
    return Doctor.findById(id);
  }

  async updateDoctor(id: string, updateData: any) {
    return Doctor.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteDoctor(id: string) {
    return Doctor.findByIdAndDelete(id);
  }

  async updateAvailability(doctorId: string, available: boolean) {
    return Doctor.findByIdAndUpdate(doctorId, { available }, { new: true });
  }

  // services/doctor.service.ts

async addLeaveDate(doctorId: string, leaveDate: Date) {
  return Doctor.findByIdAndUpdate(
    doctorId,
    { $addToSet: { leaveDates: leaveDate } },
    { new: true }
  );
}

async removeLeaveDate(doctorId: string, leaveDate: Date) {
  return Doctor.findByIdAndUpdate(
    doctorId,
    { $pull: { leaveDates: leaveDate } },
    { new: true }
  );
}

static async getDoctorByUserId(userId: string) {
  return await Doctor.findById(userId); // or use another identifier if needed
}


static async findAvailableDoctorsForDate(
  hospitalId: string,
  departmentId: string,
  selectedDate: Date
) {
  return Doctor.find({
    hospitalId,
    departmentId,
    leaveDates: { $ne: selectedDate },
  });
}

static async addSchedule(doctorId: string, scheduleId: string) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return null;

  // Ensure scheduleDates is an array
  if (!Array.isArray(doctor.scheduledDates)) {
    doctor.scheduledDates = [];
  }

  const oid = new Types.ObjectId(scheduleId);

  // Check for duplicate
  const alreadyScheduled = doctor.scheduledDates.some(existingId =>
    // existingId is a Types.ObjectId
    existingId.equals(oid)
  );

  if (!alreadyScheduled) {
    doctor.scheduledDates.push(oid);
    return await doctor.save();
  }

  // If it was already present, return the doctor unchanged
  return doctor;
}

}
