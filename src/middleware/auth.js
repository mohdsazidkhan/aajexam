import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const protect = async (req) => {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { authenticated: false, message: 'Not authorized, no token' };
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await dbConnect();
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return { authenticated: false, message: 'Not authorized, user not found' };
        }

        return { authenticated: true, user };
    } catch (error) {
        console.error('Auth middleware error:', error);
        return { authenticated: false, message: 'Not authorized, token failed' };
    }
};

export const admin = (user) => {
    return user && (user.role === 'admin');
};

export const adminOnly = admin;

export const proOnly = (user) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.subscriptionStatus === 'pro' && user.status === 'active' && new Date(user.subscriptionExpiry) > new Date();
};
