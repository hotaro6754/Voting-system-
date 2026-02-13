const { db } = require('../models/firebase');
const { v4: uuidv4 } = require('uuid');

const createDataset = async (req, res) => {
  try {
    const { name, description, rollNumbers } = req.body;

    if (!name || !rollNumbers || !Array.isArray(rollNumbers)) {
      return res.status(400).json({ message: 'Invalid dataset data' });
    }

    const datasetId = uuidv4();
    const datasetRef = db.collection('datasets').doc(datasetId);

    await datasetRef.set({
      datasetId,
      name,
      description,
      rollNumbers,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ datasetId, message: 'Dataset created successfully' });
  } catch (error) {
    console.error('CREATE_DATASET_ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllDatasets = async (req, res) => {
  try {
    const snapshot = await db.collection('datasets').get();
    const datasets = [];
    snapshot.forEach(doc => datasets.push(doc.data()));
    res.json(datasets);
  } catch (error) {
    console.error('GET_ALL_DATASETS_ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

const getDatasetById = async (req, res) => {
    try {
      const datasetDoc = await db.collection('datasets').doc(req.params.id).get();
      if (!datasetDoc.exists) {
        return res.status(404).json({ message: 'Dataset not found' });
      }
      res.json(datasetDoc.data());
    } catch (error) {
      console.error('GET_DATASET_BY_ID_ERROR:', error);
      res.status(500).json({ message: error.message });
    }
};

const deleteDataset = async (req, res) => {
    try {
      await db.collection('datasets').doc(req.params.id).delete();
      res.json({ message: 'Dataset deleted successfully' });
    } catch (error) {
      console.error('DELETE_DATASET_ERROR:', error);
      res.status(500).json({ message: error.message });
    }
};

module.exports = { createDataset, getAllDatasets, getDatasetById, deleteDataset };
