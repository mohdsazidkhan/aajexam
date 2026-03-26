import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    FaQuestionCircle, FaClock, FaChartLine, FaUsers, FaArrowRight,
    FaFilter, FaSearch, FaBook, FaTh, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
// MobileAppWrapper import removed
import UnifiedNavbar from '../../components/UnifiedNavbar';
import UnifiedFooter from '../../components/UnifiedFooter';
import { requireAuthForAction } from '../../lib/auth';
import API from '../../lib/api';
import dbConnect from '../../lib/db';
import Quiz from '../../models/Quiz';

export default function QuizzesPage({ initialData }) {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState(initialData.quizzes || []);
    const [pagination, setPagination] = useState(initialData.pagination || {});
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        difficulty: '',
        category: '',
        page: 1
    });

    const handleStartQuiz = (quizId) => {
        if (requireAuthForAction(router, `/attempt-quiz/${quizId}`)) {
            router.push(`/attempt-quiz/${quizId}`);
        }
    };

    const handlePageChange = async (newPage) => {
        setLoading(true);
        try {
            const response = await API.getPublicQuizzes({ ...filters, page: newPage });
            if (response.success) {
                setQuizzes(response.data.quizzes);
                setPagination(response.data.pagination);
                setFilters({ ...filters, page: newPage });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
            case 'medium': return 'text-orange-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
            case 'hard': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
        }
    };

    return (
        <>
            <UnifiedNavbar isLandingPage={true} />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <section className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold mb-4">
                                <FaQuestionCircle className="w-4 h-4" />
                                <span>{pagination.totalQuizzes || 0} Quizzes Available</span>
                            </div>
                            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white mb-4">
                                Browse All Quizzes
                            </h1>
                            <p className="text-xl text-white/90 max-w-2xl mx-auto">
                                Practice with thousands of quizzes across multiple categories and difficulty levels
                            </p>
                        </div>
                    </div>
                </section>

                {/* Quizzes Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-20">
                                <FaQuestionCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600 dark:text-gray-400">No quizzes found</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                                    {quizzes.map((quiz) => (
                                        <div
                                            key={quiz._id}
                                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                                        >
                                            {/* Quiz Header */}
                                            <div className="bg-gradient-to-r from-yellow-500 to-red-600 p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(quiz.difficulty)}`}>
                                                        {quiz.difficulty || 'Medium'}
                                                    </span>
                                                    {quiz.category && (
                                                        <span className="text-white/90 text-sm flex items-center gap-1">
                                                            <FaBook className="w-3 h-3" />
                                                            {quiz.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-white line-clamp-2">
                                                    {quiz.title}
                                                </h3>
                                            </div>

                                            {/* Quiz Body */}
                                            <div className="p-3 lg:p-6">
                                                {quiz.description && (
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                                        {quiz.description}
                                                    </p>
                                                )}

                                                {quiz.subcategory && (
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <FaTh className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {quiz.subcategory.name}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Stats */}
                                                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-orange-700 dark:text-yellow-400">
                                                            {quiz.questionCount || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">Questions</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                                                            <FaClock className="w-4 h-4" />
                                                            {quiz.timeLimit || 30}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">Minutes</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                            {quiz.attemptsCount || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">Attempts</div>
                                                    </div>
                                                </div>

                                                {/* Average Score */}
                                                {quiz.stats?.averageScore > 0 && (
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <FaChartLine className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            Avg Score: <span className="font-bold text-orange-700 dark:text-yellow-400">{quiz.stats.averageScore}%</span>
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <Link href={`/quiz/${quiz._id}`} className="flex-1">
                                                        <button className="w-full px-4 py-2 border-2 border-yellow-600 text-orange-700 dark:text-yellow-400 dark:border-yellow-400 rounded-lg font-semibold hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-300">
                                                            Details
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleStartQuiz(quiz._id)}
                                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-red-600 text-white rounded-lg font-semibold hover:from-yellow-700 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                                                    >
                                                        <span>Start Quiz</span>
                                                        <FaArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-12 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                                        >
                                            <FaChevronLeft className="w-4 h-4" />

                                        </button>

                                        <div className="flex items-center gap-2">
                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                                const pageNum = pagination.currentPage <= 3
                                                    ? idx + 1
                                                    : pagination.currentPage + idx - 2;

                                                if (pageNum > pagination.totalPages) return null;

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-2 lg:px-4 py-1 lg:py-2 rounded-lg font-semibold transition-all duration-300 ${pageNum === pagination.currentPage
                                                            ? 'bg-gradient-to-r from-yellow-600 to-red-600 text-white'
                                                            : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={!pagination.hasMore}
                                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                                        >

                                            <FaChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Page Info */}
                                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalQuizzes)} of {pagination.totalQuizzes} quizzes
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
            <UnifiedFooter />
        </>
    );
}

export async function getServerSideProps(context) {
    try {
        const { page = 1, limit = 20, category, subcategory, difficulty, search } = context.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        await dbConnect();

        const query = { isActive: true, status: 'approved' };
        if (category) query.category = category;
        if (subcategory) query.subcategory = subcategory;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [quizzes, total] = await Promise.all([
            Quiz.find(query)
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .select('title description difficulty attemptsCount questionCount timeLimit levels stats category subcategory createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Quiz.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        return {
            props: {
                initialData: {
                    quizzes: JSON.parse(JSON.stringify(quizzes)),
                    pagination: {
                        currentPage: pageNum,
                        totalPages,
                        totalQuizzes: total,
                        limit: limitNum,
                        hasMore: pageNum < totalPages
                    }
                }
            }
        };
    } catch (error) {
        console.error('Error in quizzes index getServerSideProps:', error);
        return {
            props: {
                initialData: {
                    quizzes: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalQuizzes: 0,
                        limit: 20,
                        hasMore: false
                    }
                }
            }
        };
    }
}
