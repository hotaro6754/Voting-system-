const express = require('express');
const router = express.Router();
const { getResults, getAdminOverview } = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Flexible auth: if logged in as admin, they see it. Otherwise, depends on session visibility.
router.get('/results/:sessionId', (req, res, next) => {
    // Optional auth middleware to check for admin
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        authMiddleware(req, res, next);
    } else {
        next();
    }
}, getResults);

router.get('/overview', authMiddleware, adminMiddleware, getAdminOverview);

module.exports = router;
