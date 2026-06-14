require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { v4: uuidv4 } = require('uuid');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const User = require('../models/User');

  const email = 'admin@checkcolors.com';
  const password = 'Admin@2024';

  let user = await User.findOne({ email });

  if (user) {
    console.log('User exists, resetting password and ensuring admin role...');
    user.password = password; // pre-save hook will hash it
    user.role = 'admin';
    user.isActive = true;
    await user.save();
    console.log('✅ Admin user updated:', user.email, '| role:', user.role);
  } else {
    user = await User.create({
      name: 'Admin',
      email,
      password,
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Admin user created:', user.email, '| role:', user.role);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
