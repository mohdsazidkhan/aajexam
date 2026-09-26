import Notification from '@/models/Notification';
import User from '@/models/User';

export async function createNotification({ userId = null, type, title, description = '', meta = {} }) {
    try {
        // Ensure we are in a server context and DB is connected if needed
        // In Next.js API routes, dbConnect() should usually be called in the route handler,
        // but utility functions like this just perform the DB operation.
        await Notification.create({ userId, type, title, description, meta });
    } catch (err) {
        console.error('Failed to create notification:', { type, userId, title, error: err.message });
    }
}

// Fan out an 'announcement' notification to every student — used when admin
// publishes something students should be told about (a new blog, PYQ paper,
// current affairs entry, etc). Never throws — a notification fan-out failing
// must not fail the content-creation request it's attached to.
export async function notifyAllStudents({ title, description = '', meta = {} }) {
    try {
        const students = await User.find({ role: 'student' }).select('_id').lean();
        if (students.length === 0) return;

        const docs = students.map((s) => ({
            userId: s._id,
            type: 'announcement',
            title,
            description,
            meta
        }));

        await Notification.insertMany(docs, { ordered: false });
    } catch (err) {
        console.error('Failed to notify all students:', { title, error: err.message });
    }
}
