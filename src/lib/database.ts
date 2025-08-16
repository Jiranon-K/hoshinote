import mongoose from 'mongoose'
import { logger } from './logger'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      logger.info('✅ MongoDB connected successfully')
      return mongoose
    }).catch((error) => {
      logger.error('❌ MongoDB connection failed:', error.message)
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    logger.error('❌ Database connection error:', e)
    throw new Error('Failed to connect to database. Please check your connection.')
  }

  return cached.conn
}

export default dbConnect