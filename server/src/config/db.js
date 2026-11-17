import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { syncFromMongoDB } from '../utils/dataStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const DB_NAME = 'togethercinema';

let isMongoConnected = false;
let lastError = null;

function redact(value) {
  return String(value)
    .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, 'mongodb://***')
    .replace(/\/\/([^:@/\s]+):([^@/\s]+)@/g, '//$1:***@');
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    isMongoConnected = false;
    lastError = 'MONGODB_URI is missing. Add it to Render environment variables or server/.env';
    console.warn('⚠️  MONGODB_URI not provided. Running in memory / JSON store fallback mode.');
    return getDBStatus();
  }

  try {
    await mongoose.connect(uri, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 10000,
    });
    await mongoose.connection.db.command({ ping: 1 });

    // Atlas creates the database on first write
    await mongoose.connection.db.collection('_meta').updateOne(
      { _id: 'bootstrap' },
      { $set: { name: DB_NAME, app: 'together-cinema', checkedAt: new Date() } },
      { upsert: true }
    );
    isMongoConnected = true;
    lastError = null;
    console.log(`✅ Connected to MongoDB Atlas database "${DB_NAME}" on ${mongoose.connection.host}`);

    // Synchronize initial data / seed data
    await syncFromMongoDB();
  } catch (err) {
    isMongoConnected = false;
    lastError = redact(err.message);
    console.error('⚠️  MongoDB connection failed:', lastError);
    console.log('ℹ️  Using the embedded JSON database fallback until MongoDB is reachable.');
  }

  return getDBStatus();
};

export const getDBStatus = () => ({
  isMongoConnected,
  type: isMongoConnected ? 'mongodb' : 'json-store',
  name: isMongoConnected ? DB_NAME : null,
  error: lastError,
});
