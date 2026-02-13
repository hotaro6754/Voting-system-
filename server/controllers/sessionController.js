const { db } = require('../models/firebase');
const { v4: uuidv4 } = require('uuid');

const createSession = async (req, res) => {
  try {
    const { name, datasetId, startTime, endTime, allowSelfVote, resultsVisibility } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.length < 3) {
      return res.status(400).json({ message: 'Session name must be at least 3 characters long' });
    }
    if (!datasetId || typeof datasetId !== 'string') {
      return res.status(400).json({ message: 'A valid Dataset ID is required' });
    }
    if (!startTime || !endTime || isNaN(Date.parse(startTime)) || isNaN(Date.parse(endTime))) {
      return res.status(400).json({ message: 'Valid start and end times are required' });
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    if (!db) throw new Error('Database not initialized');

    const sessionId = uuidv4();
    const sessionRef = db.collection('sessions').doc(sessionId);

    // Get dataset name for display convenience
    const datasetDoc = await db.collection('datasets').doc(datasetId).get();
    const datasetName = datasetDoc.exists ? datasetDoc.data().name : 'Unknown Dataset';

    await sessionRef.set({
      sessionId,
      name,
      datasetId,
      datasetName,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      allowSelfVote: !!allowSelfVote,
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
    if (!db) throw new Error('Firestore database not initialized.');

    const snapshot = await db.collection('sessions').get();
    const sessions = [];
    const now = new Date();

    const batch = db.batch();
    let needsUpdate = false;

    snapshot.forEach(doc => {
      let data = doc.data();
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      let status = 'upcoming';
      if (now >= start && now <= end) status = 'active';
      else if (now > end) status = 'ended';

      if (data.status !== status) {
          batch.update(db.collection('sessions').doc(data.sessionId), { status });
          data.status = status;
          needsUpdate = true;
      }

      sessions.push(data);
    });

    if (needsUpdate) {
        await batch.commit();
    }

    // Sort by creation date descending
    sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(sessions);
  } catch (error) {
    console.error('GET_ALL_SESSIONS_ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

const getSessionById = async (req, res) => {
    try {
      const sessionDoc = await db.collection('sessions').doc(req.params.id).get();
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
      const sessionRef = db.collection('sessions').doc(req.params.id);

      const updateData = {};
      if (name) updateData.name = name;
      if (startTime) updateData.startTime = new Date(startTime).toISOString();
      if (endTime) updateData.endTime = new Date(endTime).toISOString();
      if (allowSelfVote !== undefined) updateData.allowSelfVote = !!allowSelfVote;
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
      await db.collection('sessions').doc(req.params.id).delete();
      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('DELETE_SESSION_ERROR:', error);
      res.status(500).json({ message: error.message });
    }
};

module.exports = { createSession, getAllSessions, getSessionById, updateSession, deleteSession };
