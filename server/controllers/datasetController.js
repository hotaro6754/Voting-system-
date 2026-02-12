const { db } = require('../models/firebase');
const { v4: uuidv4 } = require('uuid');

const createDataset = async (req, res) => {
  try {
    const { name, description, rollNumbers } = req.body;

    if (!name || !rollNumbers || !Array.isArray(rollNumbers)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const datasetId = uuidv4();
    const datasetRef = db.collection('datasets').doc(datasetId);

    await datasetRef.set({
      datasetId,
      name,
      description,
      rollNumbers: [...new Set(rollNumbers)], // Remove duplicates
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ datasetId, message: 'Dataset created successfully' });
  } catch (error) {
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
      res.status(500).json({ message: error.message });
    }
};

const updateDataset = async (req, res) => {
    try {
      const { name, description, rollNumbers } = req.body;
      const datasetRef = db.collection('datasets').doc(req.params.id);

      const updateData = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (rollNumbers) updateData.rollNumbers = [...new Set(rollNumbers)];

      await datasetRef.update(updateData);
      res.json({ message: 'Dataset updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const deleteDataset = async (req, res) => {
    try {
      await db.collection('datasets').doc(req.params.id).delete();
      res.json({ message: 'Dataset deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

module.exports = { createDataset, getAllDatasets, getDatasetById, updateDataset, deleteDataset };
