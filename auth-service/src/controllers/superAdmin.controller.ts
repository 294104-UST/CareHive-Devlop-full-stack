import { Request, Response } from 'express';
import Hospital from '../models/hospital.model';
import * as authService from '../services/auth.service'; // existing logic
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import mongoose from 'mongoose';


export const createHospital = async (req: Request, res: Response) => {
  const { name, location, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const hospital = new Hospital({ name, location, description });

  await hospital.save();
  res.status(201).json(hospital); // will include hospital._id
};


export const deleteHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedHospital = await Hospital.findByIdAndDelete(id);
    if (!deletedHospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.status(200).json({ message: 'Hospital deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting hospital:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const updateHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedHospital = await Hospital.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedHospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.status(200).json(updatedHospital);
  } catch (error: any) {
    console.error('Error updating hospital:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getAllHospitalAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await User.find({ role: 'HOSPITAL_ADMIN' }).populate('hospitalId');
    res.status(200).json(admins);
  } catch (error: any) {
    console.error('Error fetching admins:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const deleteAdminById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin || admin.role !== 'HOSPITAL_ADMIN') {
      return res.status(404).json({ message: 'Hospital admin not found' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Hospital admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.status(200).json(hospital);
  } catch (error) {
    console.error('Error fetching hospital by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getHospitals = async (_req: Request, res: Response) => {
  const hospitals = await Hospital.find();
  res.json(hospitals);
};
export const createHospitalAdmin = async (req: Request, res: Response) => {
  const { name, email, password, role, hospitalId } = req.body;

  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (role !== 'HOSPITAL_ADMIN') {
    return res.status(400).json({ message: 'SUPER_ADMIN can only create HOSPITAL_ADMIN users' });
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
    return res.status(400).json({ message: 'Invalid hospitalId format' });
  }

  // Check if the hospital exists
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    return res.status(404).json({ message: 'Hospital not found' });
  }

  // Ensure only one hospital admin per hospital
  const existingAdmin = await User.findOne({ role: 'HOSPITAL_ADMIN', hospitalId });
  if (existingAdmin) {
    return res.status(409).json({ message: 'A hospital admin already exists for this hospital' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await authService.createUser({
    name,
    email,
    password: hashedPassword,
    role,
    hospitalId, // MongoDB ObjectId string
  });

  res.status(201).json(user);
};


