import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from '@/utils/notifications';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

async function getUniqueReferralCode() {
    let code;
    let exists = true;
    while (exists) {
        code = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
        exists = await User.exists({ referralCode: code });
    }
    return code;
}

async function generateUniqueUsername(email) {
    let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (baseUsername.length < 3) baseUsername += 'user';
    if (baseUsername.length > 15) baseUsername = baseUsername.substring(0, 15);

    let username = baseUsername;
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 100) {
        exists = await User.exists({ username: username });
        if (exists) {
            username = baseUsername + Math.random().toString(36).substring(2, 6);
            attempts++;
        }
    }
    return username;
}

const createFreeSubscription = async (userId, isAdmin = false) => {
    try {
        const startDate = new Date();
        let endDate = new Date();
        if (isAdmin) {
            endDate.setFullYear(2099);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        return await Subscription.create({
            user: userId,
            plan: 'FREE',
            status: 'active',
            startDate,
            endDate,
            amount: 0,
            currency: 'INR',
            features: {
                unlimitedQuizzes: true,
                liveQuizzes: false,
                prioritySupport: false,
                advancedAnalytics: false,
                customBadges: false
            }
        });
    } catch (error) {
        console.error('Error creating free subscription:', error);
        throw error;
    }
};

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { googleId, email, name, picture, referralCode } = body;

        if (!googleId || !email || !name) {
            return errorResponse('Google authentication data is incomplete', 400);
        }

        let user = await User.findOne({ email });

        if (!user) {
            // New User Registration via Google
            const newReferralCode = await getUniqueReferralCode();
            let referredBy = null;

            if (referralCode) {
                const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
                if (referrer) {
                    referredBy = referrer._id;
                    referrer.referralCount = (referrer.referralCount || 0) + 1;
                    await referrer.save();
                }
            }

            const username = await generateUniqueUsername(email);
            user = new User({
                name, email, googleId, profilePicture: picture, username,
                role: 'student', subscriptionStatus: 'FREE', referralCode: newReferralCode,
                referredBy: referredBy, phone: undefined
            });

            const freeSub = await createFreeSubscription(user._id, false);
            user.currentSubscription = freeSub._id;
            user.subscriptionExpiry = freeSub.endDate;
            await user.save();

            createNotification({
                userId: user._id, type: 'registration', title: 'New user registered',
                description: `${user.name} (${user.email}) via Google`, meta: { userId: user._id, provider: 'google' }
            });
        } else {
            // Existing User Update
            if (!user.googleId) {
                user.googleId = googleId;
                user.profilePicture = picture;
                if (!user.phone) user.phone = undefined;
                await user.save();
            }
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // Check profile completion rewards
        const profileDetails = user.getProfileCompletionDetails();
        if (profileDetails.isComplete && !user.profileCompleted) {
            user.profileCompleted = true;
            if (!user.profileCompletionReward && user.subscriptionStatus === 'FREE') {
                try {
                    const now = new Date();
                    const endDate = new Date(now);
                    endDate.setDate(endDate.getDate() + 30);
                    const sub = await Subscription.create({
                        user: user._id, plan: 'PRO', status: 'active',
                        startDate: now, endDate, amount: 9, currency: 'INR',
                        metadata: { profileCompletionReward: true }
                    });
                    user.currentSubscription = sub._id;
                    user.subscriptionStatus = 'PRO';
                    user.subscriptionExpiry = endDate;
                    user.profileCompletionReward = true;
                    await user.save();
                } catch (subErr) { console.error('Reward error:', subErr); }
            }
        }

        const updatedProfileDetails = user.getProfileCompletionDetails();

        return successResponse({
            token,
            user: {
                _id: user._id, name: user.name, email: user.email, username: user.username,
                role: user.role, subscriptionStatus: user.subscriptionStatus,
                subscriptionExpiry: user.subscriptionExpiry, currentSubscription: user.currentSubscription,
                badges: user.badges, profileCompletion: updatedProfileDetails,
                walletBalance: user.walletBalance || 0
            }
        }, '🎉 Login Successful!');

    } catch (error) {
        return errorResponse(error);
    }
}
