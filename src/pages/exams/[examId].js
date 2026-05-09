// /exams/<slug-or-id> → 301 → /govt-exams/exam/<slug>
//
// Canonical exam URL is /govt-exams/exam/<slug>. This route exists only to
// preserve link equity from any legacy /exams/<slug> backlinks and to keep
// internal redirects working — every request 301s to the canonical URL.

import dbConnect from '../../lib/db';
import Exam from '../../models/Exam';

export default function ExamRedirectStub() {
    // Never reached on the server — getServerSideProps returns a redirect.
    // Returning null avoids any flash before the browser follows the 301.
    return null;
}

export async function getServerSideProps({ params }) {
    const { isObjectId } = await import('../../lib/web/slugRouting');
    const segment = params?.examId;
    if (!segment) return { notFound: true };

    try {
        await dbConnect();

        let slug = null;
        if (isObjectId(segment)) {
            const doc = await Exam.findById(segment).select('slug isActive').lean();
            if (!doc || doc.isActive === false) return { notFound: true };
            slug = doc.slug || null;
        } else {
            const doc = await Exam.findOne({
                $or: [{ slug: segment }, { code: String(segment).toUpperCase() }],
                isActive: true,
            }).select('slug').lean();
            if (!doc) return { notFound: true };
            slug = doc.slug || null;
        }

        if (!slug) return { notFound: true };

        return { redirect: { destination: `/govt-exams/exam/${slug}`, permanent: true } };
    } catch (error) {
        console.error('Error in /exams/<id> redirect handler:', error);
        return { notFound: true };
    }
}
