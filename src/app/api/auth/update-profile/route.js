import dbConnect from '@/lib/db';
import User from '@/models/User';
import Exam from '@/models/Exam';
import { protect } from '@/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { QUALIFICATION_VALUES, GENDER_VALUES, HEARD_FROM_VALUES, MIN_AGE_YEARS, MAX_AGE_YEARS } from '@/lib/constants/profileOptions';
import { parseDobParts, calcAge } from '@/lib/utils/age';

// '' clears the field; a value outside the allowed list is ignored (the field is left as it was).
const pickOption = (value, allowed) => (value === '' || allowed.includes(value) ? value : undefined);

// 'YYYY-MM-DD' -> Date at UTC midnight; '' / null clears it; anything invalid or outside 10-100 years old -> undefined.
function parseDateOfBirth(value) {
    if (value === '' || value === null) return null;
    const parts = parseDobParts(value);
    if (!parts) return undefined;
    const age = calcAge(value);
    if (!age || age.years < MIN_AGE_YEARS || age.years > MAX_AGE_YEARS) return undefined;
    return new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
}

export async function PUT(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return errorResponse(auth.message, 401);
        }

        await dbConnect();
        const body = await req.json();

        // Fields allowed to be updated
        const { name, phone, bio, city, state, isPublicProfile, primaryTargetExam, targetExams, targetExamsPrompted, socialLinks, qualification, dateOfBirth, gender, heardFrom } = body;

        // protect() already loaded this user as a document; a second findById was a wasted round trip.
        const user = auth.user;
        if (!user) {
            return errorResponse('User not found', 404);
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (city !== undefined) user.city = city;
        if (state !== undefined) user.state = state;
        if (isPublicProfile !== undefined) user.isPublicProfile = !!isPublicProfile;
        const qualificationValue = pickOption(qualification, QUALIFICATION_VALUES);
        if (qualificationValue !== undefined) user.qualification = qualificationValue;
        const genderValue = pickOption(gender, GENDER_VALUES);
        if (genderValue !== undefined) user.gender = genderValue;
        const heardFromValue = pickOption(heardFrom, HEARD_FROM_VALUES);
        if (heardFromValue !== undefined) user.heardFrom = heardFromValue;
        if (dateOfBirth !== undefined) {
            const dob = parseDateOfBirth(dateOfBirth);
            if (dob === undefined) return errorResponse(new Error('Please enter a valid date of birth.'), 400);
            user.dateOfBirth = dob;
        }
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
                qualification: user.qualification,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                heardFrom: user.heardFrom,
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
