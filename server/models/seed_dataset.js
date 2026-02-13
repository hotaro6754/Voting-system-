const { db } = require('./firebase');
const { v4: uuidv4 } = require('uuid');

const seedDataset = async () => {
  try {
    if (!db) {
        console.error('Firestore not initialized. Ensure FIREBASE_SERVICE_ACCOUNT is set.');
        process.exit(1);
    }

    const name = 'CSE B - Class of 2026';
    const description = 'Official roll numbers for Computer Science Engineering Section B';

    // Generate roll numbers 22BCE001 to 22BCE060
    const rollNumbers = [];
    for (let i = 1; i <= 60; i++) {
        rollNumbers.push(`22BCE${i.toString().padStart(3, '0')}`);
    }

    const datasetId = 'cse-b-2026'; // Fixed ID for easy reference
    const datasetRef = db.collection('datasets').doc(datasetId);

    await datasetRef.set({
      datasetId,
      name,
      description,
      rollNumbers,
      createdAt: new Date().toISOString()
    });

    console.log(`Successfully seeded dataset: ${name} with ${rollNumbers.length} roll numbers.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding dataset:', error);
    process.exit(1);
  }
};

seedDataset();
