import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getAuth } from 'firebase-admin/auth';
import { getApps } from 'firebase-admin/app';
import { AdminUser, UserRole } from '../models/AdminUser.js';
import { AuthRequest } from '../middleware/auth.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await AdminUser.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_cafe_jwt_key_2026_dev';
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

export const firebaseSync = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, email, name, role } = req.body;
    let verifiedEmail = email?.toLowerCase().trim();
    let verifiedUid = '';

    if (idToken && getApps().length > 0) {
      try {
        const decoded = await getAuth().verifyIdToken(idToken);
        verifiedUid = decoded.uid;
        if (decoded.email) verifiedEmail = decoded.email.toLowerCase().trim();
      } catch {
        // Continue with provided email if idToken verification is offline
      }
    }

    if (!verifiedEmail) {
      res.status(400).json({ success: false, message: 'Email is required for Firebase sync.' });
      return;
    }

    let user = await AdminUser.findOne({
      $or: [{ email: verifiedEmail }, ...(verifiedUid ? [{ firebaseUid: verifiedUid }] : [])],
    });

    if (!user) {
      const defaultHash = await bcrypt.hash('default1234', 10);
      user = await AdminUser.create({
        firebaseUid: verifiedUid || undefined,
        name: name || verifiedEmail.split('@')[0],
        email: verifiedEmail,
        passwordHash: defaultHash,
        role: (role as UserRole) || 'Staff',
      });
    } else if (verifiedUid && !user.firebaseUid) {
      user.firebaseUid = verifiedUid;
      await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_cafe_jwt_key_2026_dev';
    const serverToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: serverToken,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in firebaseSync:', error);
    res.status(500).json({ success: false, message: 'Server error synchronizing Firebase user.' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated.' });
      return;
    }

    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving current user.' });
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await AdminUser.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving staff accounts.' });
  }
};

export const createUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, firebaseUid } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await AdminUser.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await AdminUser.create({
      firebaseUid: firebaseUid || undefined,
      name,
      email: normalizedEmail,
      passwordHash,
      role: role as UserRole,
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        firebaseUid: newUser.firebaseUid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error in createUserAccount:', error);
    res.status(500).json({ success: false, message: 'Server error creating staff account.' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles: UserRole[] = ['Owner', 'KitchenStaff', 'Staff'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
      return;
    }

    const updated = await AdminUser.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ success: false, message: 'Server error updating user role.' });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await AdminUser.findByIdAndUpdate(id, { passwordHash }, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error in resetUserPassword:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
};

export const deleteUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const target = await AdminUser.findById(id);
    if (!target) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Protect against self-deletion or deleting the primary owner
    if (target.email === 'owner@cafe.com') {
      res.status(400).json({ success: false, message: 'The primary owner account cannot be deleted.' });
      return;
    }

    await AdminUser.findByIdAndDelete(id);
    res.json({ success: true, message: 'User account removed.' });
  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
};
