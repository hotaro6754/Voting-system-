const { db, admin } = require('../models/firebase');

const submitVote = async (req, res) => {
  try {
    const { sessionId, datasetId, voterRollNumber, votedFor } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (!sessionId || !datasetId || !voterRollNumber || !votedFor) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 1. Validate session is active
    const sessionDoc = await db.collection('electionSessions').doc(sessionId).get();
    if (!sessionDoc.exists) return res.status(404).json({ message: 'Session not found' });

    const sessionData = sessionDoc.data();
    const now = new Date();
    if (now < new Date(sessionData.startTime) || now > new Date(sessionData.endTime)) {
        return res.status(403).json({ message: 'Voting is not currently active for this session' });
    }

    // 2. Validate roll number belongs to dataset
    const datasetDoc = await db.collection('datasets').doc(datasetId).get();
    if (!datasetDoc.exists) return res.status(404).json({ message: 'Dataset not found' });

    const datasetData = datasetDoc.data();
    if (!datasetData.rollNumbers.includes(voterRollNumber)) {
        return res.status(400).json({ message: 'Invalid roll number for this dataset' });
    }
    if (!datasetData.rollNumbers.includes(votedFor)) {
        return res.status(400).json({ message: 'Invalid candidate selected' });
    }

    // 3. Prevent self-vote if disabled
    if (!sessionData.allowSelfVote && voterRollNumber === votedFor) {
        return res.status(400).json({ message: 'Self-voting is disabled for this session' });
    }

    // 4. Use transaction to check if already voted and then record vote
    const voterStatusRef = db.collection('voters').doc(`${sessionId}_${voterRollNumber}`);

    await db.runTransaction(async (transaction) => {
      const voterDoc = await transaction.get(voterStatusRef);
      if (voterDoc.exists && voterDoc.data().hasVoted) {
        throw new Error('You have already responded. Duplicate voting is not allowed.');
      }

      // Record voter status
      transaction.set(voterStatusRef, {
        sessionId,
        datasetId,
        rollNumber: voterRollNumber,
        hasVoted: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Record the actual vote (anonymous or linked depending on requirements, here we store it securely)
      const voteRef = db.collection('votes').doc();
      transaction.set(voteRef, {
        sessionId,
        datasetId,
        votedFor,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress,
        userAgent
      });
    });

    res.status(200).json({ message: 'Your vote has been securely recorded.' });
  } catch (error) {
    if (error.message === 'You have already responded. Duplicate voting is not allowed.') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const checkVoterStatus = async (req, res) => {
    try {
        const { sessionId, rollNumber } = req.query;
        if (!sessionId || !rollNumber) return res.status(400).json({ message: 'Missing params' });

        const voterDoc = await db.collection('voters').doc(`${sessionId}_${rollNumber}`).get();
        if (voterDoc.exists && voterDoc.data().hasVoted) {
            return res.json({ hasVoted: true });
        }
        res.json({ hasVoted: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitVote, checkVoterStatus };
