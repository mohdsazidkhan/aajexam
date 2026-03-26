import Notification from '@/models/Notification';

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
