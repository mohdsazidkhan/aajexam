
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect environment: use .env.local if available, otherwise .env
// This script allows specifying which env file to use via argument
const envFile = process.argv[2] || '.env.local';
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(`MONGO_URI not found in ${envFile}`);
  process.exit(1);
}

const NEW_LEVEL_CONFIG = {
  0: { name: 'Starter', quizzesRequired: 0, description: 'Just registered - Start your journey!' },
  1: { name: 'Rookie', quizzesRequired: 5, description: 'Begin your quiz journey' },
  2: { name: 'Explorer', quizzesRequired: 10, description: 'Discover new challenges' },
  3: { name: 'Thinker', quizzesRequired: 15, description: 'Develop critical thinking' },
  4: { name: 'Strategist', quizzesRequired: 20, description: 'Master quiz strategies' },
  5: { name: 'Achiever', quizzesRequired: 25, description: 'Reach new heights' },
  6: { name: 'Mastermind', quizzesRequired: 30, description: 'Become a quiz expert' },
  7: { name: 'Champion', quizzesRequired: 35, description: 'Compete with the best' },
  8: { name: 'Prodigy', quizzesRequired: 40, description: 'Show exceptional talent' },
  9: { name: 'Wizard', quizzesRequired: 45, description: 'Complex questions across categories' },
  10: { name: 'Legend', quizzesRequired: 50, description: 'Ultimate quiz mastery' }
};

async function migrateLevels() {
  try {
    console.log(`Connecting to MongoDB (${envFile})...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const LevelSchema = new mongoose.Schema({
        levelNumber: { type: Number, unique: true },
        name: String,
        description: String,
        quizzesRequired: Number
    });

    const Level = mongoose.models.Level || mongoose.model('Level', LevelSchema);

    console.log('Starting migration...');

    for (const [levelNum, config] of Object.entries(NEW_LEVEL_CONFIG)) {
        const num = parseInt(levelNum);
        const result = await Level.findOneAndUpdate(
            { levelNumber: num },
            { 
                $set: { 
                    name: config.name,
                    description: config.description,
                    quizzesRequired: config.quizzesRequired
                } 
            },
            { upsert: true, new: true }
        );
        console.log(`Updated Level ${num}: ${result.name} (${result.quizzesRequired} quizzes required)`);
    }

    console.log('Migration completed successfully.');
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateLevels();
