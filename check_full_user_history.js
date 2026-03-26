const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function checkFullHistory(email) {
    try {
        await mongoose.connect(MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ email: String, walletBalance: Number, name: String }));
        const users = await User.find({ email });
        
        console.log('Users found with email', email, ':', users.length);
        if (users.length === 0) return;

        const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', new mongoose.Schema({
            user: mongoose.Schema.Types.ObjectId,
            amount: Number,
            type: String,
            status: String,
            category: String,
            description: String
        }));

        const WithdrawRequest = mongoose.models.WithdrawRequest || mongoose.model('WithdrawRequest', new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            amount: Number,
            status: String
        }));

        for (const user of users) {
            const userId = user._id;
            console.log('\n=========================================');
            console.log('User:', email, 'ID:', userId, 'Name:', user.name);
            console.log('Wallet Balance Field:', user.walletBalance);

            const [txs, withdraws] = await Promise.all([
                WalletTransaction.find({ user: userId }).lean(),
                WithdrawRequest.find({ userId: userId }).lean()
            ]);

            console.log('\n--- Wallet Transactions ---');
            txs.forEach(tx => {
                console.log(`[${tx.type}] ${tx.category} | ${tx.status} | ₹${tx.amount} | ${tx.description}`);
            });

            console.log('\n--- Withdraw Requests ---');
            withdraws.forEach(w => {
                console.log(`₹${w.amount} | ${w.status}`);
            });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

checkFullHistory('sajidpahat786@gmail.com');
