// One-time bulk grant: every existing user gets free PRO access until 31 Dec 2026.
// Users whose current subscriptionExpiry is already later than that (e.g. admins,
// or anyone who separately purchased a longer plan) are left untouched.
// Usage: node scripts/grantFreeProPromo.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MONGO_URI not found in .env / .env.local');
    process.exit(1);
}

const PROMO_END_DATE = new Date('2026-12-31T23:59:59.999Z');

const userSchema = new mongoose.Schema({ subscriptionStatus: String, subscriptionExpiry: Date }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

async function main() {
    await mongoose.connect(MONGO_URI);

    const result = await User.updateMany(
        {
            $or: [
                { subscriptionExpiry: { $exists: false } },
                { subscriptionExpiry: null },
                { subscriptionExpiry: { $lt: PROMO_END_DATE } }
            ]
        },
        { $set: { subscriptionStatus: 'PRO', subscriptionExpiry: PROMO_END_DATE } }
    );

    console.log(`Matched ${result.matchedCount}, updated ${result.modifiedCount} users to free PRO until ${PROMO_END_DATE.toISOString()}`);

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('grantFreeProPromo failed:', err);
    process.exit(1);
});
