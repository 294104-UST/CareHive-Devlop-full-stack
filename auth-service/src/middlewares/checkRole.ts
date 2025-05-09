// src/middleware/checkRole.ts
import { Request, Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { role: string }; // safely assert the type

    console.log("✅ Role check for:", user?.role);
    console.log("Allowed roles:", allowedRoles);

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
