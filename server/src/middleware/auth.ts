import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { AdminUser, UserRole } from '../models/AdminUser.js';

// Initialize Firebase Admin if project ID is provided and not already initialized
if (getApps().length === 0 && process.env.FIREBASE_PROJECT_ID) {
  try {
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
  } catch (err) {
    console.warn('Firebase Admin initialization warning:', err);
  }
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
  role?: UserRole | string;
  isDemo?: boolean;
  isProtected?: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No Bearer token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // 1. Try Firebase ID Token verification if Firebase apps are active
  if (getApps().length > 0) {
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      let role: UserRole = 'Staff';

      // Check DB for existing role mapping
      const dbUser = await AdminUser.findOne({
        $or: [
          { firebaseUid: decodedToken.uid },
          ...(decodedToken.email ? [{ email: decodedToken.email.toLowerCase() }] : []),
        ],
      });

      if (dbUser) {
        role = dbUser.role;
      }

      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0],
        role,
        isDemo: dbUser?.isDemo || false,
        isProtected: dbUser?.isProtected || false,
      };
      next();
      return;
    } catch {
      // Not a valid Firebase ID token; fall through to custom JWT verification
    }
  }

  // 2. Custom JWT verification
  try {
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_cafe_jwt_key_2026_dev';
    const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
      return;
    }

    next();
  };
};
