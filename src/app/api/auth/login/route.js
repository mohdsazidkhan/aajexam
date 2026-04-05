import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { identifier, password } = body;

        if (!identifier || !password) {
            return errorResponse('Please provide identifier and password', 400);
        }

        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        const phoneRegex = /^\d{10,15}$/;

        let user;
        if (emailRegex.test(identifier)) {
            user = await User.findOne({ email: identifier }).populate('currentSubscription');
        } else if (phoneRegex.test(identifier)) {
            user = await User.findOne({ phone: identifier }).populate('currentSubscription');
        } else {
            return errorResponse('Please provide a valid email or phone number.', 400);
        }

        if (!user) {
            return errorResponse('User Not Found!', 404);
        }

        if (['suspended', 'banned'].includes(user.status)) {
            return errorResponse(`Your account is currently ${user.status.toUpperCase()}.
            
            Due to unusually high activity or repeated suspicious quiz attempts in a short period of time, we have temporarily restricted your access to protect the integrity of our platform.
            
            As a result, your previous quiz data has been reset.
            
            If you believe this action was taken in error, please contact our support team for further assistance.`, 403);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return errorResponse('Invalid Credentials', 401);
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000);

        // Check profile completion and give reward if 100% complete
        const profileDetails = user.getProfileCompletionDetails();
        if (profileDetails.isComplete && !user.profileCompleted) {
            user.profileCompleted = true;
            if (!user.profileCompletionReward && user.subscriptionStatus === 'free') {
                try {
                    const now = new Date();
                    const endDate = new Date(now);
                    endDate.setDate(endDate.getDate() + 30);
                    const subscription = await Subscription.create({
                        user: user._id, plan: 'basic', status: 'active',
                        startDate: now, endDate, amount: 9, currency: 'INR',
                        metadata: { profileCompletionReward: true }
                    });
                    user.currentSubscription = subscription._id;
                    user.subscriptionStatus = 'basic';
                    user.subscriptionExpiry = endDate;
                    user.profileCompletionReward = true;
                } catch (subError) {
                    console.error('❌ Failed to create profile completion subscription during login:', subError);
                }
            }
            await user.save();
        }

        const levelInfo = await user.getLevelInfo();
        const updatedProfileDetails = user.getProfileCompletionDetails();

        return successResponse({
            token,
            expiresAt,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                phone: user.phone,
                role: user.role,
                subscriptionStatus: user.subscriptionStatus,
                subscriptionExpiry: user.subscriptionExpiry,
                currentSubscription: user.currentSubscription,
                badges: user.badges,
                level: levelInfo?.currentLevel?.number || 0,
                levelDetails: levelInfo,
                profileCompletion: updatedProfileDetails,
                walletBalance: user.walletBalance || 0
            }
        }, '🎉 Login Successful!');

    } catch (error) {
        return errorResponse(error);
    }
}
