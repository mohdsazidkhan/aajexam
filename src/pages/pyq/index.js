import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FileText, Clock, Trophy, BookOpen, ChevronRight } from 'lucide-react';
import { FaGraduationCap, FaArrowRight, FaBookOpen } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import { ProBadge } from '../../components/ui';
import { hasProSubscription } from '../../lib/utils/subscriptionUtils';
import { Lock } from 'lucide-react';
import Seo from '../../components/Seo';
import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateItemListSchema,
} from '../../utils/schema';
import dbConnect from '../../lib/db';
import Exam from '../../models/Exam';
import ExamPattern from '../../models/ExamPattern';
import PracticeTest from '../../models/PracticeTest';

const PAGE_SIZE = 20;

export default function PYQIndexPage({ tests, totalPages, page, year, examId, exams, examsWithPYQ, totalPYQs, intro, faqs, years }) {
    const router = useRouter();
    const [filterYear, setFilterYear] = useState(year || '');
    const [filterExam, setFilterExam] = useState(examId || '');

    const updateQuery = (next) => {
        const q = { ...router.query, ...next };
        if (next.year === '') delete q.year;
        if (next.examId === '') delete q.examId;
        if (next.page === 1) delete q.page;
        router.push({ pathname: '/pyq', query: q });
    };

    const onYearChange = (e) => {
        setFilterYear(e.target.value);
        updateQuery({ year: e.target.value, page: 1 });
    };
    const onExamChange = (e) => {
        setFilterExam(e.target.value);
        updateQuery({ examId: e.target.value, page: 1 });
    };

    const seoTitle = 'Previous Year Question Papers (PYQ) – Free Solved PYQ Mock Tests for SSC, RRB, IBPS, UPSC | AajExam';
    const seoDesc = `Practise ${totalPYQs}+ verified previous year question papers (PYQ) for SSC CGL, CHSL, GD, MTS, RRB NTPC, IBPS PO/Clerk, SBI Clerk and UPSC — year-wise, shift-wise, with detailed solutions on AajExam.`.slice(0, 160);

    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'Previous Year Papers', url: '/pyq' },
    ];

    const schemas = [
        generateBreadcrumbSchema(breadcrumbItems),
        generateFAQSchema(faqs),
        generateItemListSchema({
            name: 'Previous Year Question Papers by Exam',
            items: examsWithPYQ.map((e) => ({ name: `${e.name} PYQ`, url: `/pyq/${e.slug}` })),
        }),
    ];

    return (
        <>
            <Seo
                title={seoTitle}
                description={seoDesc}
                canonical="/pyq"
                keywords={[
                    'previous year question paper',
                    'PYQ',
                    'SSC CHSL previous year paper',
                    'SSC CGL previous year paper',
                    'SSC GD previous year paper',
                    'RRB NTPC previous year paper',
                    'IBPS PO previous year paper',
                    'IBPS Clerk previous year paper',
                    'SBI Clerk previous year paper',
                    'UPSC previous year paper',
                    'free PYQ with solutions',
                    'aajexam pyq',
                ]}
                schemas={schemas}
            />

            <div className="min-h-screen pb-24 px-4 font-outfit relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-0 lg:px-4 py-4 lg:py-8 space-y-8 relative">
                    {/* Header / breadcrumb */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Link href="/" className="text-primary-700 dark:text-primary-400 hover:text-primary-500">Home</Link>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600 dark:text-slate-400">Previous Year Papers</span>
                    </nav>

                    {/* Hero */}
                    <header className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                            <div className="space-y-2">
                                <span className="block text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">PYQ Library</span>
                                <h1 className="text-2xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-center gap-3">
                                    <FileText className="w-7 h-7 lg:w-10 lg:h-10 text-primary-500" />
                                    Previous Year Papers
                                </h1>
                                <p className="text-sm lg:text-lg font-bold text-slate-500 dark:text-slate-400 max-w-2xl">
                                    {totalPYQs} verified PYQ {totalPYQs === 1 ? 'paper' : 'papers'} across {examsWithPYQ.length} {examsWithPYQ.length === 1 ? 'exam' : 'exams'} — practise with real questions, real timing, and detailed solutions.
                                </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <select
                                    value={filterExam}
                                    onChange={onExamChange}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                                >
                                    <option value="">All Exams</option>
                                    {exams.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                                <select
                                    value={filterYear}
                                    onChange={onYearChange}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                                >
                                    <option value="">All Years</option>
                                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </header>

                    {/* Browse by exam — high-value internal linking for SEO */}
                    {examsWithPYQ.length > 0 && (
                        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight flex items-center">
                                <FaGraduationCap className="text-primary-600 mr-3" /> Browse PYQs by Exam
                            </h2>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6">
                                Pick an exam to view its complete PYQ archive year-wise and shift-wise.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {examsWithPYQ.map((e) => (
                                    <Link key={e.slug} href={`/pyq/${e.slug}`} className="group block bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 lg:p-5 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition">
                                        <div className="text-sm lg:text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition mb-1 leading-tight">{e.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                            {e.paperCount} {e.paperCount === 1 ? 'paper' : 'papers'} <FaArrowRight className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Long-form intro */}
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center">
                            <FaBookOpen className="text-primary-600 mr-3" /> Why Solve PYQs?
                        </h2>
                        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-base lg:text-lg whitespace-pre-line">
                            {intro}
                        </div>
                    </section>

                    {/* Latest / filtered list */}
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                            <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {filterExam || filterYear ? 'Filtered Papers' : 'Latest PYQ Papers'}
                            </h2>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                {tests.length} of {totalPYQs} shown
                            </span>
                        </div>

                        {tests.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold">No PYQ papers match the current filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tests.map((test, i) => {
                                    const isPro = !test.isLastYear;
                                    const hasAccess = !isPro || hasProSubscription();
                                    const examSlug = test.examSlug;
                                    const linkHref = examSlug && test.slug ? `/pyq/${examSlug}/${test.slug}` : `/govt-exams/test/${test.slug}/start`;
                                    return (
                                        <Card
                                            key={test._id || i}
                                            className="p-5 hover:shadow-xl transition-all cursor-pointer border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500"
                                            onClick={() => {
                                                if (hasAccess) router.push(linkHref);
                                                else router.push('/subscription');
                                            }}
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-[10px] font-black text-primary-600">{test.pyqYear || 'PYQ'}</span>
                                                        {test.isLastYear && <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-[10px] font-black text-emerald-600">LATEST</span>}
                                                    </div>
                                                    {test.pyqShift && <span className="text-[10px] font-bold text-slate-400">{test.pyqShift}</span>}
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">{test.title}</h3>
                                                {test.examName && <p className="text-[10px] font-bold text-slate-400">{test.examName}</p>}
                                                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                                                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{test.questionCount || 0} Q</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{test.duration} min</span>
                                                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{test.totalMarks} marks</span>
                                                </div>
                                                <div className="pt-2 flex items-center justify-between">
                                                    {isPro ? (
                                                        <div className="flex items-center gap-1">
                                                            <ProBadge size="xs" />
                                                            {!hasAccess && <Lock className="w-3 h-3 text-slate-400" />}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Free Access</span>
                                                    )}
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-primary-500">
                                                        {hasAccess ? 'Practice Now' : 'Unlock with PRO'} <ChevronRight className="w-3 h-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <button disabled={page === 1} onClick={() => updateQuery({ page: page - 1 })} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
                                <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
                                <button disabled={page === totalPages} onClick={() => updateQuery({ page: page + 1 })} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
                            </div>
                        )}
                    </section>

                    {/* FAQ */}
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-2xl border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
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
                </div>
            </div>
        </>
    );
}

function buildIntro({ totalPYQs, examsWithPYQ }) {
    const examNames = examsWithPYQ.slice(0, 6).map((e) => e.name).join(', ') || 'top government exams';
    return `Previous Year Question Papers (PYQs) are the most reliable, exam-replicating practice resource available to government competitive exam aspirants. AajExam hosts ${totalPYQs} solved PYQ ${totalPYQs === 1 ? 'paper' : 'papers'} covering ${examNames}, with more shifts being added every week as official answer keys are released. Each paper on this platform is reconstructed into a fully timer-based mock test, so you experience the actual exam pattern, sectional ordering, negative-marking scheme and time pressure exactly as you would on the real day.

Why PYQ practice outranks every other prep strategy: government recruitment exams like SSC, RRB and IBPS draw from a remarkably stable question bank — patterns, formula applications, theme-based questions and difficulty distribution repeat year after year. Toppers consistently report that solving 8-12 PYQ shifts per exam was the single most leveraged investment of their preparation time. PYQs also reveal high-yield chapters with surgical precision: when you see the same chapter appear in 18 of the last 20 shifts, you know exactly where to focus revision instead of studying the entire syllabus uniformly.

How AajExam's PYQ archive is built: every paper is reconstructed from the official question paper and the answer key released by the conducting body (SSC, RRB, IBPS, SBI, UPSC, State PSCs). Where the conducting body's response sheet conflicts with subject-expert consensus, our review panel applies a verified override and documents it in the question explanation. All PYQs ship with detailed step-by-step solutions, concept references, and bilingual support (English and Hindi) where the original paper was bilingual.

How to get the most out of these PYQs: start with the most recent year's paper for your target exam to establish a baseline. Identify your two weakest sections from the auto-generated analytics. Spend the next 7-10 days revising those sections from notes, then attempt 3-4 PYQ shifts back-to-back over a weekend to lock in speed. From there, alternate one PYQ per day with topic-wise quiz practice from the AajExam library until you have solved every available shift for your exam. The week before the exam, re-attempt 4-5 of your weakest papers — your second attempts should be 15-20% faster with measurably better accuracy.

The latest year's PYQ is always free for every user. Older shifts are accessible with a free AajExam account; certain older PYQs may be part of the AajExam PRO plan, which also unlocks all-India ranking, downloadable performance reports, and exam-wise analytics dashboards.`;
}

function buildFaqs({ totalPYQs }) {
    return [
        {
            question: 'Are previous year question papers free on AajExam?',
            answer: `Yes, the latest year's PYQ for every exam is completely free. Older shifts are accessible with a free AajExam account, and certain older PYQ archives are unlocked with the AajExam PRO plan.`,
        },
        {
            question: 'Do AajExam PYQs include answer keys and explanations?',
            answer: 'Yes. Every PYQ on AajExam includes the verified answer key, step-by-step explanations, concept references and section-wise score analysis after submission.',
        },
        {
            question: 'Which exams have PYQs on AajExam?',
            answer: 'AajExam covers PYQs for SSC CHSL, SSC CGL, SSC MTS, SSC GD, SSC Selection Post, RRB NTPC, RRB Group D, IBPS PO, IBPS Clerk, SBI PO, SBI Clerk, UPSC, and major State PSC exams. New shifts are added regularly as answer keys are released.',
        },
        {
            question: 'Are these PYQs just PDFs or can I attempt them as a real test?',
            answer: 'Every PYQ on AajExam is delivered as a fully interactive timed mock test rather than a static PDF. You attempt it under real exam conditions — duration, sectional ordering, negative marking — and get instant scoring with analytics on submission.',
        },
        {
            question: 'How many PYQ papers are available right now?',
            answer: `AajExam currently hosts ${totalPYQs} solved PYQ ${totalPYQs === 1 ? 'paper' : 'papers'}. New papers are added every week as the conducting bodies release official answer keys.`,
        },
        {
            question: 'In what order should I solve PYQs?',
            answer: 'Start with the most recent year for your target exam, then work backwards year by year. Within a single year, attempt one paper per day rather than batching, so you have time for analysis and revision between attempts.',
        },
    ];
}

export async function getServerSideProps({ query, res }) {
    try {
        await dbConnect();

        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const yearFilter = query.year ? parseInt(query.year, 10) || null : null;
        const examIdFilter = query.examId && /^[a-f0-9]{24}$/i.test(query.examId) ? query.examId : null;

        // Build pattern filter for the optional examId
        let patternFilter = {};
        if (examIdFilter) {
            const patterns = await ExamPattern.find({ exam: examIdFilter }).select('_id').lean();
            patternFilter = { examPattern: { $in: patterns.map((p) => p._id) } };
        }

        const matchFilter = {
            isPYQ: true,
            slug: { $exists: true, $ne: null },
            ...(yearFilter ? { pyqYear: yearFilter } : {}),
            ...patternFilter,
        };

        const totalCount = await PracticeTest.countDocuments(matchFilter);
        const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

        const testDocs = await PracticeTest.find(matchFilter)
            .select('slug title pyqYear pyqShift duration totalMarks accessLevel publishedAt createdAt examPattern questions')
            .populate({ path: 'examPattern', select: 'exam', populate: { path: 'exam', select: 'name slug' } })
            .sort({ pyqYear: -1, publishedAt: -1, createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean();

        // Determine "latest year" per exam to mark isLastYear (free flag)
        const examIds = [...new Set(testDocs.map((t) => String(t.examPattern?.exam?._id || '')).filter(Boolean))];
        const maxYearByExam = {};
        await Promise.all(examIds.map(async (eid) => {
            const patterns = await ExamPattern.find({ exam: eid }).select('_id').lean();
            const maxYearDoc = await PracticeTest.findOne({
                examPattern: { $in: patterns.map((p) => p._id) },
                isPYQ: true,
            }).sort({ pyqYear: -1 }).select('pyqYear').lean();
            maxYearByExam[eid] = maxYearDoc?.pyqYear || null;
        }));

        const tests = testDocs.map((t) => {
            const eid = String(t.examPattern?.exam?._id || '');
            return {
                _id: String(t._id),
                slug: t.slug,
                title: t.title,
                pyqYear: t.pyqYear || null,
                pyqShift: t.pyqShift || null,
                duration: t.duration,
                totalMarks: t.totalMarks,
                accessLevel: t.accessLevel,
                questionCount: Array.isArray(t.questions) ? t.questions.length : 0,
                examName: t.examPattern?.exam?.name || null,
                examSlug: t.examPattern?.exam?.slug || null,
                isLastYear: maxYearByExam[eid] != null && Number(t.pyqYear) === Number(maxYearByExam[eid]),
            };
        });

        // Total PYQs across all exams (for header & intro stats)
        const totalPYQs = await PracticeTest.countDocuments({ isPYQ: true, slug: { $exists: true, $ne: null } });

        // Per-exam PYQ counts → list of exams with PYQs (for browse-by-exam grid)
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
        const examsWithPYQDocs = await Exam.find({
            _id: { $in: Array.from(examIdToCount.keys()) },
            isActive: true,
            slug: { $exists: true, $ne: null },
        }).select('name slug').lean();
        const examsWithPYQ = examsWithPYQDocs
            .map((e) => ({
                slug: e.slug,
                name: e.name,
                paperCount: examIdToCount.get(String(e._id)) || 0,
            }))
            .sort((a, b) => b.paperCount - a.paperCount);

        // Exam dropdown options (only exams with PYQs)
        const exams = examsWithPYQDocs.map((e) => ({
            _id: String(e._id),
            name: e.name,
        }));

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

        const intro = buildIntro({ totalPYQs, examsWithPYQ });
        const faqs = buildFaqs({ totalPYQs });

        if (res) {
            res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
        }

        return {
            props: {
                tests,
                totalPages,
                page,
                year: yearFilter || '',
                examId: examIdFilter || '',
                exams,
                examsWithPYQ,
                totalPYQs,
                intro,
                faqs,
                years,
            },
        };
    } catch (error) {
        console.error('Error loading PYQ index page:', error);
        return {
            props: {
                tests: [],
                totalPages: 1,
                page: 1,
                year: '',
                examId: '',
                exams: [],
                examsWithPYQ: [],
                totalPYQs: 0,
                intro: '',
                faqs: [],
                years: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i),
            },
        };
    }
}
