import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { connectDb } from '../lib/db.js';
import { User } from '../models/User.js';

dotenv.config();

await connectDb();

const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

const existing = await User.findOne({ email });
if (existing) {
  // eslint-disable-next-line no-console
  console.log('Admin already exists:', email);
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 10);
await User.create({ email, passwordHash, role: 'admin', name: 'Admin' });

// eslint-disable-next-line no-console
console.log('Seeded admin:', { email, password });
process.exit(0);
