
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from the project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI not found in .env');
  process.exit(1);
}

async function checkLevels() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const LevelSchema = new mongoose.Schema({
      levelNumber: Number,
      name: String,
      quizzesRequired: Number
    });

    const Level = mongoose.models.Level || mongoose.model('Level', LevelSchema);

    const levels = await Level.find({}).sort({ levelNumber: 1 });

    console.log('\n--- Current Level Requirements in DB ---');
    levels.forEach(l => {
      console.log(`Level ${l.levelNumber}: ${l.name} - Quizzes Required: ${l.quizzesRequired}`);
    });
    console.log('----------------------------------------\n');

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLevels();
