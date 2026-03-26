const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkUser(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Dynamically load models
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', new mongoose.Schema({}, { strict: false }));
    const WithdrawRequest = mongoose.models.WithdrawRequest || mongoose.model('WithdrawRequest', new mongoose.Schema({}, { strict: false }));

    const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });
    
    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    // ── FINAL FORMULA ──────────────────────────────────────────
    // walletBalance = Sum(Credits, completed) - Sum(WithdrawRequest, paid)
    const [creditAgg, debitAgg, claimableAgg] = await Promise.all([
        WalletTransaction.aggregate([
            { 
                $match: { 
                    user: user._id, 
                    status: 'completed',
                    type: 'credit',
                    category: { $in: ['blog_reward', 'quiz_reward', 'question_reward', 'bonus', 'referral'] }
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        WithdrawRequest.aggregate([
            { 
                $match: { 
                    userId: user._id, 
                    status: 'paid' 
                } 
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        WalletTransaction.aggregate([
            { $match: { user: user._id, status: 'completed', category: 'competition_reward' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
    ]);

    const totalCredits = creditAgg[0]?.total || 0;
    const totalPaid = debitAgg[0]?.total || 0;
    const walletBalance = totalCredits - totalPaid;
    const claimable = claimableAgg[0]?.total || 0;

    console.log('--- FINAL FORMULA SUMMARY ---');
    console.log(`Email: ${user.email}`);
    console.log(`FINAL Wallet Balance (Trans): ₹${walletBalance}`);
    console.log(`FINAL Claimable (Trans): ₹${claimable}`);
    console.log('-----------------------------');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

const targetEmail = process.argv[2] || 'sajidpahat786@gmail.com';
checkUser(targetEmail);
