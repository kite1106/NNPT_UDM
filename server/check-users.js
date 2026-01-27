import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './src/models/User.js';

dotenv.config();

async function checkUsers() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
