import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { protect, admin } from '@/middleware/auth';
import User from '@/models/User';
import Exam from '@/models/Exam';
import ExamCategory from '@/models/ExamCategory';
import ExamPattern from '@/models/ExamPattern';
import PracticeTest from '@/models/PracticeTest';
import UserTestAttempt from '@/models/UserTestAttempt';
import PaymentOrder from '@/models/PaymentOrder';
import BankDetail from '@/models/BankDetail';
import WithdrawRequest from '@/models/WithdrawRequest';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            students,
            activeUsersCurrentMonth,
            exams,
            activeExams,
            examCategories,
            examPatterns,
            practiceTests,
            freePracticeTests,
            testAttempts,
            completedAttempts,
            bankDetails,
            paymentOrders,
            withdrawRequests,
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'student', lastLogin: { $gte: startOfDay } }),
            Exam.countDocuments(),
            Exam.countDocuments({ isActive: true }),
            ExamCategory.countDocuments(),
            ExamPattern.countDocuments(),
            PracticeTest.countDocuments(),
            PracticeTest.countDocuments({ isFree: true }),
            UserTestAttempt.countDocuments(),
            UserTestAttempt.countDocuments({ status: 'Completed' }),
            BankDetail.countDocuments(),
            PaymentOrder.countDocuments({ payuStatus: 'success' }),
            WithdrawRequest.countDocuments({ status: 'pending' }),
        ]);

        return NextResponse.json({
            students,
            activeUsersCurrentMonth,
            exams,
            activeExams,
            examCategories,
            examPatterns,
            practiceTests,
            freePracticeTests,
            testAttempts,
            completedAttempts,
            bankDetails,
            paymentOrders,
            withdrawRequests,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
