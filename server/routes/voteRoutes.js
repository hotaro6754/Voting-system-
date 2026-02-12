const express = require('express');
const router = express.Router();
const { submitVote, checkVoterStatus } = require('../controllers/voteController');

router.post('/submit', submitVote);
router.get('/status', checkVoterStatus);

module.exports = router;
