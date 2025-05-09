import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the JWT payload interface
interface JwtPayload {
  id: string;
  role: string;
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

// Define the User interface
interface User {
  id: string;
  role: string;
  hospitalId?: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    // Decode the token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'default_secret'
    ) as JwtPayload;
    
    // Attach user data to the request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      hospitalId: decoded.hospitalId
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalid' });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // If we already have req.user from verifyToken, no need to verify again
    if (req.user) {
      // Check if the user's role is authorized
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      return next();
    }

    // Otherwise, verify token and check role
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'default_secret'
      ) as JwtPayload;

      // Attach decoded user data to request object
      req.user = {
        id: decoded.id,
        role: decoded.role,
        hospitalId: decoded.hospitalId
      };

      // Check if the user's role is authorized
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};