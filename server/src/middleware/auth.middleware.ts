import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AuthService } from '../services/auth.service.js';

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. No token provided.'
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    res.status(401).json({
      success: false,
      error: 'Invalid Authorization header format. Expected "Bearer <token>".'
    });
    return;
  }

  const token = parts[1];

  try {
    const payload = AuthService.verifyToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name
    };
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.name === 'TokenExpiredError' 
        ? 'Authentication token has expired. Please log in again.' 
        : 'Invalid authentication token.'
    });
  }
}

export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      try {
        const payload = AuthService.verifyToken(parts[1]);
        req.user = {
          id: payload.userId,
          email: payload.email,
          name: payload.name
        };
      } catch {
        // Token invalid, ignore for optional auth
      }
    }
  }

  next();
}
