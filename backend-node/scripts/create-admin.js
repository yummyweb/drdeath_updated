#!/usr/bin/env node

/**
 * Secure Admin Creation Script
 * 
 * This script allows you to create admin users securely from the command line.
 * Usage: node scripts/create-admin.js <email> <password> <full_name>
 * 
 * Example: node scripts/create-admin.js admin@example.com SecurePassword123 "Admin Name"
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'legal_guardian';

async function createAdmin() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('❌ Error: Missing required arguments');
    console.log('\nUsage: node scripts/create-admin.js <email> <password> <full_name> [phone]');
    console.log('\nExample:');
    console.log('  node scripts/create-admin.js admin@example.com SecurePassword123 "Admin Name"');
    process.exit(1);
  }

  const [email, password, full_name, phone] = args;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Error: Invalid email address');
    process.exit(1);
  }

  // Validate password
  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(`${mongoUrl}/${dbName}`);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === 'admin') {
        console.error(`❌ Error: Admin user with email ${email} already exists`);
        console.log('   If you want to update the password, use the admin panel or update the user directly in the database.');
        process.exit(1);
      } else {
        console.log(`⚠️  Warning: User with email ${email} exists but is not an admin`);
        console.log('   Converting existing user to admin...\n');
        
        console.error('❌ Error: A non-admin user with this email already exists.');
        console.log('   To promote them to admin, update their role directly in MongoDB.');
        process.exit(1);
      }
    }

    // Create new admin user
    console.log('🔐 Creating admin user...');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const admin = await User.create({
      email,
      password: hashedPassword,
      full_name,
      phone: phone || null,
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Name:     ${admin.full_name}`);
    console.log(`   Role:     ${admin.role}`);
    if (admin.phone) console.log(`   Phone:    ${admin.phone}`);
    console.log(`   ID:       ${admin.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Keep these credentials secure!\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('   Email already exists in database');
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createAdmin();

