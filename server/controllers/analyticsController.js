const { db } = require('../models/firebase');

const getResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();

    if (!sessionDoc.exists) return res.status(404).json({ message: 'Session not found' });
    const sessionData = sessionDoc.data();

    const now = new Date();
    const endTime = new Date(sessionData.endTime);
    const releaseTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

    // Authorization Check
    const isAdmin = req.user && req.user.role === 'admin';
    const isPubliclyReleased = sessionData.resultsVisibility === 'public' || (sessionData.status === 'ended' && now >= releaseTime);

    if (!isPubliclyReleased && !isAdmin) {
        if (sessionData.status === 'ended') {
            return res.status(403).json({
                message: 'Results are currently being audited and will be released 24 hours after the election end time.',
                releaseTime: releaseTime.toISOString()
            });
        }
        return res.status(403).json({ message: 'Results are currently hidden by the administrator.' });
    }

    // Fetch votes (Optimized: only fetch necessary fields)
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

    // Convert results object to sorted array for easier display
    const tallies = Object.entries(results)
        .map(([candidate, votes]) => ({ candidate, votes }))
        .sort((a, b) => b.votes - a.votes);

    res.json({
      sessionId,
      sessionName: sessionData.name,
      tallies,
      totalEligible,
      totalVotes,
      participationRate: totalEligible > 0 ? parseFloat(((totalVotes / totalEligible) * 100).toFixed(2)) : 0,
      status: sessionData.status,
      releaseTime: releaseTime.toISOString(),
      isPublic: isPubliclyReleased
    });
  } catch (error) {
    console.error('GET_RESULTS_ERROR:', error);
    res.status(500).json({ message: 'Error retrieving analytics data' });
  }
};

const getAdminOverview = async (req, res) => {
    try {
        if (!db) throw new Error('Database not initialized');

        const [datasetsSnap, sessionsSnap, votesSnap] = await Promise.all([
            db.collection('datasets').get(),
            db.collection('sessions').get(),
            db.collection('votes').get()
        ]);

        res.json({
            datasetsCount: datasetsSnap.size,
            sessionsCount: sessionsSnap.size,
            totalVotesCount: votesSnap.size
        });
    } catch (error) {
        console.error('GET_ADMIN_OVERVIEW_ERROR:', error);
        res.status(500).json({ message: 'Error retrieving overview data' });
    }
};

module.exports = { getResults, getAdminOverview };
