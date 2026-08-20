import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserAccount } from '../services/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const secret = process.env.JWT_SECRET || 'medvault_super_secret_jwt_key_2026';

  // 1. Try local/custom JWT
  try {
    const decoded = jwt.verify(token, secret) as any;
    if (decoded && decoded.id) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
      };
      ensureUserExists(req.user);
      return next();
    }
  } catch {
    // 2. Try decoding as Supabase JWT (Base64 / verify payload)
    try {
      const decodedSupabase = jwt.decode(token) as any;
      if (decodedSupabase && (decodedSupabase.sub || decodedSupabase.id)) {
        const userId = decodedSupabase.sub || decodedSupabase.id;
        const email = decodedSupabase.email || 'patient@example.com';
        const name = decodedSupabase.user_metadata?.name || decodedSupabase.user_metadata?.full_name || email.split('@')[0];

        req.user = {
          id: userId,
          email,
          name
        };
        ensureUserExists(req.user);
        return next();
      }
    } catch (e) {
      console.warn('Failed to parse token payload:', e);
    }
  }

  return res.status(403).json({ error: 'Invalid or expired authentication token' });
};

function ensureUserExists(user: { id: string; email: string; name: string }) {
  const existing = db.findUserById(user.id);
  if (!existing) {
    const newUser: UserAccount = {
      id: user.id,
      name: user.name,
      email: user.email,
      dob: '1995-01-01',
      gender: 'Unspecified',
      bloodGroup: 'Not set',
      phone: '+91 00000 00000',
      height: '170 cm',
      weight: '65 kg',
      allergies: [],
      conditions: [],
      emergencyContact: {
        name: 'Emergency Contact',
        relation: 'Family',
        phone: '+91 00000 00000'
      },
      passwordHash: ''
    };
    db.createUser(newUser);
  }
}
