import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import WalletTransaction from '@/models/WalletTransaction';

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from '@/utils/notifications';
import { sendBrevoEmail } from '@/utils/email';
import { enforceRateLimit } from '@/lib/rateLimit';

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
            // 7-Day PRO Trial
            endDate.setDate(endDate.getDate() + 7);
        }

        return await Subscription.create({
            user: userId,
            plan: 'PRO',
            status: 'active',
            startDate,
            endDate,
            amount: 0,
            currency: 'INR',
            features: {
                unlimitedQuizzes: true,
                liveQuizzes: true,
                prioritySupport: true,
                advancedAnalytics: true,
                customBadges: true
            }
        });
    } catch (error) {
        console.error('Error creating free subscription:', error);
        throw error;
    }
};

export async function POST(req) {
    try {
        // Throttle signup abuse (disposable-email farming, referral fraud): 5 / 10 min / IP.
        const limited = await enforceRateLimit(req, { name: 'register', limit: 5, windowSec: 600 });
        if (limited) return limited;

        await dbConnect();
        const body = await req.json();
        const { name, email, phone, password, role = 'student', referredBy } = body;

        if (!name || !email || !phone || !password) {
            return NextResponse.json({ message: 'All fields are required: name, email, phone, password' }, { status: 400 });
        }

        if (await User.findOne({ email })) {
            return NextResponse.json({ message: 'Email already exists. Please use a different email address.' }, { status: 400 });
        }

        if (await User.findOne({ phone })) {
            return NextResponse.json({ message: 'Phone number already exists. Please use a different phone number.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = await getUniqueReferralCode();
        const username = await generateUniqueUsername(email);

        const user = new User({
            name, email, phone, password: hashedPassword, username, role,
            subscriptionStatus: 'PRO', referredBy: referredBy || null, referralCode
        });

        await user.save();

        // Profile completion check
        const profileDetails = user.getProfileCompletionDetails();
        if (profileDetails.isComplete && !user.profileCompleted) {
            user.profileCompleted = true;
            if (!user.profileCompletionReward && user.subscriptionStatus === 'FREE') {
                try {
                    const now = new Date();
                    const endDate = new Date(now);
                    endDate.setDate(endDate.getDate() + 7);
                    const subscription = await Subscription.create({
                        user: user._id, plan: 'PRO', status: 'active',
                        startDate: now, endDate, amount: 9, currency: 'INR',
                        metadata: { profileCompletionReward: true }
                    });
                    user.currentSubscription = subscription._id;
                    user.subscriptionStatus = 'PRO';
                    user.subscriptionExpiry = endDate;
                    user.profileCompletionReward = true;
                } catch (subError) {
                    console.error('Failed to create profile completion subscription:', subError);
                }
            }
        }

        // Referral logic
        if (referredBy) {
            const referrer = await User.findOne({ referralCode: referredBy });
            if (referrer) {
                await User.findByIdAndUpdate(referrer._id, { $inc: { referralCount: 1 } });
                createNotification({
                    userId: null,
                    type: 'referral_registration',
                    title: 'New referral registration',
                    description: `${user.name} (${user.email}) registered using referral code ${referredBy} from ${referrer.name}`,
                    meta: { newUserId: user._id, referrerId: referrer._id, referrerName: referrer.name, referralCode: referredBy, registrationType: 'regular' }
                });
            }
        }

        // Free subscription
        const isAdmin = role === 'admin';
        const freeSubscription = await createFreeSubscription(user._id, isAdmin);
        user.currentSubscription = freeSubscription._id;
        user.subscriptionExpiry = freeSubscription.endDate;
        await user.save();

        const subscriptionDuration = isAdmin ? 'lifetime' : '1 month';
        const levelAccess = isAdmin ? 'all levels (0-10)' : 'levels 0-3';
        await WalletTransaction.create({
            user: user._id, type: 'credit', amount: 0, balance: 0,
            category: 'subscription_payment', description: `FREE ${subscriptionDuration} subscription - ${levelAccess} access`
        });

        const successMessage = isAdmin
            ? '🎉 Admin Registered Successfully!'
            : '🎉 Registered Successfully!';

        createNotification({
            userId: user._id, type: 'registration', title: 'New user registered',
            description: `${user.name} (${user.email})`, meta: { userId: user._id }
        });

        // Send Welcome Email
        if (!isAdmin) {
            const welcomeHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #4F46E5;">Welcome to AajExam, ${user.name}! 🎉</h2>
                <p>We are thrilled to have you on board. Your journey to cracking your dream exam starts today.</p>
                <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #D97706;">🎁 Your 7-Day PRO Trial is Active!</h3>
                    <p style="margin-bottom: 0;">We've automatically unlocked all Premium Mock Tests and Previous Year Papers (PYQs) for the next 7 days for free. Make the most of it!</p>
                </div>
                <p>Log in now to track your daily streak and analyze your test performance.</p>
                <p>Best of luck,<br><strong>The AajExam Team</strong></p>
            </div>
            `;
            sendBrevoEmail({
                to: user.email,
                subject: 'Welcome to AajExam! Your 7-Day PRO Trial is inside 🎁',
                html: welcomeHtml
            }).catch(err => console.error('Failed to send welcome email:', err));
        }

        return NextResponse.json({
            success: true,
            message: successMessage,
            user: {
                _id: user._id, name: user.name, email: user.email, username: user.username,
                role: user.role, referralCode: user.referralCode, subscriptionStatus: user.subscriptionStatus,
                subscriptionExpiry: user.subscriptionExpiry, currentSubscription: freeSubscription,
                badges: user.badges,
                walletBalance: user.walletBalance || 0
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different ${field}.` }, { status: 400 });
        }
        return NextResponse.json({ message: 'Registration failed. Please try again later.' }, { status: 500 });
    }
}
