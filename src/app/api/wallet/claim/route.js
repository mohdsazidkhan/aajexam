import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { protect } from '@/middleware/auth';

export async function POST(req) {
    try {
        await dbConnect();
        
        // Authenticate user
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const userId = auth.user.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Only Top Performers can claim rewards
        if (!user.isTopPerformer) {
            return NextResponse.json({ 
                success: false, 
                message: 'Only Monthly Top Performers are eligible to claim rewards.' 
            }, { status: 403 });
        }

        const amountToClaim = user.claimableRewards || 0;

        if (amountToClaim <= 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'No rewards available to claim' 
            }, { status: 400 });
        }

        // Use a session for atomicity
        const mongoose = (await import('mongoose')).default;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Move amount from claimableRewards to walletBalance
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId, claimableRewards: amountToClaim },
                { 
                    $inc: { 
                        walletBalance: amountToClaim,
                        claimableRewards: -amountToClaim 
                    } 
                },
                { new: true, session }
            );

            if (!updatedUser) {
                throw new Error('Claim failed: Reward balance changed during transaction');
            }

            // Update all 'competition_reward' transactions to 'quiz_reward'
            // This moves them from "Claimable" to "Withdrawable" in our transaction-based logic
            await WalletTransaction.updateMany(
                { user: userId, category: 'competition_reward', status: 'completed' },
                { $set: { category: 'quiz_reward', description: 'Reward claimed from competition winnings (transferred)' } },
                { session }
            );

            await session.commitTransaction();

            return NextResponse.json({
                success: true,
                message: `Successfully claimed ₹${amountToClaim}!`,
                data: {
                    walletBalance: updatedUser.walletBalance,
                    claimableRewards: updatedUser.claimableRewards
                }
            });

        } catch (innerError) {
            await session.abortTransaction();
            throw innerError;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Claim Reward Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Server error during claiming',
            error: error.message 
        }, { status: 500 });
    }
}
