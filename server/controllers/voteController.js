const { db, admin } = require('../models/firebase');

const submitVote = async (req, res) => {
  try {
    const { sessionId, datasetId, voterRollNumber, votedFor } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // 1. Validation
    if (!sessionId || typeof sessionId !== 'string') return res.status(400).json({ message: 'Valid Session ID is required' });
    if (!datasetId || typeof datasetId !== 'string') return res.status(400).json({ message: 'Valid Dataset ID is required' });
    if (!voterRollNumber || typeof voterRollNumber !== 'string') return res.status(400).json({ message: 'Voter Roll Number is required' });
    if (!votedFor || typeof votedFor !== 'string') return res.status(400).json({ message: 'Selected Candidate is required' });

    if (!db) return res.status(500).json({ message: 'Database not initialized. Please contact admin.' });

    // 2. Validate session is active
    const sessionDoc = await db.collection('electionSessions').doc(sessionId).get();
    if (!sessionDoc.exists) return res.status(404).json({ message: 'Session not found' });

    const sessionData = sessionDoc.data();
    const now = new Date();
    if (now < new Date(sessionData.startTime) || now > new Date(sessionData.endTime)) {
        return res.status(403).json({ message: 'Voting is not currently active for this session' });
    }

    // 3. Validate roll number belongs to dataset
    const datasetDoc = await db.collection('datasets').doc(datasetId).get();
    if (!datasetDoc.exists) return res.status(404).json({ message: 'Dataset not found' });

    const datasetData = datasetDoc.data();
    if (!datasetData.rollNumbers.includes(voterRollNumber)) {
        return res.status(400).json({ message: 'Your roll number is not authorized for this election' });
    }
    if (!datasetData.rollNumbers.includes(votedFor)) {
        return res.status(400).json({ message: 'Selected candidate is not in the official list' });
    }

    // 4. Prevent self-vote if disabled
    if (!sessionData.allowSelfVote && voterRollNumber === votedFor) {
        return res.status(400).json({ message: 'Self-voting is not allowed in this session' });
    }

    // 5. Atomic transaction to prevent double voting
    const voterStatusRef = db.collection('voters').doc(`${sessionId}_${voterRollNumber}`);

    await db.runTransaction(async (transaction) => {
      const voterDoc = await transaction.get(voterStatusRef);
      if (voterDoc.exists && voterDoc.data().hasVoted) {
        throw new Error('ALREADY_VOTED');
      }

      // Mark as voted (Anonymous: we don't link voter to the vote record)
      transaction.set(voterStatusRef, {
        sessionId,
        rollNumber: voterRollNumber,
        hasVoted: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Record the actual vote separately
      const voteRef = db.collection('votes').doc();
      transaction.set(voteRef, {
        sessionId,
        votedFor,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipHash: ipAddress // Ideally hash this for privacy
      });
    });

    res.status(200).json({ message: 'Your vote has been securely recorded.' });
  } catch (error) {
    if (error.message === 'ALREADY_VOTED') {
        return res.status(400).json({ message: 'You have already responded. Duplicate voting is not allowed.' });
    }
    console.error('SUBMIT_VOTE_ERROR:', error);
    res.status(500).json({ message: 'Internal server error during vote submission.' });
  }
};

const checkVoterStatus = async (req, res) => {
    try {
        const { sessionId, rollNumber } = req.query;
        if (!sessionId || !rollNumber) return res.status(400).json({ message: 'Missing sessionId or rollNumber' });

        if (!db) return res.status(500).json({ message: 'Database not initialized' });

        const voterDoc = await db.collection('voters').doc(`${sessionId}_${rollNumber}`).get();
        res.json({ hasVoted: voterDoc.exists && voterDoc.data().hasVoted });
    } catch (error) {
        console.error('CHECK_VOTER_STATUS_ERROR:', error);
        res.status(500).json({ message: 'Error checking voter status' });
    }
};

module.exports = { submitVote, checkVoterStatus };
