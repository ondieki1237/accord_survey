import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accord-survey';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;

  try {
    const coll = db.collection('votes');
    const indexes = await coll.indexes();
    console.log('Existing indexes:', indexes.map(i => i.name));

    // Drop old index if exists (reviewCycleId_1_deviceHash_1)
    const oldName = 'reviewCycleId_1_deviceHash_1';
    const newName = 'reviewCycleId_1_deviceHash_1_targetEmployeeId_1';

    if (indexes.some(i => i.name === oldName)) {
      console.log('Dropping old index:', oldName);
      await coll.dropIndex(oldName);
    }

    // Create new unique index
    const existsNew = indexes.some(i => i.name === newName || (i.key && i.key.targetEmployeeId));
    if (!existsNew) {
      console.log('Creating new unique index on reviewCycleId + deviceHash + targetEmployeeId');
      await coll.createIndex({ reviewCycleId: 1, deviceHash: 1, targetEmployeeId: 1 }, { unique: true, name: newName });
    } else {
      console.log('New index already exists');
    }

    console.log('Index fix complete');
  } catch (err) {
    console.error('Error fixing indexes:', err);
  } finally {
    process.exit(0);
  }
}

run();
