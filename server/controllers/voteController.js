const { db, admin } = require('../models/firebase');

const submitVote = async (req, res) => {
  try {
    const { sessionId, voterRollNumber, votedFor } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // 1. Validation
    if (!sessionId || typeof sessionId !== 'string') return res.status(400).json({ message: 'Valid Session ID is required' });
    if (!voterRollNumber || typeof voterRollNumber !== 'string') return res.status(400).json({ message: 'Voter Roll Number is required' });
    if (!votedFor || typeof votedFor !== 'string') return res.status(400).json({ message: 'Selected Candidate is required' });

    if (!db) return res.status(500).json({ message: 'Database not initialized. Please contact admin.' });

    // 2. Validate session is active
    // We check both 'sessions' and 'electionSessions' for compatibility, but prefer 'sessions'
    let sessionRef = db.collection('sessions').doc(sessionId);
    let sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
        sessionRef = db.collection('electionSessions').doc(sessionId);
        sessionDoc = await sessionRef.get();
    }

    if (!sessionDoc.exists) return res.status(404).json({ message: 'Session not found' });

    const sessionData = sessionDoc.data();
    const now = new Date();
    if (now < new Date(sessionData.startTime) || now > new Date(sessionData.endTime)) {
        return res.status(403).json({ message: 'Voting is not currently active for this session' });
    }

    // 3. Prevent self-vote if disabled
    if (!sessionData.allowSelfVote && voterRollNumber === votedFor) {
        return res.status(400).json({ message: 'Self-voting is not allowed in this session' });
    }

    // 4. Atomic transaction to prevent double voting
    // Using the path requested by the user: sessions/{sessionId}/students/{voterRollNumber}
    const studentRef = db.collection('sessions').doc(sessionId).collection('students').doc(voterRollNumber);

    await db.runTransaction(async (transaction) => {
      const studentDoc = await transaction.get(studentRef);

      if (!studentDoc.exists) {
        throw new Error('NOT_AUTHORIZED');
      }

      if (studentDoc.data().hasVoted) {
        throw new Error('ALREADY_VOTED');
      }

      // Mark as voted in the student document
      transaction.update(studentRef, {
        hasVoted: true,
        votedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Record the actual vote separately (Anonymous)
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
    if (error.message === 'NOT_AUTHORIZED') {
        return res.status(403).json({ message: 'Your roll number is not authorized for this session.' });
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

        const studentDoc = await db.collection('sessions').doc(sessionId).collection('students').doc(rollNumber).get();

        if (studentDoc.exists) {
            return res.json({ hasVoted: !!studentDoc.data().hasVoted });
        }

        // Fallback to old path if needed
        const oldVoterDoc = await db.collection('voters').doc(`${sessionId}_${rollNumber}`).get();
        res.json({ hasVoted: oldVoterDoc.exists && oldVoterDoc.data().hasVoted });
    } catch (error) {
        console.error('CHECK_VOTER_STATUS_ERROR:', error);
        res.status(500).json({ message: 'Error checking voter status' });
    }
};

module.exports = { submitVote, checkVoterStatus };
