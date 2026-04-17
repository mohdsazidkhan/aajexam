import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyPlan from '@/models/StudyPlan';
import { protect } from '@/middleware/auth';

// GET - Get single plan
export async function GET(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { id } = await params;

        const plan = await StudyPlan.findOne({ _id: id, user: auth.user._id }).populate('exam', 'name code');
        if (!plan) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: plan });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - Update plan (pause/resume/complete task)
export async function PUT(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const plan = await StudyPlan.findOne({ _id: id, user: auth.user._id });
        if (!plan) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

        if (body.status) plan.status = body.status;
        if (body.isActive !== undefined) plan.isActive = body.isActive;

        // Mark task as completed
        if (body.weekIndex !== undefined && body.taskIndex !== undefined) {
            const week = plan.weeklySchedule[body.weekIndex];
            if (week && week.tasks[body.taskIndex]) {
                week.tasks[body.taskIndex].isCompleted = true;
                week.tasks[body.taskIndex].completedAt = new Date();
            }

            // Recalculate completion percentage
            let totalTasks = 0, completedTasks = 0;
            plan.weeklySchedule.forEach(w => {
                w.tasks.forEach(t => {
                    totalTasks++;
                    if (t.isCompleted) completedTasks++;
                });
            });
            plan.completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        }

        await plan.save();
        return NextResponse.json({ success: true, data: plan });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Delete plan
export async function DELETE(req, { params }) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();
        const { id } = await params;

        const plan = await StudyPlan.findOneAndDelete({ _id: id, user: auth.user._id });
        if (!plan) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Plan deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
