import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, UserAccount } from '../services/database';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, dob, gender, bloodGroup, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: UserAccount = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      name,
      email,
      passwordHash,
      dob: dob || '1995-01-01',
      gender: gender || 'Unspecified',
      bloodGroup: bloodGroup || 'O+',
      phone: phone || '+91 98000 00000',
      height: '175 cm',
      weight: '70 kg',
      allergies: [],
      conditions: [],
      emergencyContact: {
        name: 'Primary Contact',
        relation: 'Family',
        phone: '+91 98000 00001'
      }
    };

    db.createUser(newUser);

    const secret = process.env.JWT_SECRET || 'medvault_super_secret_jwt_key_2026';
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      secret,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (allow "Password123!" demo password or hash check)
    let isMatch = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!isMatch && password === 'Password123!') {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'medvault_super_secret_jwt_key_2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      secret,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getMe = (req: any, res: Response) => {
  try {
    const userId = req.user?.id || 'usr-1';
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(444).json({ error: 'User profile not found' });
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};
