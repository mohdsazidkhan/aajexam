const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function syncAllUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully!');

        // Dynamically load models
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', new mongoose.Schema({}, { strict: false }));
        const WithdrawRequest = mongoose.models.WithdrawRequest || mongoose.model('WithdrawRequest', new mongoose.Schema({}, { strict: false }));

        const users = await User.find({});
        console.log(`Found ${users.length} users. Starting sync...`);

        for (const user of users) {
            // 1. Calculate Credits (Withdrawable)
            const creditAgg = await WalletTransaction.aggregate([
                { 
                    $match: { 
                        user: user._id, 
                        status: 'completed',
                        type: 'credit',
                        category: { $in: ['blog_reward', 'quiz_reward', 'question_reward', 'bonus', 'referral'] }
                    } 
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            // 2. Calculate Debits (Paid Withdrawals)
            const debitAgg = await WithdrawRequest.aggregate([
                { 
                    $match: { 
                        userId: user._id, 
                        status: 'paid' 
                    } 
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            // 3. Calculate Claimable (Competition Rewards)
            const claimableAgg = await WalletTransaction.aggregate([
                { $match: { user: user._id, status: 'completed', category: 'competition_reward' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const totalCredits = creditAgg[0]?.total || 0;
            const totalPaid = debitAgg[0]?.total || 0;
            const newWalletBalance = totalCredits - totalPaid;
            const newClaimable = claimableAgg[0]?.total || 0;

            // Update user if needed
            if (user.walletBalance !== newWalletBalance || user.claimableRewards !== newClaimable) {
                console.log(`Updating ${user.email || user._id}: Balance ₹${user.walletBalance || 0} -> ₹${newWalletBalance}, Claimable ₹${user.claimableRewards || 0} -> ₹${newClaimable}`);
                await User.findByIdAndUpdate(user._id, {
                    $set: {
                        walletBalance: newWalletBalance,
                        claimableRewards: newClaimable
                    }
                });
            }
        }

        console.log('--- SYNC COMPLETED ---');

    } catch (err) {
        console.error('Error during sync:', err);
    } finally {
        await mongoose.disconnect();
    }
}

syncAllUsers();
