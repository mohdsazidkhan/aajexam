const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function syncWallets() {
  try {
    console.log('--- STARTING WALLET SYNC ---');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // Load models (strict: false to handle any existing data)
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', new mongoose.Schema({}, { strict: false }));
    const WithdrawRequest = mongoose.models.WithdrawRequest || mongoose.model('WithdrawRequest', new mongoose.Schema({}, { strict: false }));

    const users = await User.find({});
    console.log(`Found ${users.length} users to process.`);

    for (const user of users) {
      // 1. Calculate Withdrawable Balance
      // Categories: blog_reward, quiz_reward, question_reward, bonus, referral
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

      const debitAgg = await WithdrawRequest.aggregate([
        { 
          $match: { 
            userId: user._id, 
            status: 'paid' 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const totalCredits = creditAgg[0]?.total || 0;
      const totalPaid = debitAgg[0]?.total || 0;
      const newWalletBalance = totalCredits - totalPaid;

      // 2. Calculate Claimable Rewards
      const claimableAgg = await WalletTransaction.aggregate([
        { $match: { user: user._id, status: 'completed', category: 'competition_reward' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const newClaimableRewards = claimableAgg[0]?.total || 0;

      // 3. Update User if changed
      const oldBalance = user.walletBalance || 0;
      const oldClaimable = user.claimableRewards || 0;

      if (oldBalance !== newWalletBalance || oldClaimable !== newClaimableRewards) {
        console.log(`Updating ${user.email}:`);
        console.log(`  Wallet: ₹${oldBalance} -> ₹${newWalletBalance}`);
        console.log(`  Claimable: ₹${oldClaimable} -> ₹${newClaimableRewards}`);
        
        await User.findByIdAndUpdate(user._id, {
          $set: {
            walletBalance: newWalletBalance,
            claimableRewards: newClaimableRewards
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

syncWallets();
