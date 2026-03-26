import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { protect } from '@/middleware/auth';

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'aajexam';

        if (!file) return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });

        // Node.js buffer conversion for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

        const result = await uploadImage(base64Image, folder);

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

