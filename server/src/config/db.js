import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/together_cinema';
  try {
    // Attempt fast connection with 2.5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB at:', uri);
  } catch (err) {
    isMongoConnected = false;
    console.log('ℹ️ MongoDB not detected locally, using resilient embedded JSON database.');
    console.log('   All data (users, rooms, movies, messages) will be safely persisted in server/data/db.json');
  }
};

export const getDBStatus = () => ({
  isMongoConnected,
  type: isMongoConnected ? 'mongodb' : 'json-store',
});
