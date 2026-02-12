const { db } = require('../models/firebase');

const auditLogger = (action) => async (req, res, next) => {
  // Capture the original end function to log after the response is sent
  const originalEnd = res.end;

  res.end = function (...args) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const logEntry = {
        action,
        user: req.user ? req.user.username : 'unknown',
        method: req.method,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
        status: res.statusCode,
        payload: req.method !== 'GET' ? req.body : null
      };

      db.collection('auditLogs').add(logEntry).catch(err => {
        console.error('Failed to save audit log:', err);
      });
    }
    originalEnd.apply(res, args);
  };

  next();
};

module.exports = auditLogger;
