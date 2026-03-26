const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function testApiLogic(email) {
    try {
        await mongoose.connect(MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ email: String, name: String }));
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return;
        }

        const userId = user._id;
        console.log('Testing for User ID:', userId);
        console.log('User Name:', user.name);

        const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', new mongoose.Schema({
            user: mongoose.Schema.Types.ObjectId,
            amount: Number,
            type: String,
            status: String,
            category: String
        }));

        const categoryAgg = await WalletTransaction.aggregate([
            { 
                $match: { 
                    user: userId, 
                    status: 'completed',
                    type: 'credit',
                    category: { $in: ['blog_reward', 'quiz_reward', 'question_reward', 'bonus', 'referral'] }
                } 
            },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        console.log('Aggregation Result (categoryAgg):', JSON.stringify(categoryAgg, null, 2));

        const rewardBreakdown = {
            quiz_reward: 0,
            blog_reward: 0,
            question_reward: 0,
            referral: 0,
            bonus: 0
        };
        
        categoryAgg.forEach(item => {
            if (rewardBreakdown.hasOwnProperty(item._id)) {
                rewardBreakdown[item._id] = item.total;
            }
        });

        console.log('Final rewardBreakdown:', JSON.stringify(rewardBreakdown, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}

testApiLogic('sajidpahat786@gmail.com');
