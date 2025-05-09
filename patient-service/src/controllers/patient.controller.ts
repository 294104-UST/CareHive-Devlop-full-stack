import { Request, Response } from 'express';
import Patient from '../models/patient.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PatientService } from '../services/patient.service';

export class PatientAuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // 1. Find patient
      const patient = await Patient.findOne({ email });
      if (!patient) {
        res.status(404).json({ message: 'Patient not found' });
        return;
      }

      // 2. Compare password
      const isMatch = await bcrypt.compare(password, patient.passwordHash);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // 3. Generate JWT
      const token = jwt.sign(
        {
          id: patient._id,
          role: 'PATIENT',
          email: patient.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // 4. Send response
      res.status(200).json({
        token,
        patient: {
          id: patient._id,
          name: patient.name,
          email: patient.email
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }


  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone, gender, dob } = req.body;

      const patient = await PatientService.createPatient({
        name,
        email,
        password,
        phone,
        gender,
        dob
      });

      res.status(201).json({
        message: 'Patient registered successfully',
        patient: {
          id: patient._id,
          name: patient.name,
          email: patient.email
        }
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  }
}
