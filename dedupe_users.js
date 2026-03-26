const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI not found');
    process.exit(1);
}

async function dedupe() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({ email: String, name: String, walletBalance: Number }));
        const WalletTransaction = mongoose.model('WalletTransaction', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, amount: Number, type: String, status: String, category: String }));
        const WithdrawRequest = mongoose.model('WithdrawRequest', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, amount: Number }));
        const QuizAttempt = mongoose.model('QuizAttempt', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId }));
        const Article = mongoose.model('Article', new mongoose.Schema({ author: mongoose.Schema.Types.ObjectId }));
        const UserQuestions = mongoose.model('UserQuestions', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId }));

        // Find all duplicate emails
        const duplicateEmails = await User.aggregate([
            { $group: { _id: '$email', count: { $sum: 1 }, ids: { $push: '$_id' } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        console.log(`Found ${duplicateEmails.length} duplicate emails.`);

        for (const duplicate of duplicateEmails) {
            const email = duplicate._id;
            const ids = duplicate.ids;

            console.log(`\nProcessing email: ${email} (${ids.length} duplicates)`);

            // Find the "Master" account (one with most records or specific one)
            // Strategy: Check transaction counts for each ID
            const counts = await Promise.all(ids.map(async (id) => {
                const txCount = await WalletTransaction.countDocuments({ user: id });
                const user = await User.findById(id);
                return { id, txCount, name: user.name };
            }));

            // Sort by transaction count descending
            counts.sort((a, b) => b.txCount - a.txCount);

            const master = counts[0];
            const subs = counts.slice(1);

            console.log(`Master designated: ${master.name} (ID: ${master.id}, TXs: ${master.txCount})`);

            for (const sub of subs) {
                console.log(`  Merging sub-account: ${sub.name} (ID: ${sub.id}, TXs: ${sub.txCount})`);

                // 1. Reassign transactions
                const txResult = await WalletTransaction.updateMany({ user: sub.id }, { $set: { user: master.id } });
                console.log(`    Reassigned ${txResult.modifiedCount} WalletTransactions`);

                // 2. Reassign withdrawals
                const wResult = await WithdrawRequest.updateMany({ userId: sub.id }, { $set: { userId: master.id } });
                console.log(`    Reassigned ${wResult.modifiedCount} WithdrawRequests`);

                // 3. Reassign quiz attempts
                const qaResult = await QuizAttempt.updateMany({ user: sub.id }, { $set: { user: master.id } });
                console.log(`    Reassigned ${qaResult.modifiedCount} QuizAttempts`);

                // 4. Reassign articles
                const artResult = await Article.updateMany({ author: sub.id }, { $set: { author: master.id } });
                console.log(`    Reassigned ${artResult.modifiedCount} Articles`);

                // 5. Reassign user questions
                const qResult = await UserQuestions.updateMany({ user: sub.id }, { $set: { user: master.id } });
                console.log(`    Reassigned ${qResult.modifiedCount} UserQuestions`);

                // 6. Delete the sub-account
                await User.findByIdAndDelete(sub.id);
                console.log(`    Deleted sub-account ID: ${sub.id}`);
            }

            console.log(`Deduplication for ${email} complete.`);
        }

        console.log('\nAll duplicates processed.');
        console.log('IMPORTANT: Run the sync_user_wallets.js script now to update final balances.');

    } catch (err) {
        console.error('Error during deduplication:', err);
    } finally {
        await mongoose.connection.close();
    }
}

dedupe();
