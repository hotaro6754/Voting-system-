const { db } = require('./firebase');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  const username = 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.collection('settings').doc('admin').set({
      username,
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });
    console.log('Admin user seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
