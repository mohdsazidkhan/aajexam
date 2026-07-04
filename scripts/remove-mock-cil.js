import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const PracticeTestSchema = new mongoose.Schema({ slug: String });
const PracticeTest = mongoose.models.PracticeTest || mongoose.model('PracticeTest', PracticeTestSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const result = await PracticeTest.deleteOne({ slug: 'cil-mt-2024-mock' });
    console.log('Deleted Mock Exam:', result.deletedCount);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}
run();
