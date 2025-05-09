import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role, hospitalId } = req.body;

  // Ensure the password is not undefined or empty
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required and must be a string.' });
  }

  try {
    // Hash the password with a salt rounds value (e.g., 10)
    const isAlreadyHashed = /^\$2[aby]\$\d+\$/.test(password);
    
    const hashedPassword = isAlreadyHashed 
      ? password // Use as-is if already hashed
      : await bcrypt.hash(password, 10); // Hash if plain text

    console.log('Password handling:', {
      isAlreadyHashed,
      storedPassword: hashedPassword
    });

    // Now, create the user in the database...
    // Example:
    const user = new User({ name, email, password: hashedPassword, role, hospitalId });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in registration:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  
export const loginUser = async (req: Request, res: Response) => {
    try {
      const { token } = await authService.login(req.body.email, req.body.password);
      res.json({ token });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid login';
      res.status(401).json({ message });
    }
  };
  

export const getMe = (req: Request, res: Response) => {
  res.json((req as any).user);
};
