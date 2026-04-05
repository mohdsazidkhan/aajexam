import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect } from '@/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function PUT(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return errorResponse(auth.message, 401);
        }

        await dbConnect();
        const body = await req.json();
        const userId = auth.user._id;

        // Fields allowed to be updated
        const { name, email, phone, bio, education, profileImage } = body;

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('User not found', 404);
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (bio) user.bio = bio;
        if (education) user.education = education;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        return successResponse({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage
            }
        }, 'Profile updated successfully');
    } catch (error) {
        return errorResponse(error);
    }
}
