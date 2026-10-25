import mongoose from 'mongoose';
import PracticeTest from '@/models/PracticeTest';
import Quiz from '@/models/Quiz';
import CommunityQuestion from '@/models/CommunityQuestion';
import ExamNews from '@/models/ExamNews';
import CurrentAffair from '@/models/CurrentAffair';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Blog from '@/models/Blog';

// Server-side registry for the generic bookmark types (see models/Bookmark.js): which model backs
// a type, which fields the saved list needs, and how to turn a document into a card.
const slugOr = (d) => d.slug || String(d._id);

export const BOOKMARK_REGISTRY = {
    test: {
        Model: PracticeTest,
        select: 'title slug duration totalMarks isPYQ pyqYear',
        card: (d) => ({ title: d.title, meta: [d.duration ? `${d.duration} min` : null, d.totalMarks ? `${d.totalMarks} marks` : null, d.isPYQ && d.pyqYear ? `PYQ ${d.pyqYear}` : null].filter(Boolean).join(' · '), href: `/govt-exams/test/${d.slug || d._id}/start` }),
    },
    quiz: {
        Model: Quiz,
        select: 'title slug duration totalMarks difficulty',
        card: (d) => ({ title: d.title, meta: [d.duration ? `${d.duration} min` : null, d.difficulty || null].filter(Boolean).join(' · '), href: `/quiz/${slugOr(d)}` }),
    },
    community: {
        Model: CommunityQuestion,
        select: 'question answerCount views',
        card: (d) => ({ title: d.question, meta: `${d.answerCount || 0} answers`, href: `/community-questions/${d._id}` }),
    },
    news: {
        Model: ExamNews,
        select: 'title slug examName type createdAt',
        card: (d) => ({ title: d.title, meta: [d.examName || null, d.type || null].filter(Boolean).join(' · '), href: `/exam-news/${slugOr(d)}` }),
    },
    affair: {
        Model: CurrentAffair,
        select: 'title slug category date',
        card: (d) => ({ title: d.title, meta: [d.category || null, d.date ? new Date(d.date).toLocaleDateString('en-IN') : null].filter(Boolean).join(' · '), href: `/current-affairs/${slugOr(d)}` }),
    },
    subject: {
        Model: Subject,
        select: 'name slug',
        card: (d) => ({ title: d.name, meta: '', href: `/subjects/${slugOr(d)}` }),
    },
    topic: {
        Model: Topic,
        select: 'name slug',
        card: (d) => ({ title: d.name, meta: '', href: `/topics/${slugOr(d)}` }),
    },
    blog: {
        Model: Blog,
        select: 'title slug readingTime publishedAt',
        card: (d) => ({ title: d.title, meta: [d.readingTime ? `${d.readingTime} min read` : null].filter(Boolean).join(' · '), href: `/blog/${d.slug}` }),
    },
};

// A page may know a document by ObjectId or by slug; resolve either to the document's _id.
export async function resolveRefId(type, id) {
    const entry = BOOKMARK_REGISTRY[type];
    if (!entry || !id) return null;
    const value = String(id).trim();
    if (mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value) {
        const hit = await entry.Model.exists({ _id: value });
        return hit ? hit._id : null;
    }
    if (!entry.Model.schema.path('slug')) return null;
    const hit = await entry.Model.findOne({ slug: value.toLowerCase() }).select('_id').lean();
    return hit ? hit._id : null;
}
