/**
 * One-time reconciliation: make UserWallet.balance mirror the canonical
 * User.walletBalance for every user.
 *
 * Background: the app has two balance stores. `User.walletBalance` is the real
 * one (referral rewards etc. credit it); `UserWallet.balance` is only ever
 * ensured-to-exist at 0 and never positively credited by any code path. This
 * script brings UserWallet.balance up to the canonical value so the two agree,
 * after which both are kept in lock-step by the app.
 *
 * SAFE BY DEFAULT: runs as a DRY-RUN and writes nothing. Review the output,
 * then re-run with `--apply` to commit the changes.
 *
 *   node scripts/sync-user-wallets.mjs            # dry-run (no writes)
 *   node scripts/sync-user-wallets.mjs --apply    # actually update
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

// App keeps secrets in .env.local; fall back to .env.
dotenv.config({ path: '.env.local' });
dotenv.config();

const APPLY = process.argv.includes('--apply');
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set (checked .env.local and .env). Aborting.');
    process.exit(1);
}

const userSchema = new mongoose.Schema({ walletBalance: Number }, { strict: false });
const userWalletSchema = new mongoose.Schema(
    { userId: mongoose.Schema.Types.ObjectId, balance: Number, totalEarned: Number },
    { strict: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const UserWallet = mongoose.models.UserWallet || mongoose.model('UserWallet', userWalletSchema);

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log(`\n🔌 Connected. Mode: ${APPLY ? 'APPLY (writing)' : 'DRY-RUN (no writes)'}\n`);

    const users = await User.find({}, { _id: 1, walletBalance: 1, email: 1 }).lean();
    console.log(`👥 ${users.length} users to reconcile.\n`);

    let created = 0, updated = 0, unchanged = 0, moneyLossFlags = 0;

    for (const u of users) {
        const canonical = Number(u.walletBalance || 0);
        const wallet = await UserWallet.findOne({ userId: u._id }).lean();

        const current = wallet ? Number(wallet.balance || 0) : null;

        // Defensive: UserWallet is expected to be 0/empty. If it somehow holds MORE
        // than the canonical balance, syncing down would DESTROY money — flag loudly
        // and skip so a human can investigate before any write.
        if (current !== null && current > canonical) {
            moneyLossFlags++;
            console.warn(`⚠️  SKIP ${u.email || u._id}: UserWallet.balance ₹${current} > User.walletBalance ₹${canonical} — would lose money. Investigate.`);
            continue;
        }

        if (current === null) {
            created++;
            if (APPLY) {
                await UserWallet.updateOne(
                    { userId: u._id },
                    { $set: { balance: canonical }, $setOnInsert: { userId: u._id, totalEarned: canonical } },
                    { upsert: true }
                );
            }
        } else if (current !== canonical) {
            updated++;
            if (APPLY) {
                await UserWallet.updateOne({ userId: u._id }, { $set: { balance: canonical } });
            }
        } else {
            unchanged++;
        }
    }

    console.log(`\n──────── Summary ────────`);
    console.log(`  New wallets ${APPLY ? 'created' : 'to create'} : ${created}`);
    console.log(`  Balances ${APPLY ? 'updated' : 'to update'}    : ${updated}`);
    console.log(`  Already in sync           : ${unchanged}`);
    console.log(`  ⚠️  Money-loss flags (skipped): ${moneyLossFlags}`);
    console.log(`─────────────────────────`);
    if (!APPLY) console.log(`\nℹ️  Dry-run only — nothing written. Re-run with --apply to commit.\n`);

    await mongoose.disconnect();
}

main().catch(async (e) => {
    console.error('❌ Migration failed:', e);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
});
