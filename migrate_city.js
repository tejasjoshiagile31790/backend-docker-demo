import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not defined in .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Update all users missing city field to set empty string
    const result = await User.updateMany(
      { city: { $exists: false } },
      { $set: { city: '' } }
    );

    console.log(`Updated ${result.nModified} users with default city`);

    // Also ensure age is number (if stored as string)
    const users = await User.find();
    for (let user of users) {
      if (typeof user.age === 'string') {
        await User.updateOne({ _id: user._id }, { $set: { age: parseInt(user.age, 10) } });
      }
    }

    console.log('Migration complete');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  });