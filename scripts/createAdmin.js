/**
 * Script to create an admin user
 * 
 * Usage:
 *   node scripts/createAdmin.js
 * 
 * Or with custom values:
 *   node scripts/createAdmin.js "John" "Admin" "Doe" "admin@kelale.com" "securepassword123" "+251911234567"
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kelale';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get arguments or use defaults
    const args = process.argv.slice(2);
    const firstName = args[0] || 'Admin';
    const middleName = args[1] || '';
    const lastName = args[2] || 'User';
    const email = args[3] || 'admin@kelale.com';
    const password = args[4] || 'admin123';
    const phoneNumber = args[5] || '';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      console.log('Options:');
      console.log('1. Use a different email address');
      console.log('2. Update existing user to admin role manually in database');
      console.log('3. Delete existing user and run this script again\n');
      process.exit(1);
    }

    // Create full name
    const nameParts = [firstName];
    if (middleName && middleName.trim()) {
      nameParts.push(middleName.trim());
    }
    nameParts.push(lastName);
    const name = nameParts.join(' ');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = new User({
      name,
      firstName,
      middleName: middleName && middleName.trim() ? middleName.trim() : null,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || null,
      role: 'admin'
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Details:');
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 You can now login with these credentials at:');
    console.log('   http://localhost:5173/login');
    console.log('\n🔐 After login, you will see the "Admin" link in the navigation bar.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();


