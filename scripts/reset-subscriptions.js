/**
 * Migration Script: Delete all old subscriptions and create free subscriptions for all users
 *
 * Run with: node scripts/reset-subscriptions.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not found in environment variables');
  process.exit(1);
}

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const subscriptionsCollection = db.collection('subscriptions');

    // 1. Delete all existing subscriptions
    const deleteResult = await subscriptionsCollection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} old subscriptions.`);

    // 2. Get all users
    const users = await usersCollection.find({}, { projection: { _id: 1 } }).toArray();
    console.log(`Found ${users.length} users.`);

    // 3. Create free subscriptions for all users
    const now = new Date();
    const subscriptions = users.map(user => ({
      user: user._id,
      plan: 'free',
      billingCycle: 'monthly',
      duration: '1 month',
      status: 'active',
      startDate: now,
      endDate: null,
      autoRenew: false,
      amount: 0,
      currency: 'INR',
      features: {
        unlimitedQuizzes: false,
        detailedAnalytics: false,
        prioritySupport: false,
        customCategories: false,
        advancedReports: false,
        exportData: false,
        apiAccess: false,
        whiteLabel: false
      },
      createdAt: now,
      updatedAt: now
    }));

    const insertResult = await subscriptionsCollection.insertMany(subscriptions);
    console.log(`Created ${insertResult.insertedCount} free subscriptions.`);

    // 4. Update all users: set currentSubscription, subscriptionStatus=free, clear expiry
    // Build a map of userId -> new subscriptionId
    const insertedIds = insertResult.insertedIds; // { 0: ObjectId, 1: ObjectId, ... }
    const bulkOps = users.map((user, i) => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            currentSubscription: insertedIds[i],
            subscriptionStatus: 'free',
            subscriptionExpiry: null
          }
        }
      }
    }));

    const bulkResult = await usersCollection.bulkWrite(bulkOps);
    console.log(`Updated ${bulkResult.modifiedCount} users with free subscription references.`);

    console.log('\nDone.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
