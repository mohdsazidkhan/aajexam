import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaQuestionCircle, FaPlay, FaClock, FaChartBar, FaTrophy, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { requireAuthForAction } from '../../lib/auth';
import API from '../../lib/api';
import dbConnect from '../../lib/db';
import Quiz from '../../models/Quiz';
import Category from '../../models/Category';
import Level from '../../models/Level';

export default function QuizPreviewPage({ quiz, robotsMeta, robotsReason }) {
    const router = useRouter();

    const handleStartQuiz = () => {
        if (requireAuthForAction(router, `/quiz/${quiz._id}/attempt`)) {
            router.push(`/quiz/${quiz._id}/attempt`);
        }
    };

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Quiz Not Found</h1>
                    <Link href="/categories">
                        <span className="text-red-600 hover:text-red-700">← Browse Categories</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{quiz.title} - Quiz Preview | SUBG QUIZ</title>
                <meta name="description" content={quiz.description || `Practice quiz: ${quiz.title}`} />
                <meta name="keywords" content={`${quiz.title}, quiz, practice test, ${quiz.category?.name || 'government exam'}`} />
                <meta property="og:title" content={`${quiz.title} - Quiz Preview | SUBG QUIZ`} />
                <meta property="og:description" content={quiz.description} />
                <meta property="og:type" content="website" />
                <meta name="robots" content={robotsMeta || 'index, follow'} />
                {/* Short reason string (safe to expose) for debugging / monitoring. Example: 'low_score:0.233<0.5' or 'ok:0.712>=0.5' */}
                <meta name="robots-reason" content={robotsReason || ''} />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 from-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-5 lg: py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link href="/categories">
                            <span className="text-red-600 dark:text-red-400 hover:underline">Categories</span>
                        </Link>
                        {quiz.category && (
                            <>
                                <span className="mx-2 text-gray-400">→</span>
                                <Link href={`/categories/${quiz.category._id}`}>
                                    <span className="text-red-600 dark:text-red-400 hover:underline">{quiz.category.name}</span>
                                </Link>
                            </>
                        )}
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-700 dark:text-gray-300">{quiz.title}</span>
                    </div>

                    {/* Quiz Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl mb-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <FaQuestionCircle className="text-4xl text-red-600 dark:text-red-400 mr-4" />
                            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                                {quiz.title}
                            </h1>
                        </div>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                            {quiz.description}
                        </p>

                        {/* Quiz Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {quiz.totalQuestions && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 text-center">
                                    <FaQuestionCircle className="text-2xl text-red-600 dark:text-red-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.totalQuestions}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                                </div>
                            )}
                            {quiz.timeLimit && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                                    <FaClock className="text-2xl text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.timeLimit}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
                                </div>
                            )}
                            {quiz.difficulty && (
                                <div className={`rounded-lg p-4 text-center ${quiz.difficulty === 'easy' ? 'bg-green-50 dark:bg-green-900/30' :
                                    quiz.difficulty === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
                                        'bg-red-50 dark:bg-red-900/30'
                                    }`}>
                                    <FaChartBar className={`text-2xl mx-auto mb-2 ${quiz.difficulty === 'easy' ? 'text-green-600 dark:text-green-400' :
                                        quiz.difficulty === 'medium' ? 'text-orange-700 dark:text-yellow-400' :
                                            'text-red-600 dark:text-red-400'
                                        }`} />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{quiz.difficulty}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Difficulty</div>
                                </div>
                            )}
                            {quiz.level && (
                                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                                    <FaTrophy className="text-2xl text-orange-700 dark:text-yellow-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">Level {quiz.level.levelNumber}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{quiz.level.name}</div>
                                </div>
                            )}
                        </div>

                        {/* Start Quiz Button */}
                        <button
                            onClick={handleStartQuiz}
                            className="w-full bg-gradient-to-r from-yellow-600 to-red-600 text-white px-8 py-4 rounded-xl hover:from-yellow-700 hover:to-red-700 transition-all font-bold text-lg flex items-center justify-center shadow-lg"
                        >
                            <FaPlay className="mr-3" /> Start Quiz Now
                        </button>
                    </div>

                    {/* Educational Content */}
                    {quiz.educationalDescription && quiz.educationalDescription.trim() !== '' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Quiz</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{quiz.educationalDescription}</p>
                        </div>
                    )}

                    {/* Syllabus Covered */}
                    {quiz.syllabusCovered && quiz.syllabusCovered.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Syllabus Covered</h2>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                <ul className="list-disc pl-5">
                                    {quiz.syllabusCovered.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Learning Outcomes */}
                    {quiz.learningOutcomes && quiz.learningOutcomes.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaCheckCircle className="text-green-500 mr-2" /> Learning Outcomes
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                <ul className="list-disc pl-5">
                                    {quiz.learningOutcomes.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Exam Relevance */}
                    {quiz.examRelevance && quiz.examRelevance.trim() !== '' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Exam Relevance</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{quiz.examRelevance}</p>
                        </div>
                    )}

                    {/* Quiz Statistics */}
                    {quiz.stats && quiz.stats.totalAttempts > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaUsers className="text-red-600 dark:text-red-400 mr-2" /> Quiz Statistics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{quiz.stats.totalAttempts}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{quiz.stats.averageScore}%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-700 dark:text-yellow-400">{quiz.stats.highestScore}%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Highest Score</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {quiz.tags && quiz.tags.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {quiz.tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-red-700 dark:text-red-300 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps({ params }) {
    try {
        await dbConnect();
        const quizDoc = await Quiz.findById(params.quizId)
            .populate('category', 'name')
            .populate('level', 'levelNumber name')
            .lean();

        if (!quizDoc || quizDoc.status !== 'approved') {
            return {
                props: {
                    quiz: null,
                },
            };
        }

        const quizObj = JSON.parse(JSON.stringify(quizDoc));

        // Determine robots meta server-side to influence indexing (SSR-safe)
        const { getRobotsMeta } = require('../../utils/robotsMeta');
        const robots = getRobotsMeta(quizObj, {
            threshold: process.env.QUIZ_CONTENT_SCORE_THRESHOLD ? parseFloat(process.env.QUIZ_CONTENT_SCORE_THRESHOLD) : undefined,
            minIntroWords: process.env.QUIZ_MIN_INTRO_WORDS ? parseInt(process.env.QUIZ_MIN_INTRO_WORDS, 10) : undefined,
            enabled: process.env.QUIZ_NOINDEX_ENABLED ? (process.env.QUIZ_NOINDEX_ENABLED === 'true') : undefined,
            safeMode: process.env.QUIZ_SAFE_MODE ? (process.env.QUIZ_SAFE_MODE === 'true') : undefined,
        });

        return {
            props: {
                quiz: quizObj,
                robotsMeta: robots.robots,
                robotsReason: robots.reason,
            },
        };
    } catch (error) {
        console.error('Error in quiz preview getServerSideProps:', error);
        return {
            props: {
                quiz: null,
            },
        };
    }
}
