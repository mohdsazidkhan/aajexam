import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { resolveUserId } from '@/lib/utils/userRef';
import User from '@/models/User';
import Exam from '@/models/Exam';
import { protect, admin } from '@/middleware/auth';
import { QUALIFICATION_VALUES, GENDER_VALUES, HEARD_FROM_VALUES, MIN_AGE_YEARS, MAX_AGE_YEARS } from '@/lib/constants/profileOptions';
import { parseDobParts, calcAge } from '@/lib/utils/age';

const STATUSES = ['active', 'inactive', 'suspended', 'banned'];
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// '' clears the field; a value outside the allowed list is ignored (same rule as the student's own profile form).
const pickOption = (value, allowed) => (value === '' || allowed.includes(value) ? value : undefined);

const publicStudent = (student) => {
    const obj = student.toObject ? student.toObject() : { ...student };
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
};

export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { id } = await params; // user id or username
        const uid = await resolveUserId(id);
        if (!uid) return NextResponse.json({ message: 'Student not found' }, { status: 404 });

        const student = await User.findById(uid).populate('targetExams', 'name code');
        if (!student || student.role !== 'student') return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: publicStudent(student) });
    } catch (error) {
        console.error('Admin get student error:', error);
        return NextResponse.json({ error: 'Failed to load student' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const body = await req.json();
        const { id } = await params; // user id or username
        const uid = await resolveUserId(id);
        if (!uid) return NextResponse.json({ message: 'Student not found' }, { status: 404 });

        const student = await User.findById(uid);
        if (!student || student.role !== 'student') return NextResponse.json({ message: 'Student not found' }, { status: 404 });

        const { name, email, phone, status, isBlocked, city } = body;

        // ── Existing fields (kept exactly as before so current callers keep working) ──
        if (name) student.name = String(name).trim();
        if (phone !== undefined && phone !== null && String(phone).trim() !== '') student.phone = String(phone).trim();
        if (isBlocked !== undefined) student.isBlocked = isBlocked;
        if (city !== undefined) student.city = String(city || '').trim();

        // ── Email: format + not used by another account ──
        if (email) {
            const clean = String(email).trim().toLowerCase();
            if (!EMAIL_RE.test(clean)) return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
            if (clean !== String(student.email || '').toLowerCase()) {
                const clash = await User.findOne({ email: clean, _id: { $ne: student._id } }).select('_id').lean();
                if (clash) return NextResponse.json({ message: 'That email is already used by another account' }, { status: 409 });
                student.email = clean;
            }
        }

        // ── Username: format + unique ──
        if (body.username !== undefined) {
            const clean = String(body.username || '').trim().toLowerCase();
            if (clean === '') {
                student.username = undefined;
            } else if (clean !== String(student.username || '')) {
                if (!USERNAME_RE.test(clean)) return NextResponse.json({ message: 'Username must be 3-20 letters, numbers or underscore' }, { status: 400 });
                const clash = await User.findOne({ username: clean, _id: { $ne: student._id } }).select('_id').lean();
                if (clash) return NextResponse.json({ message: 'That username is already taken' }, { status: 409 });
                student.username = clean;
            }
        }

        // ── Status (with the reason / audit trail) ──
        if (status !== undefined) {
            if (!STATUSES.includes(status)) return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
            if (status !== student.status) {
                student.status = status;
                student.statusChangedAt = new Date();
                student.statusChangedBy = auth.user._id || auth.user.id;
            }
        }
        if (body.statusReason !== undefined) student.statusReason = String(body.statusReason || '').trim() || null;

        // ── Profile details: same fields and rules as the student's own Settings form ──
        if (body.state !== undefined) student.state = String(body.state || '').trim();
        if (body.bio !== undefined) {
            const bio = String(body.bio || '').trim();
            if (bio.length > 200) return NextResponse.json({ message: 'Bio can be at most 200 characters' }, { status: 400 });
            student.bio = bio;
        }
        if (body.isPublicProfile !== undefined) student.isPublicProfile = !!body.isPublicProfile;
        const qualification = pickOption(body.qualification, QUALIFICATION_VALUES);
        if (qualification !== undefined) student.qualification = qualification;
        const gender = pickOption(body.gender, GENDER_VALUES);
        if (gender !== undefined) student.gender = gender;
        const heardFrom = pickOption(body.heardFrom, HEARD_FROM_VALUES);
        if (heardFrom !== undefined) student.heardFrom = heardFrom;
        if (body.dateOfBirth !== undefined) {
            if (!body.dateOfBirth) student.dateOfBirth = null;
            else {
                const parts = parseDobParts(body.dateOfBirth);
                const age = parts ? calcAge(body.dateOfBirth) : null;
                if (!parts || !age || age.years < MIN_AGE_YEARS || age.years > MAX_AGE_YEARS) {
                    return NextResponse.json({ message: 'Please enter a valid date of birth (age 10 to 100)' }, { status: 400 });
                }
                student.dateOfBirth = new Date(Date.UTC(parts.y, parts.m - 1, parts.d));
            }
        }
        if (body.socialLinks && typeof body.socialLinks === 'object') {
            const cur = student.socialLinks?.toObject?.() || student.socialLinks || {};
            const next = { ...cur };
            ['instagram', 'facebook', 'x', 'youtube'].forEach((k) => {
                if (body.socialLinks[k] !== undefined) next[k] = String(body.socialLinks[k] || '').trim() || null;
            });
            student.socialLinks = next;
        }

        // ── Target exams: only real exams (actualExam), stored like the student's own picker does ──
        if (body.targetExams !== undefined) {
            const ids = [...new Set((Array.isArray(body.targetExams) ? body.targetExams : []).filter((x) => mongoose.isValidObjectId(x)).map(String))];
            const exams = ids.length ? await Exam.find({ _id: { $in: ids }, actualExam: true }).select('name').lean() : [];
            student.targetExams = exams.map((e) => e._id);
            student.targetExamsPrompted = true;
            student.primaryTargetExam = exams.length ? exams.map((e) => e.name).join(', ') : 'All Exams';
        }

        await student.save();
        return NextResponse.json({ success: true, message: 'Student updated successfully', student: publicStudent(student) });
    } catch (error) {
        console.error('Admin update student error:', error);
        return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params; // user id or username
        const uid = await resolveUserId(id);
        if (!uid) return NextResponse.json({ message: 'Student not found' }, { status: 404 });

        const student = await User.findByIdAndDelete(uid);
        if (!student) return NextResponse.json({ message: 'Student not found' }, { status: 404 });

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Admin delete student error:', error);
        return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }
}
