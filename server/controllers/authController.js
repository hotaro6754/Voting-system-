const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../models/firebase');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const adminRef = db.collection('settings').doc('admin');
    const adminDoc = await adminRef.get();

    if (!adminDoc.exists) {
      // If no admin doc exists, check if ADMIN_PASSWORD is set in env as a temporary measure
      // This allows the first login to seed the database if needed, but it's better to run the seed script.
      const envPassword = process.env.ADMIN_PASSWORD;
      if (envPassword && username === 'admin' && password === envPassword) {
        const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token, user: { username: 'admin', role: 'admin' } });
      }
      return res.status(401).json({ message: 'Invalid credentials or Admin not initialized' });
    }

    const adminData = adminDoc.data();
    const isMatch = await bcrypt.compare(password, adminData.password);

    if (username === adminData.username && isMatch) {
      const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: { username: adminData.username, role: 'admin' } });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

module.exports = { login };
