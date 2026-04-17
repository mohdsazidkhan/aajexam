import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaGraduationCap, FaPlay, FaClock, FaTrophy, FaCalendar, FaCheckCircle, FaUsers, FaChartLine } from 'react-icons/fa';
import { requireAuthForAction } from '../../lib/auth';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import { generateQuizSchema, generateBreadcrumbSchema, renderSchemas } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';
import dbConnect from '../../lib/db';
import Exam from '../../models/Exam';
import mongoose from 'mongoose';

export default function ExamDetailPage({ exam, robotsMeta, robotsReason }) {
    const router = useRouter();

    const handleStartExam = () => {
        if (requireAuthForAction(router, `/exams/${exam._id}/attempt`)) {
            router.push(`/exams/${exam._id}/attempt`);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        });
    };

    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-4">Exam Not Found</h1>
                    <Link href="/exams">
                        <span className="text-primary-600 hover:text-red-700">← Back to Exams</span>
                    </Link>
                </div>
            </div>
        );
    }

    const examTitle = exam.name || exam.title || exam.description || 'Untitled Exam';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
    const canonicalUrl = getCanonicalUrl(router.asPath);
    const examDescription = exam.description || `Practice ${examTitle} exam on AajExam - Government exam preparation platform with comprehensive practice tests.`;

    const quizSchema = generateQuizSchema({
        title: examTitle,
        description: examDescription,
        educationalDescription: exam.description,
        categoryName: exam.category?.name,
        timeLimit: exam.duration
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Exams', url: '/exams' },
        { name: examTitle }
    ]);

    return (
        <MobileAppWrapper title={examTitle}>
            <Head>
                <title>{examTitle} - Practice Test | AajExam</title>
                <meta name="description" content={examDescription.slice(0, 160)} />
                <link rel="canonical" href={canonicalUrl} />
                <meta name="robots" content={robotsMeta || 'index, follow'} />

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="AajExam" />
                <meta property="og:title" content={`${examTitle} - Practice Test | AajExam`} />
                <meta property="og:description" content={examDescription.slice(0, 160)} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={`${siteUrl}/logo.png`} />
                <meta property="og:image:width" content="512" />
                <meta property="og:image:height" content="512" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@AajExam" />
                <meta name="twitter:title" content={`${examTitle} - Practice Test`} />
                <meta name="twitter:description" content={examDescription.slice(0, 160)} />
                <meta name="twitter:image" content={`${siteUrl}/logo.png`} />

                {renderSchemas([quizSchema, breadcrumbSchema])}
            </Head>

            <div className="py-4 lg:py-8 h-auto lg:min-h-screen  px-4 font-outfit relative overflow-hidden">
                {/* Background atmosphere */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto py-4 lg:py-8 px-4 space-y-6">
                    {/* Breadcrumb */}
                    <div className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Link href="/exams">
                            <span className="text-primary-700 dark:text-primary-400 hover:text-primary-500 transition-colors">Exams</span>
                        </Link>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600 dark:text-slate-400">{examTitle}</span>
                    </div>

                    {/* Exam Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <div className="flex items-center mb-8">
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mr-6 shadow-duo-primary border-2 border-white dark:border-slate-800">
                                <FaGraduationCap className="text-3xl text-primary-600 dark:text-primary-400" />
                            </div>
                            <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {examTitle}
                            </h1>
                        </div>
                        <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-4xl">
                            {exam.description}
                        </p>

                        {/* Exam Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {exam.examDate && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 text-center border-2 border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <FaCalendar className="text-xl text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{formatDate(exam.examDate)}</div>
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Exam Date</div>
                                </div>
                            )}
                            {exam.duration && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 text-center border-2 border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <FaClock className="text-xl text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{exam.duration}</div>
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Minutes</div>
                                </div>
                            )}
                            {exam.totalMarks && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 text-center border-2 border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <FaTrophy className="text-xl text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{exam.totalMarks}</div>
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Marks</div>
                                </div>
                            )}
                            {exam.passingMarks && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 text-center border-2 border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <FaCheckCircle className="text-xl text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{exam.passingMarks}</div>
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Passing Marks</div>
                                </div>
                            )}
                        </div>

                        {/* Start Exam Button */}
                        <button
                            onClick={handleStartExam}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white px-8 py-5 rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center shadow-duo-primary border-b-8 border-primary-700 active:translate-y-1 active:border-b-0"
                        >
                            <FaPlay className="mr-3 text-xs" /> Start Exam Now
                        </button>
                    </div>

                    {/* Instructions */}
                    {exam.instructions && (
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center">
                                <FaCheckCircle className="text-primary-600 mr-4" /> Instructions
                            </h2>
                            <div className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed whitespace-pre-line text-lg">
                                {exam.instructions}
                            </div>
                        </div>
                    )}

                    {/* Syllabus */}
                    {exam.syllabus && (
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center">
                                <FaGraduationCap className="text-primary-600 mr-4" /> Syllabus
                            </h2>
                            <div className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed whitespace-pre-line text-lg">
                                {exam.syllabus}
                            </div>
                        </div>
                    )}

                    {/* Exam Statistics */}
                    {exam.stats && exam.stats.totalAttempts > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center">
                                <FaChartLine className="text-primary-600 mr-4" /> Exam Statistics
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 text-center border-2 border-slate-100 dark:border-slate-800">
                                    <FaUsers className="text-3xl text-primary-600 mx-auto mb-4" />
                                    <div className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{exam.stats.totalAttempts}</div>
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Attempts</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 text-center border-2 border-slate-100 dark:border-slate-800">
                                    <FaChartLine className="text-3xl text-emerald-600 mx-auto mb-4" />
                                    <div className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{exam.stats.averageScore}%</div>
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Average Score</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 text-center border-2 border-slate-100 dark:border-slate-800">
                                    <FaTrophy className="text-3xl text-orange-600 mx-auto mb-4" />
                                    <div className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{exam.stats.highestScore}%</div>
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Highest Score</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 text-center border-2 border-slate-100 dark:border-slate-800">
                                    <FaCheckCircle className="text-3xl text-primary-600 mx-auto mb-4" />
                                    <div className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{exam.stats.passRate}%</div>
                                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pass Rate</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category */}
                </div>
            </div>
        </MobileAppWrapper>
    );
}

export async function getServerSideProps({ params }) {
    try {
        await dbConnect();
        const { examId } = params;

        let query = { isActive: true };
        if (mongoose.Types.ObjectId.isValid(examId)) {
            query._id = examId;
        } else {
            query.code = examId.toUpperCase();
        }

        // Get exam details without questions
        const exam = await Exam.findOne(query)
            .select('name description examDate duration totalMarks passingMarks category instructions syllabus createdAt code')
            .populate('category', 'name description')
            .lean();

        if (!exam) {
            return { notFound: true };
        }

        // Return empty stats for now to prevent crash
        const stats = {
            totalAttempts: 0,
            averageScore: 0,
            highestScore: 0,
            passedCount: 0
        };

        const enhancedExam = {
            ...exam,
            stats: {
                totalAttempts: stats.totalAttempts,
                averageScore: Math.round(stats.averageScore || 0),
                highestScore: stats.highestScore || 0,
                passedCount: stats.passedCount,
                passRate: stats.totalAttempts > 0
                    ? Math.round((stats.passedCount / stats.totalAttempts) * 100)
                    : 0
            }
        };

        // Determine robots meta server-side to influence indexing (SSR-safe)
        const { getRobotsMeta } = require('../../utils/robotsMeta');
        const robots = getRobotsMeta(enhancedExam, {
            threshold: process.env.QUIZ_CONTENT_SCORE_THRESHOLD ? parseFloat(process.env.QUIZ_CONTENT_SCORE_THRESHOLD) : undefined,
            minIntroWords: process.env.QUIZ_MIN_INTRO_WORDS ? parseInt(process.env.QUIZ_MIN_INTRO_WORDS, 10) : undefined,
            enabled: process.env.QUIZ_NOINDEX_ENABLED ? (process.env.QUIZ_NOINDEX_ENABLED === 'true') : undefined,
            safeMode: process.env.QUIZ_SAFE_MODE ? (process.env.QUIZ_SAFE_MODE === 'true') : undefined,
        });

        return {
            props: {
                exam: JSON.parse(JSON.stringify(enhancedExam)),
                robotsMeta: robots.robots,
                robotsReason: robots.reason,
            },
        };
    } catch (error) {
        console.error('Error fetching exam preview:', error);
        return {
            props: {
                exam: null,
            },
        };
    }
}
