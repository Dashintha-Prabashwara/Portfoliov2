import mongoose from 'mongoose';
import { getValidatedEnv } from './env.js';

const env = getValidatedEnv();

if (!env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 *
 * This is critical for Vercel serverless functions to reuse connections
 * and avoid hitting MongoDB connection limits.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Implements connection caching to optimize for serverless environments.
 *
 * @returns {Promise<typeof mongoose>} Mongoose instance
 */
async function connectToDatabase() {
  // If we have a cached connection, return it
  if (cached.conn) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Using cached MongoDB connection');
    }
    return cached.conn;
  }

  // If we don't have a connection promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating new MongoDB connection...');
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('MongoDB connected successfully');
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    if (process.env.NODE_ENV === 'development') {
      console.error('MongoDB connection error:', e);
    }
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
