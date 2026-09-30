// backend/src/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow all origins for development
app.use(express.json()); // Parse JSON bodies

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB connection via Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB----');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/api/health', (_req, res) => {
  console.log('Health check endpoint called');

  res.json({ status: 'ok' });
});

// Get users endpoint
app.get('/api/users', async (_req, res) => {
  try {
    console.log('Fetching users from MongoDB');
    const users = await User.find({});
    // Convert Mongoose documents to plain objects with _id as string
    const serializedUsers = users.map(user => ({
      ...user.toObject(),
      _id: user._id.toString()
    }));
    console.log(`Fetched ${serializedUsers.length} users`);
    res.json(serializedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    console.log(`Fetching user with id: ${req.params.id}`);
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ ...user.toObject(), _id: user._id.toString() });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  console.log('Create user endpoint called');
  const { name, email, age, city } = req.body;
  // Basic validation
  if (!name || !email || !age || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const user = new User({ name, email, age, city });
    const savedUser = await user.save();
    console.log(`User created with id: ${savedUser._id}`);
    res.status(201).json({
      message: 'User created successfully',
      user: { ...savedUser.toObject(), _id: savedUser._id.toString() }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  console.log(`Update user endpoint called for id: ${req.params.id}`);
  const { name, email, age, city } = req.body;
  // Basic validation
  if (!name || !email || !age || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age, city },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`User updated: ${user._id}`);
    res.json({
      message: 'User updated successfully',
      user: { ...user.toObject(), _id: user._id.toString() }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  console.log(`Delete user endpoint called for id: ${req.params.id}`);
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`User deleted: ${user._id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Seed users endpoint
app.post('/api/seed', async (req, res) => {
  console.log('Seed endpoint called');
  const { password } = req.body;
  if (password !== 'ADMIN') {
    console.log('Unauthorized seed attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create seed users
    const usersToInsert = Array.from({ length: 10 }, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    }));

    const result = await User.insertMany(usersToInsert);
    console.log(`Seeded ${result.length} users`);
    res.json({
      message: `Seeded ${result.length} users`,
      insertedIds: result.map(user => user._id)
    });
  } catch (err) {
    console.error('Error seeding users:', err);
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