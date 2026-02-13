const { db } = require('./firebase');

const seedCseB = async () => {
  try {
    if (!db) {
        console.error('Firestore not initialized. Ensure FIREBASE_SERVICE_ACCOUNT is set.');
        process.exit(1);
    }

    const sessionId = 'cse-b-session';
    const sessionName = 'CSE B';

    // 1. Create or Update the Session metadata
    const sessionRef = db.collection('sessions').doc(sessionId);
    await sessionRef.set({
      sessionId,
      name: sessionName,
      datasetName: 'CSE B Hex Dataset',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      allowSelfVote: true,
      resultsVisibility: 'public',
      status: 'active',
      createdAt: new Date().toISOString()
    });

    // 2. Generate Roll Numbers
    const rollNumbers = [];
    const prefix = '25kd1a05';
    let count = 0;

    const h1s = ['6', '7', '8', '9', 'a', 'b', 'c'];
    const h2s = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (const h1 of h1s) {
        for (const h2 of h2s) {
            if (h1 === '6' && h2 < '2') continue; // Start at 62

            const roll = prefix + h1 + h2;
            rollNumbers.push(roll);
            count++;

            if (count === 60) break;
            if (h1 === 'c' && h2 === '2') break; // End at c2 if reached before 60
        }
        if (count === 60) break;
    }

    console.log(`Generated ${rollNumbers.length} roll numbers. Last one: ${rollNumbers[rollNumbers.length-1]}`);

    // 3. Seed Students into sessions/{sessionId}/students
    const batch = db.batch();
    const studentsCol = sessionRef.collection('students');

    for (const rollNo of rollNumbers) {
        const studentDoc = studentsCol.doc(rollNo);
        batch.set(studentDoc, {
            rollNo,
            hasVoted: false,
            votedAt: null
        });
    }

    await batch.commit();
    console.log(`Successfully seeded session '${sessionName}' with ${rollNumbers.length} students.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding CSE B session:', error);
    process.exit(1);
  }
};

seedCseB();
