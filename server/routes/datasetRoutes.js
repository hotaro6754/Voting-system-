const express = require('express');
const router = express.Router();
const { createDataset, getAllDatasets, getDatasetById, updateDataset, deleteDataset } = require('../controllers/datasetController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const auditLogger = require('../middleware/auditLogger');
router.get('/', authMiddleware, adminMiddleware, getAllDatasets);
router.get('/:id', getDatasetById); // Made public for voters
router.post('/', authMiddleware, adminMiddleware, auditLogger('CREATE_DATASET'), createDataset);
router.put('/:id', authMiddleware, adminMiddleware, updateDataset);
router.delete('/:id', authMiddleware, adminMiddleware, auditLogger('DELETE_DATASET'), deleteDataset);

module.exports = router;
