const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { submitVote, checkVoterStatus } = require('../controllers/voteController');

// Stricter rate limit for vote submission: 5 attempts per 15 minutes per IP
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many voting attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/submit', voteLimiter, submitVote);
router.get('/status', checkVoterStatus);

module.exports = router;
