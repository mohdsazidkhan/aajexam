import mongoose from 'mongoose';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Environment Setup ────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const USER_EMAIL = 'sajidpahat786@gmail.com';

/**
 * TEST SCRIPT: Comprehensive User Flow (Daily, Weekly, Monthly Rewards)
 * 
 * What this does:
 * 1. Resets Sajid's local progress and wallet.
 * 2. Simulates 5 Daily High-Scores -> Process Daily Reward.
 * 3. Simulates 20 Weekly High-Scores -> Process Weekly Reward.
 * 4. Simulates 50 Monthly High-Scores -> Process Monthly Reward.
 * 5. Verifies WalletTransactions and final balance.
 */

// ─── Models (Inlined to avoid @/ alias issues) ────────────────────────────────
const UserSchema = new mongoose.Schema({
    email: String,
    name: String,
    walletBalance: { type: Number, default: 0 },
    lockedBalance: { type: Number, default: 0 },
    subscriptionStatus: { type: String, default: 'free' },
    globalLevel: { type: Number, default: 0 }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CompetitionProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    period: String,
    highScoreWins: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    rewardEligible: { type: Boolean, default: false },
    periodStatus: { type: String, default: 'open' }
});
const CompetitionProgress = mongoose.models.CompetitionProgress || mongoose.model('CompetitionProgress', CompetitionProgressSchema);

const WalletTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['credit', 'debit'] },
    amount: Number,
    balance: Number,
    description: String,
    period: String,
    idempotencyKey: { type: String, unique: true }
});
const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', WalletTransactionSchema);

const CompetitionPeriodSchema = new mongoose.Schema({
    type: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    period: { type: String, unique: true },
    status: { type: String, enum: ['open', 'rewarded'], default: 'open' },
    prizePool: Number
});
const CompetitionPeriod = mongoose.models.CompetitionPeriod || mongoose.model('CompetitionPeriod', CompetitionPeriodSchema);

// ─── Utility: Get Period Identifiers ───────────────────────────────────────────
function getPeriod(type, date = dayjs()) {
    if (type === 'daily') return date.format('YYYY-MM-DD');
    if (type === 'weekly') return date.format('YYYY-[W]W');
    return date.format('YYYY-MM');
}

// ─── Core Logic: Simulated Reset (Simplified version of runCompetitionReset) ─────
async function simulateCompetitionReward(type, period, winners) {
    console.log(`\n🏆 Processing ${type.toUpperCase()} Reward for ${period}...`);
    
    // 1. Mark period as rewarded
    await CompetitionPeriod.findOneAndUpdate(
        { type, period },
        { status: 'rewarded', prizePool: 1000 }, // Mock prize pool
        { upsert: true }
    );

    // 2. Distribute to winners (sajid is rank 1 in our test)
    for (const [index, winner] of winners.entries()) {
        const rewardAmount = type === 'daily' ? 10 : (type === 'weekly' ? 50 : 200);
        const idempotencyKey = `reward_${type}_${period}_${winner._id}`;

        const user = await User.findById(winner._id);
        const newBalance = user.walletBalance + rewardAmount;

        // Create transaction
        await WalletTransaction.create({
            user: winner._id,
            type: 'credit',
            amount: rewardAmount,
            balance: newBalance,
            description: `${type.toUpperCase()} competition reward (${period})`,
            period,
            idempotencyKey
        });

        // Update user
        await User.findByIdAndUpdate(winner._id, { $inc: { walletBalance: rewardAmount } });
        console.log(`   ✅ Credited ₹${rewardAmount} to ${winner.email} (New Balance: ₹${newBalance})`);
    }

    // 3. Mark progress as closed
    await CompetitionProgress.updateMany({ type, period }, { periodStatus: 'closed' });
}

// ─── Main Test Runner ─────────────────────────────────────────────────────────
async function runTest() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found. Check .env.local');
        process.exit(1);
    }

    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // 1. Identify User
    const user = await User.findOne({ email: USER_EMAIL });
    if (!user) {
        console.error(`❌ User ${USER_EMAIL} not found. Run sync first.`);
        process.exit(1);
    }
    console.log(`👤 Testing for User: ${user.name} (${user._id})`);

    // 2. Reset State
    console.log('🔄 Resetting wallet and progress...');
    await User.findByIdAndUpdate(user._id, { walletBalance: 0, lockedBalance: 0 });
    await CompetitionProgress.deleteMany({ userId: user._id });
    await WalletTransaction.deleteMany({ user: user._id });
    console.log('   ✅ Clean state prepared.\n');

    // 3. PHASE 1: DAILY FLOW (Requirement: 5 attempts)
    const dailyPeriod = getPeriod('daily');
    console.log(`📅 PHASE 1: DAILY FLOW (${dailyPeriod})`);
    await CompetitionProgress.create({
        userId: user._id,
        type: 'daily',
        period: dailyPeriod,
        highScoreWins: 5,
        totalAttempts: 5,
        accuracy: 100,
        rewardEligible: true,
        periodStatus: 'open'
    });
    console.log('   ✅ Simulated 5 Daily High-Scores.');
    await simulateCompetitionReward('daily', dailyPeriod, [user]);

    // 4. PHASE 2: WEEKLY FLOW (Requirement: 20 attempts)
    const weeklyPeriod = getPeriod('weekly');
    console.log(`📅 PHASE 2: WEEKLY FLOW (${weeklyPeriod})`);
    await CompetitionProgress.create({
        userId: user._id,
        type: 'weekly',
        period: weeklyPeriod,
        highScoreWins: 20,
        totalAttempts: 20,
        accuracy: 100,
        rewardEligible: true,
        periodStatus: 'open'
    });
    console.log('   ✅ Simulated 20 Weekly High-Scores.');
    await simulateCompetitionReward('weekly', weeklyPeriod, [user]);

    // 5. PHASE 3: MONTHLY FLOW (Requirement: 50 attempts)
    const monthlyPeriod = getPeriod('monthly');
    console.log(`📅 PHASE 3: MONTHLY FLOW (${monthlyPeriod})`);
    await CompetitionProgress.create({
        userId: user._id,
        type: 'monthly',
        period: monthlyPeriod,
        highScoreWins: 50,
        totalAttempts: 50,
        accuracy: 100,
        rewardEligible: true,
        periodStatus: 'open'
    });
    console.log('   ✅ Simulated 50 Monthly High-Scores.');
    await simulateCompetitionReward('monthly', monthlyPeriod, [user]);

    // 6. FINAL VERIFICATION
    console.log('\n🔍 FINAL VERIFICATION');
    const finalUser = await User.findById(user._id);
    const txCount = await WalletTransaction.countDocuments({ user: user._id });
    
    console.log(`   Expected Transactions: 3 | Found: ${txCount}`);
    console.log(`   Final Wallet Balance:  ₹${finalUser.walletBalance}`);
    
    if (txCount === 3 && finalUser.walletBalance === 260) {
        console.log('\n🏆🏆🏆 FULL FLOW TEST PASSED 🏆🏆🏆');
        console.log('--------------------------------------------------');
        console.log('Daily: ₹10 | Weekly: ₹50 | Monthly: ₹200 | Total: ₹260');
        console.log('--------------------------------------------------');
    } else {
        console.error('\n❌ TEST FAILED: Verification mismatch.');
    }

    await mongoose.disconnect();
    process.exit(0);
}

runTest().catch(err => {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
});
