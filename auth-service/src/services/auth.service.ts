import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import axios from 'axios';
interface Doctor {
  _id: string;
  name: string;
  email: string;
  departmentId: string;
  hospitalId: string;
  // add other fields if needed
}


export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  let userId = user._id.toString();

  // ✅ If the user is a doctor, get the doctor._id from doctor service
  if (user.role === 'DOCTOR') {
    try {
      const doctorResponse = await axios.get<Doctor>(`http://localhost:3000/api/doctor/by-email/${email}`);
      const doctor = doctorResponse.data;
      console.log(doctor+"doctor fetched details");
      if (!doctor || !doctor._id) {
        throw new Error('Doctor profile not found');
      }

      userId = doctor._id; // ✅ Use the doctor DB _id
    } catch (error:any) {
      console.error('Error fetching doctor by email:', error.message);
      throw new Error('Doctor lookup failed');
    }
  }
  // ✅ If the user is a nurse, get the nurse._id from nurse service
if (user.role === 'NURSE') {
  try {
    const nurseResponse = await axios.get<Doctor>(`http://localhost:3000/api/nurse/by-email/${email}`);
    const nurse = nurseResponse.data;
    console.log('nurse fetched details:', nurse);
    if (!nurse || !nurse._id) {
      throw new Error('Nurse profile not found');
    }
    userId = nurse._id; // ✅ Use the nurse DB _id
  } catch (error: any) {
    console.error('Error fetching nurse by email:', error.message);
    throw new Error('Nurse lookup failed');
  }
}

  // Sign JWT with doctor._id or fallback user._id
  const token = jwt.sign(
    {
      id: userId,
      role: user.role,
      hospitalId: user.hospitalId?.toString(), // handle SUPER_ADMIN case
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );


  return { token };
};


export const createUser = async (data: any) => {
  return await User.create(data);
};


export const register = async (data: any) => {
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, password: hashed });
  return user;
};
