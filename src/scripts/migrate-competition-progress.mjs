/**
 * Migration: User embedded competition progress → CompetitionProgress collection
 *
 * Run once: `node src/scripts/migrate-competition-progress.js`
 * Safe to re-run (uses upsert — idempotent).
 *
 * What this does:
 *  1. For each User, reads {dailyProgress, weeklyProgress, monthlyProgress}
 *  2. Inserts a CompetitionProgress document for each non-empty period
 *  3. Adds globalLevel field to each User (total lifetime quiz attempts)
 *  4. DOES NOT remove the old embedded fields (backward compat during rollout)
 *     → Remove them in phase 2 of migration after verifying all reads use the new collection
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// ── Models (inline to avoid Next.js module resolution issues) ─────────────────
const CompetitionProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type:   { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    period: { type: String, required: true },
    highScoreWins:       { type: Number, default: 0 },
    totalAttempts:       { type: Number, default: 0 },
    accuracy:            { type: Number, default: 0 },
    totalScore:          { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    currentLevel:        { type: Number, default: 0 },
    levelName:           { type: String, default: 'Starter' },
    rewardEligible:      { type: Boolean, default: false },
    rewardRank:          { type: Number, default: null },
    periodStatus:        { type: String, default: 'open' },
}, { timestamps: true });
CompetitionProgressSchema.index({ userId: 1, type: 1, period: 1 }, { unique: true });

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

async function main() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI not found in environment');

    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    const CompetitionProgress = mongoose.models.CompetitionProgress
        || mongoose.model('CompetitionProgress', CompetitionProgressSchema);

    // Fetch all users with progress data
    const User = mongoose.model('User');
    const cursor = User.find({}).select(
        'dailyProgress weeklyProgress monthlyProgress walletBalance'
    ).lean().cursor();

    let processed = 0;
    let skipped   = 0;
    let errors    = 0;
    const BATCH   = [];

    console.log('🔄 Starting migration...\n');

    for await (const user of cursor) {
        const docs = [];

        // dailyProgress
        if (user.dailyProgress?.date && user.dailyProgress?.totalQuizAttempts > 0) {
            docs.push({
                userId:              user._id,
                type:                'daily',
                period:              user.dailyProgress.date,
                highScoreWins:       user.dailyProgress.highScoreWins || 0,
                totalAttempts:       user.dailyProgress.totalQuizAttempts || 0,
                accuracy:            user.dailyProgress.accuracy || 0,
                totalScore:          user.dailyProgress.totalScore || 0,
                totalCorrectAnswers: user.dailyProgress.totalCorrectAnswers || 0,
                currentLevel:        user.dailyProgress.currentLevel || 0,
                levelName:           user.dailyProgress.levelName || 'Starter',
                rewardEligible:      user.dailyProgress.rewardEligible || false,
                rewardRank:          user.dailyProgress.rewardRank || null,
                periodStatus:        'closed' // historic data is always closed
            });
        }

        // weeklyProgress
        if (user.weeklyProgress?.week && user.weeklyProgress?.totalQuizAttempts > 0) {
            docs.push({
                userId:              user._id,
                type:                'weekly',
                period:              user.weeklyProgress.week,
                highScoreWins:       user.weeklyProgress.highScoreWins || 0,
                totalAttempts:       user.weeklyProgress.totalQuizAttempts || 0,
                accuracy:            user.weeklyProgress.accuracy || 0,
                totalScore:          user.weeklyProgress.totalScore || 0,
                totalCorrectAnswers: user.weeklyProgress.totalCorrectAnswers || 0,
                currentLevel:        user.weeklyProgress.currentLevel || 0,
                levelName:           user.weeklyProgress.levelName || 'Starter',
                rewardEligible:      user.weeklyProgress.rewardEligible || false,
                rewardRank:          user.weeklyProgress.rewardRank || null,
                periodStatus:        'closed'
            });
        }

        // monthlyProgress
        if (user.monthlyProgress?.month && user.monthlyProgress?.totalQuizAttempts > 0) {
            docs.push({
                userId:              user._id,
                type:                'monthly',
                period:              user.monthlyProgress.month,
                highScoreWins:       user.monthlyProgress.highScoreWins || 0,
                totalAttempts:       user.monthlyProgress.totalQuizAttempts || 0,
                accuracy:            user.monthlyProgress.accuracy || 0,
                totalScore:          user.monthlyProgress.totalScore || 0,
                totalCorrectAnswers: user.monthlyProgress.totalCorrectAnswers || 0,
                currentLevel:        user.monthlyProgress.currentLevel || 0,
                levelName:           user.monthlyProgress.levelName || 'Starter',
                rewardEligible:      user.monthlyProgress.rewardEligible || false,
                rewardRank:          user.monthlyProgress.rewardRank || null,
                periodStatus:        'closed'
            });
        }

        if (docs.length === 0) {
            skipped++;
            continue;
        }

        BATCH.push(...docs);

        // Process in batches of 500
        if (BATCH.length >= 500) {
            try {
                const ops = BATCH.map(doc => ({
                    updateOne: {
                        filter: { userId: doc.userId, type: doc.type, period: doc.period },
                        update: { $setOnInsert: doc },
                        upsert: true
                    }
                }));
                const result = await CompetitionProgress.bulkWrite(ops, { ordered: false });
                console.log(`  ✅ Batch: upserted=${result.upsertedCount}, matched=${result.matchedCount}`);
            } catch (err) {
                console.error('  ❌ Batch error:', err.message);
                errors++;
            }
            BATCH.length = 0; // clear batch
        }

        processed++;
        if (processed % 1000 === 0) console.log(`  → Processed ${processed} users...`);
    }

    // Final batch
    if (BATCH.length > 0) {
        try {
            const ops = BATCH.map(doc => ({
                updateOne: {
                    filter: { userId: doc.userId, type: doc.type, period: doc.period },
                    update: { $setOnInsert: doc },
                    upsert: true
                }
            }));
            await CompetitionProgress.bulkWrite(ops, { ordered: false });
        } catch (err) {
            console.error('Final batch error:', err.message);
        }
    }

    // ── Add globalLevel field to all Users ────────────────────────────────────
    console.log('\n🔄 Adding globalLevel to User documents...');
    // globalLevel = max of monthly currentLevel (best proxy for all-time level)
    await User.updateMany(
        { globalLevel: { $exists: false } },
        [{ $set: { globalLevel: { $ifNull: ['$monthlyProgress.currentLevel', 0] } } }]
    );
    console.log('  ✅ globalLevel added');

    // ── Update Level Requirements ─────────────────────────────────────────────
    console.log('\n🔄 Syncing level requirements...');
    const Level = mongoose.model('Level');
    for (const [levelNum, config] of Object.entries(NEW_LEVEL_CONFIG)) {
        await Level.findOneAndUpdate(
            { levelNumber: parseInt(levelNum) },
            { 
                $set: { 
                    name: config.name,
                    description: config.description,
                    quizzesRequired: config.quizzesRequired
                } 
            },
            { upsert: true }
        );
    }
    console.log('  ✅ level requirements synchronized');

    console.log(`\n🎉 Migration complete!`);
    console.log(`   Processed: ${processed} users`);
    console.log(`   Skipped:   ${skipped} users (no progress data)`);
    console.log(`   Errors:    ${errors} batch errors`);
    console.log('\n⚠️  NOTE: Old embedded fields (dailyProgress, weeklyProgress, monthlyProgress) still');
    console.log('   exist on User docs. Remove them ONLY after verifying all reads use CompetitionProgress.');

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
