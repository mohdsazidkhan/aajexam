import dbConnect from '@/lib/db';
import User from '@/models/User';
import Exam from '@/models/Exam';
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
        const { name, phone, bio, city, state, isPublicProfile, primaryTargetExam, targetExams, targetExamsPrompted, socialLinks } = body;

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse('User not found', 404);
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (city !== undefined) user.city = city;
        if (state !== undefined) user.state = state;
        if (isPublicProfile !== undefined) user.isPublicProfile = !!isPublicProfile;
        if (Array.isArray(targetExams)) {
            // Exam's query hook drops actualExam:false docs, so fake/placeholder exams can't be selected.
            const ids = [...new Set(targetExams.map(String))];
            const valid = ids.length
                ? await Exam.find({ _id: { $in: ids }, actualExam: true }).select('name').lean()
                : [];
            user.targetExams = valid.map((e) => e._id);
            user.targetExamsPrompted = true;
            user.primaryTargetExam = valid.length ? valid.map((e) => e.name).join(', ') : 'All Exams';
        } else if (primaryTargetExam) {
            user.primaryTargetExam = primaryTargetExam;
        }
        if (targetExamsPrompted === true) user.targetExamsPrompted = true;
        if (socialLinks && typeof socialLinks === 'object') {
            user.socialLinks = { ...(user.socialLinks?.toObject?.() || user.socialLinks || {}), ...socialLinks };
        }

        await user.save();

        return successResponse({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                phone: user.phone,
                role: user.role,
                bio: user.bio,
                city: user.city,
                state: user.state,
                isPublicProfile: user.isPublicProfile,
                primaryTargetExam: user.primaryTargetExam,
                targetExams: user.targetExams,
                targetExamsPrompted: user.targetExamsPrompted,
                socialLinks: user.socialLinks,
                profilePicture: user.profilePicture
            }
        }, 'Profile updated successfully');
    } catch (error) {
        return errorResponse(error);
    }
}
