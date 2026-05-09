import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaPlay, FaClock, FaTrophy, FaCheckCircle, FaCalendar, FaListOl, FaBookOpen, FaArrowRight } from 'react-icons/fa';
import Seo from '../../../components/Seo';
import { requireAuthForAction } from '../../../lib/auth';
import {
    generatePracticeTestSchema,
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateItemListSchema,
} from '../../../utils/schema';
import dbConnect from '../../../lib/db';
import Exam from '../../../models/Exam';
import ExamPattern from '../../../models/ExamPattern';
import PracticeTest from '../../../models/PracticeTest';
import mongoose from 'mongoose';

const SAMPLE_COUNT = 5;

const formatDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function PYQPaperPage({ exam, paper, pattern, sampleQuestions, related, faqs, intro }) {
    const router = useRouter();

    if (!exam || !paper) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-4">PYQ Paper Not Found</h1>
                    <Link href="/pyq" className="text-primary-600 hover:text-primary-700 font-bold">← Browse all PYQs</Link>
                </div>
            </div>
        );
    }

    const handleStart = () => {
        const dest = `/govt-exams/test/${paper.slug}/start`;
        if (requireAuthForAction(router, dest)) router.push(dest);
    };

    const examName = exam.name || exam.code || 'Government Exam';
    const yearLabel = paper.pyqYear ? ` ${paper.pyqYear}` : '';
    const shiftLabel = paper.pyqShift ? ` ${paper.pyqShift}` : '';
    const seoTitle = `${paper.title} – ${examName} Previous Year Question Paper${yearLabel} with Answers | AajExam`;
    const seoDesc = `Practice ${paper.title} (${examName}${yearLabel}${shiftLabel}) — ${paper.questionCount || 0} questions, ${paper.totalMarks} marks, ${paper.duration} min. Free PYQ mock test with detailed solutions.`.slice(0, 160);

    const canonical = `/pyq/${exam.slug}/${paper.slug}`;
    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'PYQ', url: '/pyq' },
        { name: examName, url: `/pyq/${exam.slug}` },
        { name: paper.title, url: canonical },
    ];

    const schemas = [
        generatePracticeTestSchema({
            title: paper.title,
            description: intro,
            isPYQ: true,
            examName,
            duration: paper.duration,
            totalMarks: paper.totalMarks,
            questionCount: paper.questionCount,
            accessLevel: paper.accessLevel,
        }),
        generateBreadcrumbSchema(breadcrumbItems),
        generateFAQSchema(faqs),
        related?.length > 0 && generateItemListSchema({
            name: `Other ${examName} Previous Year Papers`,
            items: related.map((r) => ({ name: r.title, url: `/pyq/${exam.slug}/${r.slug}` })),
        }),
    ].filter(Boolean);

    const keywords = [
        `${paper.title}`,
        `${examName} previous year question paper`,
        `${examName} PYQ${yearLabel}`,
        `${examName}${yearLabel}${shiftLabel} solved paper`,
        `${examName} mock test`,
        `${examName} ${paper.pyqYear || ''} answer key`,
        'free pyq with solutions',
        'government exam previous year paper',
        'aajexam pyq',
    ].filter(Boolean);

    return (
        <>
            <Seo
                title={seoTitle}
                description={seoDesc}
                canonical={canonical}
                keywords={keywords}
                schemas={schemas}
            />

            <div className="py-4 lg:py-8 min-h-screen px-4 font-outfit relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6 relative">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest flex-wrap">
                        <Link href="/" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Home</Link>
                        <span className="text-slate-400">/</span>
                        <Link href="/pyq" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">PYQ</Link>
                        <span className="text-slate-400">/</span>
                        <Link href={`/pyq/${exam.slug}`} className="text-primary-700 dark:text-primary-400 hover:text-primary-500">{examName}</Link>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[60%]">{paper.title}</span>
                    </nav>

                    {/* Hero */}
                    <header className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 flex-wrap mb-6">
                            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-[10px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">PYQ {paper.pyqYear || ''}</span>
                            {paper.pyqShift && <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{paper.pyqShift}</span>}
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">{examName}</span>
                            {paper.accessLevel === 'FREE' && <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest">Free</span>}
                        </div>

                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
                            {paper.title}
                        </h1>
                        <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-4xl">
                            Attempt the official {examName} previous year question paper{yearLabel}{shiftLabel} as a free, timed mock test on AajExam. Get instant scoring, sectional analysis, and detailed solutions for every question.
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border-2 border-slate-100 dark:border-slate-800">
                                <FaListOl className="text-xl text-primary-600 mx-auto mb-2" />
                                <div className="text-xl font-black text-slate-900 dark:text-white">{paper.questionCount || 0}</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Questions</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border-2 border-slate-100 dark:border-slate-800">
                                <FaTrophy className="text-xl text-primary-600 mx-auto mb-2" />
                                <div className="text-xl font-black text-slate-900 dark:text-white">{paper.totalMarks}</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Marks</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border-2 border-slate-100 dark:border-slate-800">
                                <FaClock className="text-xl text-emerald-600 mx-auto mb-2" />
                                <div className="text-xl font-black text-slate-900 dark:text-white">{paper.duration}</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Minutes</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border-2 border-slate-100 dark:border-slate-800">
                                <FaCalendar className="text-xl text-orange-600 mx-auto mb-2" />
                                <div className="text-md font-black text-slate-900 dark:text-white">{paper.pyqYear || '—'}</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Year</div>
                            </div>
                        </div>

                        <button
                            onClick={handleStart}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white px-8 py-5 rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center shadow-duo-primary border-b-8 border-primary-700 active:translate-y-1 active:border-b-0"
                        >
                            <FaPlay className="mr-3 text-xs" /> Start Free Mock Test
                        </button>
                    </header>

                    {/* About this paper — long-form intro for SEO */}
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center">
                            <FaBookOpen className="text-primary-600 mr-3" /> About This Paper
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-base lg:text-lg whitespace-pre-line">
                            {intro}
                        </div>
                    </section>

                    {/* Section breakdown */}
                    {pattern?.sections?.length > 0 && (
                        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                                Exam Pattern & Sections
                            </h2>
                            <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100 dark:bg-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Section</th>
                                            <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 text-center">Questions</th>
                                            <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 text-center">Marks/Q</th>
                                            <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 text-center">Negative</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pattern.sections.map((s, i) => (
                                            <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">{s.totalQuestions}</td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">{s.marksPerQuestion}</td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">{s.negativePerQuestion || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Sample questions */}
                    {sampleQuestions?.length > 0 && (
                        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                                Sample Questions with Answers
                            </h2>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">
                                Showing {sampleQuestions.length} of {paper.questionCount || 0} questions. Start the mock test to attempt all questions in timed mode.
                            </p>
                            <div className="space-y-6">
                                {sampleQuestions.map((q, idx) => (
                                    <article key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 lg:p-6 border-2 border-slate-100 dark:border-slate-800">
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-black text-sm">{idx + 1}</span>
                                            <div className="flex-1 space-y-2">
                                                {q.section && <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">{q.section}</span>}
                                                <p className="text-base font-bold text-slate-900 dark:text-white whitespace-pre-line">{q.questionText}</p>
                                                {q.questionImage && (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={q.questionImage} alt={`Question ${idx + 1}`} loading="lazy" className="max-w-full rounded-lg border border-slate-200 dark:border-slate-700" />
                                                )}
                                            </div>
                                        </div>
                                        <ol className="space-y-2 ml-11">
                                            {q.options.map((opt, oi) => {
                                                const isCorrect = oi === q.correctAnswerIndex;
                                                return (
                                                    <li key={oi} className={`px-4 py-2 rounded-lg border-2 font-medium text-sm ${isCorrect ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                                        <span className="font-black mr-2">{String.fromCharCode(65 + oi)}.</span>
                                                        {opt}
                                                        {q.optionImages?.[oi] && (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img src={q.optionImages[oi]} alt={`Option ${String.fromCharCode(65 + oi)}`} loading="lazy" className="max-w-full mt-2 rounded border border-slate-200 dark:border-slate-700" />
                                                        )}
                                                        {isCorrect && <FaCheckCircle className="inline ml-2 text-emerald-600" />}
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                        {q.explanation && (
                                            <div className="ml-11 mt-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-lg border-l-4 border-primary-500">
                                                <p className="text-xs font-black text-primary-700 dark:text-primary-400 uppercase tracking-widest mb-1">Explanation</p>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line">{q.explanation}</p>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                            <button
                                onClick={handleStart}
                                className="mt-8 w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center"
                            >
                                Attempt Full Paper <FaArrowRight className="ml-3" />
                            </button>
                        </section>
                    )}

                    {/* FAQ */}
                    {faqs?.length > 0 && (
                        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                {faqs.map((f, i) => (
                                    <details key={i} className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-5 cursor-pointer">
                                        <summary className="font-black text-slate-900 dark:text-white text-base lg:text-lg uppercase tracking-tight">
                                            {f.question}
                                        </summary>
                                        <p className="mt-3 text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                                            {f.answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Related papers */}
                    {related?.length > 0 && (
                        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                                More {examName} PYQ Papers
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {related.map((r) => (
                                    <Link key={r._id} href={`/pyq/${exam.slug}/${r.slug}`} className="group block bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            {r.pyqYear && <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">{r.pyqYear}</span>}
                                            {r.pyqShift && <span className="text-[9px] font-bold text-slate-400">{r.pyqShift}</span>}
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition mb-2 line-clamp-2">{r.title}</h3>
                                        <p className="text-[11px] font-bold text-slate-500">{r.duration} min · {r.totalMarks} marks</p>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-6 text-center">
                                <Link href={`/pyq/${exam.slug}`} className="inline-flex items-center text-sm font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest">
                                    View all {examName} PYQs <FaArrowRight className="ml-2" />
                                </Link>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

function buildIntro({ exam, paper, pattern }) {
    const examName = exam.name || exam.code || 'this exam';
    const yearStr = paper.pyqYear ? ` ${paper.pyqYear}` : '';
    const shiftStr = paper.pyqShift ? ` (${paper.pyqShift})` : '';
    const sectionList = pattern?.sections?.map((s) => `${s.name} (${s.totalQuestions} questions)`).join(', ') || 'multiple subject sections';
    const totalSections = pattern?.sections?.length || 0;
    const negative = pattern?.negativeMarking || (pattern?.sections?.[0]?.negativePerQuestion ?? 0);
    const examDescription = exam.description ? exam.description.trim() + '\n\n' : '';

    return `${examDescription}This page hosts the official ${paper.title} — the ${examName} previous year question paper from${yearStr}${shiftStr}. AajExam has reconstructed this paper into a fully timed online mock test so candidates preparing for ${examName} can experience the real exam pattern, attempt every question with answer keys verified by our expert panel, and analyse their performance section-wise.

The paper contains ${paper.questionCount || 0} multiple-choice questions to be attempted in ${paper.duration} minutes for a total of ${paper.totalMarks} marks. The exam uses ${totalSections > 0 ? `${totalSections} sections — ${sectionList}` : sectionList}${negative ? ` with ${negative} negative marking per wrong answer` : ' with no negative marking'}. Use this paper to practise question selection, sectional time management, and accuracy under real exam conditions.

Why solve ${examName}${yearStr} previous year papers? Government competitive exams like ${examName} repeat question patterns, formula-based concepts and theme-based questions year after year. Solving the actual ${examName}${yearStr}${shiftStr} paper helps you identify high-yield chapters, calibrate the difficulty level, and build the speed required to clear sectional cut-offs. Every question on this paper has a detailed solution available immediately after submission, including step-by-step working for quantitative problems, grammar rules for English, and direct reference statements for general awareness questions.

How to use this PYQ paper effectively: first, attempt the full ${paper.duration}-minute test in a single sitting without referring to notes — treat it like the actual ${examName} exam. After submission, review the auto-generated analytics to see your section-wise accuracy, attempt rate, and time spent per question. Then revisit every wrong and skipped question with the explanation, and add the underlying concept to your revision notes. Repeat the same paper after 7-10 days — your second attempt should be at least 15-20% faster with better accuracy.

This ${paper.title} mock test is completely free on AajExam. You can also browse the full archive of ${examName} previous year papers shift-wise and year-wise to build a strong PYQ-driven preparation strategy. All papers come with bilingual support (English and Hindi solutions where applicable), instant scoring, all-India ranking, and downloadable performance reports.`;
}

function buildFaqs({ exam, paper, pattern }) {
    const examName = exam.name || 'the exam';
    const yearStr = paper.pyqYear ? ` ${paper.pyqYear}` : '';
    const sectionsStr = pattern?.sections?.map((s) => s.name).join(', ') || 'multiple sections';
    const negative = pattern?.negativeMarking || (pattern?.sections?.[0]?.negativePerQuestion ?? 0);

    return [
        {
            question: `Is ${paper.title} free to attempt on AajExam?`,
            answer: paper.accessLevel === 'FREE'
                ? `Yes. ${paper.title} is completely free to attempt on AajExam. You only need a free account to track your scores, view detailed solutions, and unlock performance analytics.`
                : `${paper.title} is part of our PRO plan. The latest year's ${examName} paper is always free; older papers are available with an AajExam PRO subscription that unlocks the full ${examName} PYQ archive.`,
        },
        {
            question: `How many questions does the ${paper.title} contain?`,
            answer: `The paper contains ${paper.questionCount || 0} multiple-choice questions to be attempted in ${paper.duration} minutes for a total of ${paper.totalMarks} marks${negative ? `, with ${negative} negative marking per wrong answer` : ' with no negative marking'}.`,
        },
        {
            question: `What sections are covered in ${examName}${yearStr}?`,
            answer: `The ${examName}${yearStr} paper covers the following sections: ${sectionsStr}. Each section is designed to test a specific skill set required for the ${examName} exam.`,
        },
        {
            question: `Are answers and explanations available?`,
            answer: `Yes. Every question on this PYQ paper has the correct answer and a detailed explanation. After submitting the test, you can review each question with step-by-step solutions, concept references, and tips on how to solve similar questions faster.`,
        },
        {
            question: `Can I attempt this paper multiple times?`,
            answer: `Yes. You can attempt this PYQ paper as many times as you like. Each attempt is recorded separately so you can track improvement in score, accuracy, and time-management.`,
        },
        {
            question: `Will solving PYQs really help me crack ${examName}?`,
            answer: `Government exam toppers consistently say PYQ practice is the single highest-leverage strategy. ${examName} repeats question patterns, frequently-tested concepts and difficulty distribution year after year. Solving 8-10 PYQ shifts before the exam dramatically improves time management and confidence.`,
        },
    ];
}

export async function getServerSideProps({ params, res }) {
    try {
        await dbConnect();
        const { examSlug, paperSlug } = params || {};
        const { isObjectId, slugRedirect } = await import('../../../lib/web/slugRouting');

        if (!examSlug || !paperSlug) return { notFound: true };

        // Resolve exam — slug or ObjectId fallback
        let examQuery;
        if (isObjectId(examSlug)) {
            const idDoc = await Exam.findById(examSlug).select('slug').lean();
            if (idDoc?.slug) return slugRedirect(`/pyq/${idDoc.slug}/${paperSlug}`);
            if (!idDoc) return { notFound: true };
            examQuery = { _id: examSlug, isActive: true };
        } else {
            examQuery = { slug: examSlug, isActive: true };
        }

        const exam = await Exam.findOne(examQuery)
            .select('name code slug description')
            .lean();
        if (!exam) return { notFound: true };

        // Resolve paper — slug or ObjectId fallback (must be PYQ)
        let paperQuery;
        if (isObjectId(paperSlug)) {
            const idDoc = await PracticeTest.findById(paperSlug).select('slug isPYQ').lean();
            if (idDoc?.slug && idDoc.isPYQ) return slugRedirect(`/pyq/${exam.slug}/${idDoc.slug}`);
            if (!idDoc || !idDoc.isPYQ) return { notFound: true };
            paperQuery = { _id: paperSlug, isPYQ: true };
        } else {
            paperQuery = { slug: paperSlug, isPYQ: true };
        }

        const paperDoc = await PracticeTest.findOne(paperQuery)
            .populate({ path: 'examPattern', select: 'exam title duration totalMarks negativeMarking sections' })
            .lean();

        if (!paperDoc || !paperDoc.examPattern) return { notFound: true };

        // Verify paper belongs to this exam
        const paperExamId = String(paperDoc.examPattern.exam || '');
        if (paperExamId !== String(exam._id)) return { notFound: true };

        const pattern = paperDoc.examPattern;
        const questions = paperDoc.questions || [];
        const sampleQuestions = questions.slice(0, SAMPLE_COUNT).map((q) => ({
            section: q.section,
            questionText: q.questionText,
            questionImage: q.questionImage || null,
            options: q.options || [],
            optionImages: q.optionImages || [],
            correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
            explanation: q.explanation || null,
        }));

        const paper = {
            _id: String(paperDoc._id),
            slug: paperDoc.slug,
            title: paperDoc.title,
            totalMarks: paperDoc.totalMarks,
            duration: paperDoc.duration,
            accessLevel: paperDoc.accessLevel,
            isPYQ: paperDoc.isPYQ,
            pyqYear: paperDoc.pyqYear,
            pyqShift: paperDoc.pyqShift,
            pyqExamName: paperDoc.pyqExamName,
            questionCount: questions.length,
            createdAt: paperDoc.createdAt ? paperDoc.createdAt.toISOString() : null,
            updatedAt: paperDoc.updatedAt ? paperDoc.updatedAt.toISOString() : null,
        };

        // Related papers — same exam, other slugs, prefer same year then recency
        const patternsForExam = await ExamPattern.find({ exam: exam._id }).select('_id').lean();
        const patternIds = patternsForExam.map((p) => p._id);
        const relatedDocs = await PracticeTest.find({
            examPattern: { $in: patternIds },
            isPYQ: true,
            slug: { $exists: true, $ne: null },
            _id: { $ne: paperDoc._id },
        })
            .select('slug title pyqYear pyqShift duration totalMarks')
            .sort({ pyqYear: -1, publishedAt: -1, createdAt: -1 })
            .limit(6)
            .lean();

        const related = relatedDocs.map((r) => ({
            _id: String(r._id),
            slug: r.slug,
            title: r.title,
            pyqYear: r.pyqYear || null,
            pyqShift: r.pyqShift || null,
            duration: r.duration,
            totalMarks: r.totalMarks,
        }));

        const intro = buildIntro({ exam, paper, pattern });
        const faqs = buildFaqs({ exam, paper, pattern });

        // Cache 1 hour at the edge — PYQ papers don't change once seeded
        if (res) {
            res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        }

        return {
            props: {
                exam: JSON.parse(JSON.stringify(exam)),
                paper,
                pattern: JSON.parse(JSON.stringify({
                    title: pattern.title,
                    duration: pattern.duration,
                    totalMarks: pattern.totalMarks,
                    negativeMarking: pattern.negativeMarking,
                    sections: pattern.sections || [],
                })),
                sampleQuestions,
                related,
                faqs,
                intro,
            },
        };
    } catch (error) {
        console.error('Error loading PYQ paper page:', error);
        return { notFound: true };
    }
}
