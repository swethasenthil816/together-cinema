import mongoose from 'mongoose';
import { connectDB, DB_NAME } from './db.js';

const status = await connectDB();

if (!status.isMongoConnected) {
  console.error('Database connection test failed.');
  if (status.error) console.error(status.error);
  process.exit(1);
}

const names = (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name);
console.log(JSON.stringify({
  ok: true,
  database: mongoose.connection.db.databaseName,
  expected: DB_NAME,
  host: mongoose.connection.host,
  collections: names,
}, null, 2));

await mongoose.disconnect();
