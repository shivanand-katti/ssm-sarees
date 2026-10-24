import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password || email.length > 254 || password.length > 200) {
      return res.status(400).json({ error: 'Valid email and password are required' });
    }
    const user = await User.findOne({ email, active: true }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email or password is incorrect' });
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(500).json({ error: 'Authentication is not configured securely' });
    }
    const token = jwt.sign(
      { role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { subject: user.id, expiresIn: '8h', issuer: 'ssm-sarees-api', audience: 'ssm-sarees-client' }
    );
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('name email role active');
    if (!user || !user.active) return res.status(401).json({ error: 'Account is not active' });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    return next(error);
  }
});

export default router;
