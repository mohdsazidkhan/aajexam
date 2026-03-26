import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaGraduationCap, FaPlay, FaClock, FaTrophy, FaCalendar, FaCheckCircle, FaUsers, FaChartLine } from 'react-icons/fa';
import { requireAuthForAction } from '../../lib/auth';
import UnifiedNavbar from '../../components/UnifiedNavbar';
import UnifiedFooter from '../../components/UnifiedFooter';
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Exam Not Found</h1>
                    <Link href="/exams">
                        <span className="text-primary-600 hover:text-red-700">← Back to Exams</span>
                    </Link>
                </div>
            </div>
        );
    }

    const examTitle = exam.name || exam.title || exam.description || 'Untitled Exam';

    return (
        <>
            <Head>
                <title>{examTitle} - Exam Details | AajExam</title>
                <meta name="description" content={exam.description || `Government exam: ${examTitle}`} />
                <meta name="keywords" content={`${examTitle}, government exam, mock test, practice exam`} />
                <meta property="og:title" content={`${examTitle} - Exam Details | AajExam`} />
                <meta property="og:description" content={exam.description} />
                <meta property="og:type" content="website" />
                <meta name="robots" content={robotsMeta || 'index, follow'} />
                <meta name="robots-reason" content={robotsReason || ''} />
            </Head>

            <UnifiedNavbar isLandingPage={true} />

            <div className="py-20 sm:py-10 min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 from-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
                <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link href="/exams">
                            <span className="text-primary-600 dark:text-red-400 hover:underline">Exams</span>
                        </Link>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-700 dark:text-gray-300">{examTitle}</span>
                    </div>

                    {/* Exam Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl mb-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <FaGraduationCap className="text-5xl text-primary-600 dark:text-red-400 mr-4" />
                            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                                {examTitle}
                            </h1>
                        </div>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                            {exam.description}
                        </p>

                        {/* Exam Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {exam.examDate && (
                                <div className="bg-secondary-50 dark:bg-secondary-900/30 rounded-lg p-4 text-center">
                                    <FaCalendar className="text-2xl text-secondary-600 dark:text-secondary-400 mx-auto mb-2" />
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(exam.examDate)}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Exam Date</div>
                                </div>
                            )}
                            {exam.duration && (
                                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                                    <FaClock className="text-2xl text-green-600 dark:text-green-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{exam.duration}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Minutes</div>
                                </div>
                            )}
                            {exam.totalMarks && (
                                <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 text-center">
                                    <FaTrophy className="text-2xl text-primary-700 dark:text-primary-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{exam.totalMarks}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Marks</div>
                                </div>
                            )}
                            {exam.passingMarks && (
                                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                                    <FaCheckCircle className="text-2xl text-primary-700 dark:text-primary-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{exam.passingMarks}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Passing Marks</div>
                                </div>
                            )}
                        </div>

                        {/* Start Exam Button */}
                        <button
                            onClick={handleStartExam}
                            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all font-bold text-lg flex items-center justify-center shadow-lg"
                        >
                            <FaPlay className="mr-3" /> Start Exam Now
                        </button>
                    </div>

                    {/* Instructions */}
                    {exam.instructions && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaCheckCircle className="text-primary-600 dark:text-red-400 mr-2" /> Instructions
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {exam.instructions}
                            </div>
                        </div>
                    )}

                    {/* Syllabus */}
                    {exam.syllabus && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Syllabus</h2>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {exam.syllabus}
                            </div>
                        </div>
                    )}

                    {/* Exam Statistics */}
                    {exam.stats && exam.stats.totalAttempts > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaChartLine className="text-primary-600 dark:text-red-400 mr-2" /> Exam Statistics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 text-center">
                                    <FaUsers className="text-2xl text-primary-600 dark:text-red-400 mx-auto mb-2" />
                                    <div className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{exam.stats.totalAttempts}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                                    <FaChartLine className="text-2xl text-green-600 dark:text-green-400 mx-auto mb-2" />
                                    <div className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{exam.stats.averageScore}%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 text-center">
                                    <FaTrophy className="text-2xl text-primary-700 dark:text-primary-400 mx-auto mb-2" />
                                    <div className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{exam.stats.highestScore}%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Highest Score</div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                                    <FaCheckCircle className="text-2xl text-primary-700 dark:text-primary-400 mx-auto mb-2" />
                                    <div className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{exam.stats.passRate}%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</div>
                                </div>
                            </div>
                            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                {exam.stats.passedCount} out of {exam.stats.totalAttempts} students passed this exam
                            </div>
                        </div>
                    )}

                    {/* Category */}
                    {exam.category && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Category</h2>
                            <Link href={`/categories/${exam.category._id}`}>
                                <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors cursor-pointer">
                                    {exam.category.name}
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <UnifiedFooter />
        </>
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
