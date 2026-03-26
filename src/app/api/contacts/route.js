import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { createNotification } from '@/utils/notifications';

export async function POST(req) {
    try {
        await dbConnect();
        const { name, email, message } = await req.json();
        const contact = new Contact({ name, email, message });
        await contact.save();

        await createNotification({
            type: 'contact',
            title: 'New contact form submission',
            description: `${name} (${email})`,
            meta: { contactId: contact._id }
        });

        return NextResponse.json({ success: true, message: 'Contact saved successfully.' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to save contact.', error: error.message }, { status: 500 });
    }
}
