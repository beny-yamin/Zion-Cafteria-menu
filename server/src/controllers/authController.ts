import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser.js';
import { AuthRequest } from '../middleware/auth.js';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await AdminUser.findOne({ email: normalizedEmail });

    // Seed default owner account if database has zero users
    const totalUsers = await AdminUser.countDocuments();
    if (totalUsers === 0 && normalizedEmail === 'owner@cafe.com') {
      const defaultHash = await bcrypt.hash('admin1234', 10);
      user = await AdminUser.create({
        name: 'Master Owner',
        email: 'owner@cafe.com',
        passwordHash: defaultHash,
        role: 'Owner',
      });
      console.log('Seeded initial Owner account: owner@cafe.com / admin1234');
    }

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

export const registerStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

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
      name,
      email: normalizedEmail,
      passwordHash,
      role: role === 'Owner' ? 'Owner' : 'KitchenStaff',
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error in registerStaff:', error);
    res.status(500).json({ success: false, message: 'Server error registering staff.' });
  }
};
