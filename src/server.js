// backend/src/server.js
import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow all origins for development
app.use(express.json()); // Parse JSON bodies

// MongoDB connection
let db;
const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB----');
    db = client.db(); // Gets default database from URI or use client.db('react_docker_demo')
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  
  res.json({ status: 'ok' });
});

// Get users endpoint
app.get('/api/users', async (req, res) => {
  try {
    console.log('Fetching users from MongoDB');
    const collection = db.collection('users');
    const users = await collection.find({}).toArray();
    // Convert ObjectId to string for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));
    console.log(`Fetched ${serializedUsers.length} users`);
    res.json(serializedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const startServer = async () => {
  await connectDB();
  // app.listen(PORT, () => {
  //   console.log(`Server running on http://localhost:${PORT}`);
  // });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;