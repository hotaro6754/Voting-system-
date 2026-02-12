const { db } = require('../models/firebase');

const getResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDoc = await db.collection('electionSessions').doc(sessionId).get();

    if (!sessionDoc.exists) return res.status(404).json({ message: 'Session not found' });
    const sessionData = sessionDoc.data();

    // Check if results should be public
    const isPublic = sessionData.resultsVisibility === 'public' || sessionData.status === 'ended';
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isPublic && !isAdmin) {
        return res.status(403).json({ message: 'Results are currently hidden' });
    }

    // Fetch all votes for this session
    const votesSnapshot = await db.collection('votes').where('sessionId', '==', sessionId).get();

    const results = {};
    votesSnapshot.forEach(doc => {
      const data = doc.data();
      results[data.votedFor] = (results[data.votedFor] || 0) + 1;
    });

    // Get total eligible voters
    const datasetDoc = await db.collection('datasets').doc(sessionData.datasetId).get();
    const totalEligible = datasetDoc.exists ? datasetDoc.data().rollNumbers.length : 0;
    const totalVotes = votesSnapshot.size;

    res.json({
      sessionId,
      sessionName: sessionData.name,
      results,
      totalEligible,
      totalVotes,
      participationRate: totalEligible > 0 ? (totalVotes / totalEligible) * 100 : 0,
      status: sessionData.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminOverview = async (req, res) => {
    try {
        const datasetsCount = (await db.collection('datasets').get()).size;
        const sessionsCount = (await db.collection('electionSessions').get()).size;
        const totalVotesCount = (await db.collection('votes').get()).size;

        res.json({
            datasetsCount,
            sessionsCount,
            totalVotesCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getResults, getAdminOverview };
