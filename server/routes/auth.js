const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { spawn } = require('child_process');
const path = require('path');

router.post('/login', login);

router.post('/seed-cse-b', authMiddleware, adminMiddleware, (req, res) => {
    const scriptPath = path.join(__dirname, '../models/seed_cse_b.js');
    const child = spawn('node', [scriptPath], {
        env: { ...process.env }
    });

    let output = '';
    child.stdout.on('data', (data) => output += data.toString());
    child.stderr.on('data', (data) => output += data.toString());

    child.on('close', (code) => {
        if (code === 0) {
            res.json({ message: 'Seeding successful', output });
        } else {
            res.status(500).json({ message: 'Seeding failed', output });
        }
    });
});

router.post('/seed-admin', (req, res) => {
    const { password } = req.body;
    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const scriptPath = path.join(__dirname, '../models/seed.js');
    const child = spawn('node', [scriptPath], {
        env: { ...process.env }
    });

    let output = '';
    child.stdout.on('data', (data) => output += data.toString());
    child.stderr.on('data', (data) => output += data.toString());

    child.on('close', (code) => {
        if (code === 0) {
            res.json({ message: 'Admin seeding successful', output });
        } else {
            res.status(500).json({ message: 'Admin seeding failed', output });
        }
    });
});

module.exports = router;
