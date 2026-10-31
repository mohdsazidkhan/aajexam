import mongoose from 'mongoose';
import '@/models/ExamCategory';
import '@/models/Exam';
import '@/models/ExamPattern';
import '@/models/PracticeTest';
import '@/models/UserTestAttempt';
import '@/models/User';
import '@/models/Blog';
import '@/models/Reel';
import '@/models/ReelInteraction';
import '@/models/Subject';
import '@/models/Topic';
import '@/models/Question';
import '@/models/Quiz';
import '@/models/QuizAttempt';
import '@/models/UserStreak';
import '@/models/DailyChallenge';
import '@/models/DailyChallengeAttempt';
import '@/models/RevisionQueue';
import '@/models/CurrentAffair';
import '@/models/ExamNews';
import '@/models/StudyNote';
import '@/models/StudyPlan';
import '@/models/MentorProfile';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// `next build` renders hundreds of pages at once from a few workers; a pool of 3 makes their queries
// queue for ~10s each. Runtime (serverless) keeps the small pool below.
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Serverless: every warm instance holds its own pool, and the M0 cap is
      // 500 connections cluster-wide, so keep each pool small and let idle
      // sockets go quickly.
      maxPoolSize: IS_BUILD ? 20 : 3,
      // Keep one socket warm for a minute: closing idle sockets after 10s made most requests on a
      // warm function pay a fresh TLS handshake to Atlas (the biggest chunk of the 1-4s API times).
      minPoolSize: IS_BUILD ? 0 : 1,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
