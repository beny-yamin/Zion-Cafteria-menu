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
        isDemo: user.isDemo || false,
        isProtected: user.isProtected || false,
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
        isDemo: user.isDemo || false,
        isProtected: user.isProtected || false,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await AdminUser.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const validRoles: UserRole[] = ['Owner', 'KitchenStaff', 'Staff'];
    const assignedRole: UserRole = validRoles.includes(role) ? role : 'Staff';

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await AdminUser.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      isDemo: false,
      isProtected: false,
    });

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_cafe_jwt_key_2026_dev';
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isDemo: false,
        isProtected: false,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isDemo: false,
        isProtected: false,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ success: false, message: 'Server error creating account.' });
  }
};

export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role = 'Owner' } = req.body;
    const validRoles: UserRole[] = ['Owner', 'KitchenStaff', 'Staff'];
    const targetRole: UserRole = validRoles.includes(role) ? role : 'Owner';

    const demoProfiles: Record<UserRole, { name: string; email: string }> = {
      Owner: { name: 'Demo Cafe Owner', email: 'demo-owner@cafe.com' },
      KitchenStaff: { name: 'Demo Kitchen Staff', email: 'demo-kitchen@cafe.com' },
      Staff: { name: 'Demo Floor Staff', email: 'demo-staff@cafe.com' },
    };

    const profile = demoProfiles[targetRole];
    let demoUser = await AdminUser.findOne({ email: profile.email });

    if (!demoUser) {
      const defaultHash = await bcrypt.hash('demo1234', 10);
      demoUser = await AdminUser.create({
        name: profile.name,
        email: profile.email,
        passwordHash: defaultHash,
        role: targetRole,
        isDemo: true,
        isProtected: false,
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_cafe_jwt_key_2026_dev';
    const token = jwt.sign(
      {
        id: demoUser._id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        isDemo: true,
        isProtected: false,
      },
      jwtSecret,
      { expiresIn: '2d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        isDemo: true,
        isProtected: false,
      },
    });
  } catch (error) {
    console.error('Error in demoLogin:', error);
    res.status(500).json({ success: false, message: 'Server error initiating demo session.' });
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
        // Fallback to provided email
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
        isDemo: false,
        isProtected: false,
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
        isDemo: user.isDemo || false,
        isProtected: user.isProtected || false,
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
        isDemo: user.isDemo || false,
        isProtected: user.isProtected || false,
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

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If request originates from a demo session, return safe sample team records only
    if (req.user?.isDemo) {
      const sampleStaff = [
        {
          _id: 'demo-staff-1',
          name: 'Marco Rossi (Sample Head Chef)',
          email: 'chef.sample@cafe.com',
          role: 'KitchenStaff',
          isDemo: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'demo-staff-2',
          name: 'Sarah Connor (Sample Floor Lead)',
          email: 'floor.sample@cafe.com',
          role: 'Staff',
          isDemo: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'demo-staff-3',
          name: 'Liam Davis (Sample Barista)',
          email: 'barista.sample@cafe.com',
          role: 'Staff',
          isDemo: true,
          createdAt: new Date().toISOString(),
        },
      ];
      res.json({ success: true, users: sampleStaff, isDemoSample: true });
      return;
    }

    // Real Owner sees real accounts (excluding demo accounts for cleanliness)
    const users = await AdminUser.find({ isDemo: { $ne: true } })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving staff accounts.' });
  }
};

export const createUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, firebaseUid } = req.body;

    if (req.user?.isDemo) {
      res.status(403).json({
        success: false,
        message: 'Demo Mode: Team creation is protected for portfolio preview.',
      });
      return;
    }

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
      isDemo: false,
      isProtected: false,
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        firebaseUid: newUser.firebaseUid,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isDemo: false,
        isProtected: false,
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

    if (req.user?.isDemo) {
      res.status(403).json({
        success: false,
        message: 'Demo Mode: Role modifications are disabled in demo mode.',
      });
      return;
    }

    const validRoles: UserRole[] = ['Owner', 'KitchenStaff', 'Staff'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role specified.' });
      return;
    }

    const target = await AdminUser.findById(id);
    if (!target) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (target.isProtected || target.email === 'owner@cafe.com') {
      res.status(400).json({ success: false, message: 'The primary owner account role cannot be altered.' });
      return;
    }

    target.role = role;
    await target.save();

    res.json({
      success: true,
      user: {
        id: target._id,
        name: target.name,
        email: target.email,
        role: target.role,
      },
    });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ success: false, message: 'Server error updating user role.' });
  }
};

export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (req.user?.isDemo) {
      res.status(403).json({
        success: false,
        message: 'Demo Mode: Password resets are disabled in portfolio preview.',
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    const target = await AdminUser.findById(id);
    if (!target) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (target.isProtected) {
      res.status(400).json({ success: false, message: 'Protected admin accounts cannot be reset via this console.' });
      return;
    }

    target.passwordHash = await bcrypt.hash(newPassword, 10);
    await target.save();

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error in resetUserPassword:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
};

export const deleteUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.isDemo) {
      res.status(403).json({
        success: false,
        message: 'Demo Mode: Account deletion is disabled in portfolio preview.',
      });
      return;
    }

    const target = await AdminUser.findById(id);
    if (!target) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (target.isProtected || target.email === 'owner@cafe.com') {
      res.status(400).json({ success: false, message: 'Protected admin accounts cannot be deleted.' });
      return;
    }

    await AdminUser.findByIdAndDelete(id);
    res.json({ success: true, message: 'User account removed.' });
  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
};
