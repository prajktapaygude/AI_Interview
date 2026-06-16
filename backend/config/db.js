require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  const retries = 3;
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-hub';
      console.log(`Attempting MongoDB connection ${i + 1}/${retries} to:`, mongoURI.replace(/\/\/.*?:[^@]*@/, '//***:***@'));
      
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      });
      
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All connection attempts failed:', lastError.message);
  console.warn('Server continuing without DB connection (some features may be limited)');
};

module.exports = connectDB;
