import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the JWT payload interface
interface JwtPayload {
  id: string;
  role: string;
  email: string;
  hospitalId?: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// User object stored in req.user
interface User {
  id: string;
  role: string;
  email: string;
  hospitalId?: string;
}

/**
 * Verifies the JWT and attaches user info to req.user
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      hospitalId: decoded.hospitalId
    };

    next();
  } catch (err) {
    res.status(403).json({ message: 'Token invalid' });
  }
};

/**
 * Middleware to restrict access to specified roles
 */
export const allowRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied: Insufficient role' });
      return;
    }

    next();
  };
};
