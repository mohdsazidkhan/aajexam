import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    FaQuestionCircle, FaClock, FaChartLine, FaUsers, FaArrowRight,
    FaFilter, FaSearch, FaBook, FaTh, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
// MobileAppWrapper import removed
// UnifiedNavbar removed
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
            case 'medium': return 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30';
            case 'hard': return 'text-primary-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
        }
    };

    return (
        <MobileAppWrapper showHeader={true} title="All Quizzes">
            <div className="min-h-screen bg-white dark:bg-slate-950 font-outfit">
                {/* Header */}
                <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-950">
                    {/* Background atmosphere */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="container mx-auto px-4 lg:px-0 relative z-10 mt-4 text-center">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            <FaQuestionCircle className="w-4 h-4 text-primary-400" />
                            <span>{pagination.totalQuizzes || 0} Quizzes Available</span>
                        </div>
                        <h1 className="text-xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-8">
                            Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-400">Everything</span>
                        </h1>
                        <p className="text-md lg:text-xl font-bold text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Master any subject with our collection of interactive quizzes designed for competitive excellence.
                        </p>
                    </div>
                </section>

                {/* Quizzes Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-20">
                                <FaQuestionCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600 dark:text-gray-400">No quizzes found</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {quizzes.map((quiz) => (
                                        <div
                                            key={quiz._id}
                                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-2xl -mr-16 -mt-16" />

                                            <div className="p-8 relative z-10">
                                                {/* Card Header */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${quiz.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30' :
                                                        quiz.difficulty?.toLowerCase() === 'medium' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-primary-100 dark:border-primary-900/30' :
                                                            'bg-red-50 dark:bg-red-900/20 text-primary-600 border-red-100 dark:border-red-900/30'
                                                        }`}>
                                                        {quiz.difficulty || 'Medium'}
                                                    </span>
                                                    {quiz.category && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            {quiz.category.name}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-2 mb-4 group-hover:text-primary-600 transition-colors">
                                                    {quiz.title}
                                                </h3>

                                                {quiz.description && (
                                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8 line-clamp-2 leading-relaxed">
                                                        {quiz.description}
                                                    </p>
                                                )}

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-3 gap-4 py-6 border-y-2 border-slate-100 dark:border-slate-800 mb-8">
                                                    <div className="text-center">
                                                        <div className="text-xl font-black text-primary-600">{quiz.sampleQuestions?.length || 0}</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Questions</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-black text-primary-600">{quiz.timeLimit || 30}m</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Time</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-black text-emerald-600">{quiz.requiredLevel || 1}</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Level Required</div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-4">
                                                    <Link href={`/quiz/${quiz._id}`} className="flex-1">
                                                        <button className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-duo border-b-4 border-slate-200 dark:border-slate-700 active:translate-y-1 active:border-b-0 transition-all">
                                                            Preview
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleStartQuiz(quiz._id)}
                                                        className="flex-[1.5] px-6 py-3 bg-primary-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Start <FaArrowRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-20 flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            className="w-12 h-12 bg-white dark:bg-slate-900 border-2 border-b-4 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-duo active:translate-y-1 active:border-b-0"
                                        >
                                            <FaChevronLeft className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center gap-3">
                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                                const pageNum = pagination.currentPage <= 3
                                                    ? idx + 1
                                                    : pagination.currentPage + idx - 2;

                                                if (pageNum > pagination.totalPages) return null;

                                                const isActive = pageNum === pagination.currentPage;

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`w-12 h-12 rounded-2xl font-black transition-all shadow-duo border-2 border-b-4 ${isActive
                                                            ? 'bg-primary-500 border-primary-700 text-white active:translate-y-1 active:border-b-0'
                                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:translate-y-1 active:border-b-0'
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
                                            className="w-12 h-12 bg-white dark:bg-slate-900 border-2 border-b-4 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-duo active:translate-y-1 active:border-b-0"
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
        </MobileAppWrapper>
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
                .select('title description difficulty attemptsCount sampleQuestions timeLimit requiredLevel stats category subcategory createdAt')
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

