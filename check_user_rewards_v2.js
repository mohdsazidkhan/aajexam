const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI not found in .env.local');
    process.exit(1);
}

// Define Schemas (Minimal)
const walletTransactionSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    amount: Number,
    type: String,
    status: String,
    category: String,
    description: String,
    createdAt: Date
});

const userSchema = new mongoose.Schema({
    email: String,
    walletBalance: Number,
    claimableRewards: Number,
    isTopPerformer: Boolean,
});

const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUser(email) {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return;
        }

        console.log('\n--- User Info ---');
        console.log('ID:', user._id);
        console.log('Email:', user.email);
        console.log('Wallet Balance (Field):', user.walletBalance);
        console.log('Claimable Rewards (Field):', user.claimableRewards);
        console.log('isTopPerformer:', user.isTopPerformer);

        const transactions = await WalletTransaction.find({ user: user._id });
        console.log('\n--- Transactions Found:', transactions.length, '---');
        
        const summary = {};
        let totalCredits = 0;

        transactions.forEach(tx => {
            const key = `${tx.type}_${tx.category}_${tx.status}`;
            summary[key] = (summary[key] || 0) + tx.amount;
            
            if (tx.type === 'credit' && tx.status === 'completed' && ['blog_reward', 'quiz_reward', 'question_reward', 'bonus', 'referral'].includes(tx.category)) {
                totalCredits += tx.amount;
            }
        });

        console.log('\n--- Transaction Summary ---');
        Object.entries(summary).forEach(([key, total]) => {
            console.log(`${key}: ₹${total}`);
        });
        
        console.log('\n--- Calculated Total Credits (for WalletBalance) ---');
        console.log('Total Credits:', totalCredits);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

const targetEmail = 'sajidpahat786@gmail.com';
checkUser(targetEmail);
