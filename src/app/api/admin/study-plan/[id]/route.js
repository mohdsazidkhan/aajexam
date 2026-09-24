import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyPlan from '@/models/StudyPlan';
import { protect, admin } from '@/middleware/auth';

// Delete study plan
export async function DELETE(req, { params }) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const plan = await StudyPlan.findByIdAndDelete(id);
    if (!plan) {
      return NextResponse.json({ success: false, message: 'Study plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Study plan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
