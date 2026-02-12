const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../models/firebase');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // For simplicity, we use a single admin account defined in env or db
    // In a real production app, you might have an 'admins' collection
    const adminRef = db.collection('settings').doc('admin');
    const adminDoc = await adminRef.get();

    let adminData;
    if (!adminDoc.exists) {
        // Fallback to env password if no admin doc exists (for first time setup)
        const envPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (username === 'admin' && password === envPassword) {
            const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.json({ token, user: { username: 'admin', role: 'admin' } });
        }
        return res.status(401).json({ message: 'Invalid credentials' });
    } else {
        adminData = adminDoc.data();
        const isMatch = await bcrypt.compare(password, adminData.password);
        if (username === adminData.username && isMatch) {
            const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.json({ token, user: { username: adminData.username, role: 'admin' } });
        }
        return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login };
