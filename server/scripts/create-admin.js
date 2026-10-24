import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

async function main() {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env');
  }
  if (ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters long');
  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name: ADMIN_NAME || 'SSM Sarees Admin', email, passwordHash, role: 'admin', active: true } },
    { upsert: true, new: true, runValidators: true }
  );
  console.log('Admin account created/updated for:', user.email);
}
main().catch((error) => { console.error('Admin bootstrap failed:', error.message); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect(); });
