const express = require('express');
const router = express.Router();
const { createSession, getAllSessions, getSessionById, updateSession, deleteSession } = require('../controllers/sessionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const auditLogger = require('../middleware/auditLogger');
router.get('/', getAllSessions); // Publicly accessible to see active sessions
router.get('/:id', getSessionById);
router.post('/', authMiddleware, adminMiddleware, auditLogger('CREATE_SESSION'), createSession);
router.put('/:id', authMiddleware, adminMiddleware, updateSession);
router.delete('/:id', authMiddleware, adminMiddleware, auditLogger('DELETE_SESSION'), deleteSession);

module.exports = router;
