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
      startTime, // ISO string
      endTime,   // ISO string
      allowSelfVote: allowSelfVote || false,
      resultsVisibility: resultsVisibility || 'hidden', // 'hidden' or 'public'
      status: 'upcoming', // initial status
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ sessionId, message: 'Session created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const snapshot = await db.collection('electionSessions').get();
    const sessions = [];
    const now = new Date();

    snapshot.forEach(doc => {
      let data = doc.data();
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      // Auto-update status based on time
      let status = 'upcoming';
      if (now >= start && now <= end) status = 'active';
      else if (now > end) status = 'ended';

      if (data.status !== status) {
          // Update in background if status changed
          db.collection('electionSessions').doc(data.sessionId).update({ status });
          data.status = status;
      }

      sessions.push(data);
    });
    res.json(sessions);
  } catch (error) {
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
      res.status(500).json({ message: error.message });
    }
};

const deleteSession = async (req, res) => {
    try {
      await db.collection('electionSessions').doc(req.params.id).delete();
      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

module.exports = { createSession, getAllSessions, getSessionById, updateSession, deleteSession };
