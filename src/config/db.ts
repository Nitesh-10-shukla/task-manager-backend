import mongoose from 'mongoose';
import { logError, logInfo } from '../utils/logger';

const connectDB = async (retries = 5): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const options = {
      serverSelectionTimeoutMS: 10000, // Longer timeout for server selection
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    logInfo('✅ MongoDB Connected');
  } catch (error: any) {
    logError(error);

    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n⚠️  MongoDB Connection Error:');
      console.error('1. Check if your IP is whitelisted in MongoDB Atlas');
      console.error('2. Verify the connection string in your .env file');
      console.error('3. Ensure MongoDB Atlas cluster is active');
      console.error('\nDetailed error:', error.message);
    }

    if (retries > 0) {
      console.log(`\n🔄 Retrying connection... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return connectDB(retries - 1);
    }

    console.error('\n❌ Failed to connect to MongoDB after multiple attempts');
    process.exit(1);
  }
};

export default connectDB;
