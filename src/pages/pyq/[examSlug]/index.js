import Link from 'next/link';
import { FaCalendar, FaListOl, FaTrophy, FaClock, FaArrowRight, FaBookOpen, FaGraduationCap } from 'react-icons/fa';
import Seo from '../../../components/Seo';
import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateItemListSchema,
    generateExamCourseSchema,
} from '../../../utils/schema';
import dbConnect from '../../../lib/db';
import Exam from '../../../models/Exam';
import ExamPattern from '../../../models/ExamPattern';
import PracticeTest from '../../../models/PracticeTest';

export default function PYQExamIndexPage({ exam, papersByYear, totalPapers, faqs, intro, otherExams }) {
    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Exam Not Found</h1>
                    <Link href="/pyq" className="text-primary-600 hover:text-primary-700 font-bold">← Browse all PYQs</Link>
                </div>
            </div>
        );
    }

    const examName = exam.name || exam.code || 'Government Exam';
    const canonical = `/pyq/${exam.slug}`;
    const seoTitle = `${examName} Previous Year Question Papers (PYQ) – All Years with Solutions | AajExam`;
    const seoDesc = `Free ${examName} previous year question papers (PYQ) — ${totalPapers} solved papers across all shifts and years with detailed solutions, timer-based mock test mode, and instant scoring on AajExam.`.slice(0, 160);

    const years = Object.keys(papersByYear).sort((a, b) => Number(b) - Number(a));

    const allPapers = years.flatMap((y) => papersByYear[y]);

    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'PYQ', url: '/pyq' },
        { name: examName, url: canonical },
    ];

    const schemas = [
        generateExamCourseSchema({
            name: `${examName} Previous Year Question Papers`,
            code: exam.code,
            description: seoDesc,
            url: `https://aajexam.com${canonical}`,
            category: 'Previous Year Papers',
            pyqCount: totalPapers,
        }),
        generateBreadcrumbSchema(breadcrumbItems),
        generateItemListSchema({
            name: `${examName} PYQ Papers`,
            items: allPapers.map((p) => ({ name: p.title, url: `/pyq/${exam.slug}/${p.slug}` })),
        }),
        generateFAQSchema(faqs),
    ];

    const keywords = [
        `${examName} previous year question paper`,
        `${examName} PYQ`,
        `${examName} previous year paper pdf`,
        `${examName} solved papers`,
        `${examName} mock test`,
        `${examName} question paper with answer`,
        'free pyq with solutions',
        'aajexam pyq',
    ];

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
                        <span className="text-slate-600 dark:text-slate-400">{examName}</span>
                    </nav>

                    {/* Hero */}
                    <header className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <div className="flex items-center mb-6 gap-4 flex-wrap">
                            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center shadow-duo-primary border-2 border-white dark:border-slate-800 flex-shrink-0">
                                <FaGraduationCap className="text-2xl lg:text-3xl text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">Previous Year Papers</span>
                                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    {examName} PYQ
                                </h1>
                            </div>
                        </div>
                        <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-4xl">
                            All {examName} previous year question papers in one place — {totalPapers} solved papers across {years.length} {years.length === 1 ? 'year' : 'years'}, attemptable as free timed mock tests with detailed answer explanations.
                        </p>

                        <div className="grid grid-cols-3 gap-4 lg:gap-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border-2 border-slate-100 dark:border-slate-800">
                                <FaListOl className="text-xl text-primary-600 mx-auto mb-2" />
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{totalPapers}</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Papers</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border-2 border-slate-100 dark:border-slate-800">
                                <FaCalendar className="text-xl text-orange-600 mx-auto mb-2" />
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{years.length}</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Years Covered</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border-2 border-slate-100 dark:border-slate-800">
                                <FaTrophy className="text-xl text-emerald-600 mx-auto mb-2" />
                                <div className="text-2xl font-black text-slate-900 dark:text-white">FREE</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To Attempt</div>
                            </div>
                        </div>
                    </header>

                    {/* Long-form intro */}
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center">
                            <FaBookOpen className="text-primary-600 mr-3" /> About {examName} PYQs
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-base lg:text-lg whitespace-pre-line">
                            {intro}
                        </div>
                    </section>

                    {/* Year-grouped paper listings */}
                    {years.length === 0 ? (
                        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800 text-center">
                            <FaListOl className="text-5xl text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <h2 className="text-xl font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">No PYQ papers seeded yet</h2>
                            <p className="text-slate-500 font-medium">{examName} previous year papers will appear here as soon as they are added.</p>
                        </section>
                    ) : (
                        years.map((year) => (
                            <section key={year} id={`year-${year}`} className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-8 lg:p-10 shadow-2xl mb-8 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                                <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center">
                                    <span className="mr-3 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm">{year}</span>
                                    {examName} — {papersByYear[year].length} {papersByYear[year].length === 1 ? 'Paper' : 'Papers'}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {papersByYear[year].map((p) => (
                                        <Link key={p._id} href={`/pyq/${exam.slug}/${p.slug}`} className="group block bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest">PYQ {p.pyqYear}</span>
                                                {p.pyqShift && <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{p.pyqShift}</span>}
                                            </div>
                                            <h3 className="text-sm lg:text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition mb-3 line-clamp-2">{p.title}</h3>
                                            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                                                <span className="flex items-center gap-1"><FaListOl className="text-[10px]" />{p.questionCount} Q</span>
                                                <span className="flex items-center gap-1"><FaClock className="text-[10px]" />{p.duration} min</span>
                                                <span className="flex items-center gap-1"><FaTrophy className="text-[10px]" />{p.totalMarks}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))
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
                                        <summary className="font-black text-slate-900 dark:text-white text-base lg:text-lg uppercase tracking-tight">{f.question}</summary>
                                        <p className="mt-3 text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">{f.answer}</p>
                                    </details>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Other exams */}
                    {otherExams?.length > 0 && (
                        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl mb-10 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                                Other Exam PYQs
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {otherExams.map((e) => (
                                    <Link key={e.slug} href={`/pyq/${e.slug}`} className="group block bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition text-center">
                                        <div className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition mb-1">{e.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500">{e.paperCount} papers</div>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-6 text-center">
                                <Link href="/pyq" className="inline-flex items-center text-sm font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest">
                                    Browse all PYQs <FaArrowRight className="ml-2" />
                                </Link>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

function buildIntro({ exam, totalPapers, years }) {
    const examName = exam.name || exam.code || 'this exam';
    const yearList = years.length === 0 ? 'the most recent recruitment cycles'
        : years.length === 1 ? `the ${years[0]} cycle`
        : `${years[0]} down to ${years[years.length - 1]}`;
    const examDescription = exam.description ? exam.description.trim() + '\n\n' : '';

    return `${examDescription}AajExam hosts a continuously expanding archive of ${examName} previous year question papers, fully reconstructed into timed mock tests with verified answer keys and detailed step-by-step solutions. This page lists every ${examName} PYQ shift available on the platform — currently ${totalPapers} ${totalPapers === 1 ? 'paper' : 'papers'} spanning ${yearList} — and lets you attempt each one as a real, timer-based test.

Why ${examName} previous year papers matter: government competitive exam toppers consistently rate PYQ practice as the single most leveraged preparation strategy. ${examName} repeats question patterns, formula applications, theme-based questions and difficulty distribution year after year, so a candidate who has solved 8-12 PYQ shifts has effectively practised the exam multiple times before the real day. PYQs reveal high-yield chapters — the topics that recur in nearly every shift — so you can prioritise revision around what actually appears, instead of studying the entire syllabus uniformly.

How AajExam's PYQ archive helps you prepare for ${examName}: every paper on this page is delivered as a real-exam-style timer-based mock test rather than a static PDF. You sit through the actual ${examName} duration, the section ordering and the negative-marking scheme, and submit when time runs out — exactly like the real exam. After submission you instantly get a detailed analytics report showing section-wise accuracy, time spent per question, attempt rate, and an overall percentile. Every wrong question and every skipped question is reviewable with a complete explanation, including step-by-step working, formula references and concept notes you can save to your revision queue.

Suggested PYQ strategy for ${examName} aspirants: first, attempt the most recent year's paper without any prep — this gives you a baseline. Identify your two weakest sections from the analytics. Spend the next 7-10 days revising those two sections from your notes, then attempt 3-4 more PYQ shifts back-to-back over 2 days to lock in speed. From there, alternate one PYQ per day with topic-wise quiz practice from AajExam until you have solved every available shift. The week before the exam, re-attempt 4-5 of your weakest papers — your second attempts should be 15-20% faster with measurably better accuracy.

Every paper on this page is free to attempt, mobile-friendly, and supports both English and Hindi explanations where applicable. New ${examName} shifts are added to AajExam within days of the official answer key release.`;
}

function buildFaqs({ exam, totalPapers }) {
    const examName = exam.name || 'this exam';

    return [
        {
            question: `How many ${examName} previous year papers are available on AajExam?`,
            answer: `AajExam currently hosts ${totalPapers} ${examName} ${totalPapers === 1 ? 'paper' : 'papers'} fully reconstructed as timed mock tests. New shifts are added regularly as official answer keys are released by the conducting body.`,
        },
        {
            question: `Are these PYQs free to attempt?`,
            answer: `Yes. The most recent ${examName} paper is always free for every user. The full archive of older shifts is available with a free AajExam account; certain older PYQs may be part of the PRO plan.`,
        },
        {
            question: `Are these papers the actual ${examName} questions or sample-based?`,
            answer: `Every paper here is reconstructed from the official ${examName} question paper for the specified date and shift. Answer keys are verified against the official key released by the conducting body, with subject-expert overrides for any disputed questions.`,
        },
        {
            question: `Can I download these PYQs as a PDF?`,
            answer: `AajExam delivers PYQs as interactive timed mock tests instead of static PDFs because the analytics, instant scoring and explanation flow are more effective for actual preparation. You can however export your performance report after each attempt.`,
        },
        {
            question: `In what order should I solve ${examName} PYQs?`,
            answer: `Start with the most recent year's paper to get a feel for the current pattern, then work backwards year by year. Within a single year, attempt one paper per day rather than batching to allow time for analysis and revision between attempts.`,
        },
        {
            question: `Do these mock tests support Hindi?`,
            answer: `Yes. Most ${examName} PYQs on AajExam ship with bilingual question support and Hindi answer explanations where the original paper was bilingual.`,
        },
    ];
}

export async function getServerSideProps({ params, res }) {
    try {
        await dbConnect();
        const { examSlug } = params || {};
        const { isObjectId, slugRedirect } = await import('../../../lib/web/slugRouting');

        if (!examSlug) return { notFound: true };

        // Resolve exam — slug or ObjectId fallback
        let examQuery;
        if (isObjectId(examSlug)) {
            const idDoc = await Exam.findById(examSlug).select('slug').lean();
            if (idDoc?.slug) return slugRedirect(`/pyq/${idDoc.slug}`);
            if (!idDoc) return { notFound: true };
            examQuery = { _id: examSlug, isActive: true };
        } else {
            examQuery = { slug: examSlug, isActive: true };
        }

        const exam = await Exam.findOne(examQuery)
            .select('name code slug description')
            .lean();
        if (!exam) return { notFound: true };

        // Find all patterns for this exam, then all PYQ tests under those patterns
        const patterns = await ExamPattern.find({ exam: exam._id }).select('_id').lean();
        const patternIds = patterns.map((p) => p._id);

        const tests = await PracticeTest.find({
            examPattern: { $in: patternIds },
            isPYQ: true,
            slug: { $exists: true, $ne: null },
        })
            .select('slug title pyqYear pyqShift duration totalMarks accessLevel publishedAt createdAt questions')
            .sort({ pyqYear: -1, publishedAt: -1, createdAt: -1 })
            .lean();

        const papers = tests.map((t) => ({
            _id: String(t._id),
            slug: t.slug,
            title: t.title,
            pyqYear: t.pyqYear || null,
            pyqShift: t.pyqShift || null,
            duration: t.duration,
            totalMarks: t.totalMarks,
            accessLevel: t.accessLevel,
            questionCount: Array.isArray(t.questions) ? t.questions.length : 0,
        }));

        // Group by year (descending)
        const papersByYear = {};
        papers.forEach((p) => {
            const key = String(p.pyqYear || 'Other');
            if (!papersByYear[key]) papersByYear[key] = [];
            papersByYear[key].push(p);
        });

        const years = Object.keys(papersByYear).sort((a, b) => Number(b) - Number(a));

        // Other exams that have PYQ papers
        const allPatternsAgg = await PracticeTest.aggregate([
            { $match: { isPYQ: true, slug: { $exists: true, $ne: null } } },
            { $group: { _id: '$examPattern', count: { $sum: 1 } } },
        ]);
        const patternCountMap = new Map(allPatternsAgg.map((r) => [String(r._id), r.count]));
        const allPatterns = await ExamPattern.find({ _id: { $in: allPatternsAgg.map((r) => r._id) } })
            .select('exam')
            .lean();
        const examIdToCount = new Map();
        allPatterns.forEach((p) => {
            const eid = String(p.exam);
            const cnt = patternCountMap.get(String(p._id)) || 0;
            examIdToCount.set(eid, (examIdToCount.get(eid) || 0) + cnt);
        });
        const otherExamIds = Array.from(examIdToCount.keys()).filter((id) => id !== String(exam._id));
        const otherExamDocs = await Exam.find({ _id: { $in: otherExamIds }, isActive: true, slug: { $exists: true, $ne: null } })
            .select('name slug')
            .lean();
        const otherExams = otherExamDocs
            .map((e) => ({
                slug: e.slug,
                name: e.name,
                paperCount: examIdToCount.get(String(e._id)) || 0,
            }))
            .sort((a, b) => b.paperCount - a.paperCount)
            .slice(0, 8);

        const intro = buildIntro({ exam, totalPapers: papers.length, years });
        const faqs = buildFaqs({ exam, totalPapers: papers.length });

        if (res) {
            res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
        }

        return {
            props: {
                exam: JSON.parse(JSON.stringify(exam)),
                papersByYear,
                totalPapers: papers.length,
                faqs,
                intro,
                otherExams,
            },
        };
    } catch (error) {
        console.error('Error loading PYQ exam index page:', error);
        return { notFound: true };
    }
}
