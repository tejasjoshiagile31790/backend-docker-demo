// backend/seed.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  { name: 'John Doe', email: 'john@example.com', age: 30 },
  { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
  { name: 'Michael Brown', email: 'michael@example.com', age: 35 },
  { name: 'Emily Davis', email: 'emily@example.com', age: 28 },
  { name: 'David Wilson', email: 'david@example.com', age: 40 },
  { name: 'Sarah Miller', email: 'sarah@example.com', age: 32 },
  { name: 'Daniel Taylor', email: 'daniel@example.com', age: 27 },
  { name: 'Olivia Anderson', email: 'olivia@example.com', age: 29 },
  { name: 'James Thomas', email: 'james@example.com', age: 33 },
  { name: 'Sophia Jackson', email: 'sophia@example.com', age: 26 }
];

const seedUsers = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(); // Use default database from URI
    const collection = db.collection('users');

    // Check if collection already has data to avoid duplicates
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`Collection already has ${existingCount} users. Skipping seed.`);
      await client.close();
      return;
    }

    // Insert users
    const result = await collection.insertMany(users);
    console.log(`Inserted ${result.insertedCount} users`);

    await client.close();
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();