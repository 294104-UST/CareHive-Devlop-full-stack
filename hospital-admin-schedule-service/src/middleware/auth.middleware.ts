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

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      hospitalId: decoded.hospitalId,
    };
    console.log("Decode Jwt"+req.user.hospitalId);

    next();
  } catch (err) {
    res.status(403).json({ message: 'Token invalid' });
    return;
  }
};

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If we already have req.user from verifyToken, no need to verify again
    if (req.user) {
      // Check if the user's role is authorized
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ message: 'Access denied' });
        return; // Return void instead of returning the response
      }
      next();
      return; // Return void
    }

    // Otherwise, verify token and check role
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return; // Return void instead of returning the response
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
        res.status(403).json({ message: 'Access denied' });
        return; // Return void instead of returning the response
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
      return; // Return void instead of returning the response
    }
  };
};