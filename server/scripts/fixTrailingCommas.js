/**
 * Fix script: Remove trailing commas from string fields in User collection
 * Issue: Some records have trailing commas like "admin," instead of "admin"
 * This causes Zod validation to fail
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';

dotenv.config();

async function fixTrailingCommas() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/english_learning';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find();
    console.log(`📊 Found ${users.length} users`);

    let fixedCount = 0;
    const updates = [];

    for (const user of users) {
      let needsUpdate = false;
      const updateData = {};

      // Check and fix email
      if (user.email && user.email.endsWith(',')) {
        console.log(`  ❌ User ${user._id}: email="${user.email}" → "${user.email.slice(0, -1)}"`);
        updateData.email = user.email.slice(0, -1);
        needsUpdate = true;
      }

      // Check and fix name
      if (user.name && user.name.endsWith(',')) {
        console.log(`  ❌ User ${user._id}: name="${user.name}" → "${user.name.slice(0, -1)}"`);
        updateData.name = user.name.slice(0, -1);
        needsUpdate = true;
      }

      // Check and fix role
      if (user.role && user.role.endsWith(',')) {
        console.log(`  ❌ User ${user._id}: role="${user.role}" → "${user.role.slice(0, -1)}"`);
        updateData.role = user.role.slice(0, -1);
        needsUpdate = true;
      }

      if (needsUpdate) {
        updates.push({ _id: user._id, ...updateData });
        fixedCount++;
      }
    }

    if (fixedCount === 0) {
      console.log('✅ No users need fixing - data is clean!');
      await mongoose.connection.close();
      return;
    }

    // Apply updates
    console.log(`\n🔧 Fixing ${fixedCount} users...`);
    for (const update of updates) {
      const { _id, ...data } = update;
      await User.findByIdAndUpdate(_id, data);
    }

    // Verify fixes
    console.log('\n✅ Verifying fixes...');
    const verifyUsers = await User.find({ _id: { $in: updates.map((u) => u._id) } });
    for (const user of verifyUsers) {
      console.log(`  ✅ ${user.email} - role: ${user.role}`);
    }

    console.log(`\n🎉 Fixed ${fixedCount} users successfully!`);
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixTrailingCommas();
