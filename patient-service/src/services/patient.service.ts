import Patient from '../models/patient.model';
import bcrypt from 'bcryptjs';

export class PatientService {
  static async createPatient(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    dob?: Date;
  }) {
    const { name, email, password, phone, gender, dob } = data;

    // Check if email already exists
    const existing = await Patient.findOne({ email });
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const patient = new Patient({
      name,
      email,
      passwordHash,
      phone,
      gender,
      dob
    });

    return await patient.save();
  }
}
