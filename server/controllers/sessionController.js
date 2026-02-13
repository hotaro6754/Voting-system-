const { db } = require('../models/firebase');
const { v4: uuidv4 } = require('uuid');

const createSession = async (req, res) => {
  try {
    const { name, datasetId, startTime, endTime, allowSelfVote, resultsVisibility } = req.body;

    if (!name || !datasetId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const sessionId = uuidv4();
    const sessionRef = db.collection('electionSessions').doc(sessionId);

    await sessionRef.set({
      sessionId,
      name,
      datasetId,
      startTime,
      endTime,
      allowSelfVote: allowSelfVote || false,
      resultsVisibility: resultsVisibility || 'hidden',
      status: 'upcoming',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ sessionId, message: 'Session created successfully' });
  } catch (error) {
    console.error('CREATE_SESSION_ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllSessions = async (req, res) => {
  try {
    if (!db) throw new Error('Firestore database not initialized. Check your FIREBASE_SERVICE_ACCOUNT.');

    const snapshot = await db.collection('electionSessions').get();
    const sessions = [];
    const now = new Date();

    snapshot.forEach(doc => {
      let data = doc.data();
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      let status = 'upcoming';
      if (now >= start && now <= end) status = 'active';
      else if (now > end) status = 'ended';

      if (data.status !== status) {
          db.collection('electionSessions').doc(data.sessionId).update({ status }).catch(e => console.error('Status update fail:', e));
          data.status = status;
      }

      sessions.push(data);
    });
    res.json(sessions);
  } catch (error) {
    console.error('GET_ALL_SESSIONS_ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

const getSessionById = async (req, res) => {
    try {
      const sessionDoc = await db.collection('electionSessions').doc(req.params.id).get();
      if (!sessionDoc.exists) {
        return res.status(404).json({ message: 'Session not found' });
      }
      res.json(sessionDoc.data());
    } catch (error) {
      console.error('GET_SESSION_BY_ID_ERROR:', error);
      res.status(500).json({ message: error.message });
    }
};

const updateSession = async (req, res) => {
    try {
      const { name, startTime, endTime, allowSelfVote, resultsVisibility, status } = req.body;
      const sessionRef = db.collection('electionSessions').doc(req.params.id);

      const updateData = {};
      if (name) updateData.name = name;
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (allowSelfVote !== undefined) updateData.allowSelfVote = allowSelfVote;
      if (resultsVisibility) updateData.resultsVisibility = resultsVisibility;
      if (status) updateData.status = status;

      await sessionRef.update(updateData);
      res.json({ message: 'Session updated successfully' });
    } catch (error) {
      console.error('UPDATE_SESSION_ERROR:', error);
      res.status(500).json({ message: error.message });
    }
};

const deleteSession = async (req, res) => {
    try {
      await db.collection('electionSessions').doc(req.params.id).delete();
      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('DELETE_SESSION_ERROR:', error);
      res.status(500).json({ message: error.message });
    }
};

module.exports = { createSession, getAllSessions, getSessionById, updateSession, deleteSession };
