import dbConnect from '../../lib/db';
import Category from '../../models/Category';
import Subcategory from '../../models/Subcategory';
import Quiz from '../../models/Quiz';
import mongoose from 'mongoose';
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaBook, FaChevronRight, FaQuestionCircle, FaPlay, FaClock, FaChartBar } from 'react-icons/fa';
import { requireAuthForAction } from '../../lib/auth';
import UnifiedNavbar from '../../components/UnifiedNavbar';
import UnifiedFooter from '../../components/UnifiedFooter';

export default function CategoryDetailPage({ category, subcategories, quizzes, pagination }) {
    const router = useRouter();

    const handleStartQuiz = (quizId) => {
        if (requireAuthForAction(router, `/quiz/${quizId}/attempt`)) {
            router.push(`/quiz/${quizId}/attempt`);
        }
    };

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Category Not Found</h1>
                    <Link href="/categories">
                        <span className="text-primary-600 hover:text-red-700">← Back to Categories</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{category.name} - Quiz Category | AajExam</title>
                <meta name="description" content={category.description || `Practice quizzes for ${category.name} - Government exam preparation`} />
                <meta name="keywords" content={`${category.name}, government exam, quiz, practice test`} />
                <meta property="og:title" content={`${category.name} - Quiz Category | AajExam`} />
                <meta property="og:description" content={category.description} />
                <meta property="og:type" content="website" />
                <meta name="robots" content="index, follow" />
            </Head>

            <UnifiedNavbar isLandingPage={true} />

            <div className="py-20 sm:py-10 min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 from-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  px-4">
                <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link href="/categories">
                            <span className="text-primary-600 dark:text-red-400 hover:underline">Categories</span>
                        </Link>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>

                    {/* Category Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl mb-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <FaBook className="text-4xl text-primary-600 dark:text-red-400 mr-4" />
                            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                                {category.name}
                            </h1>
                        </div>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                            {category.description}
                        </p>

                        {category.longDescription && (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                {category.longDescription}
                            </p>
                        )}

                        {category.educationalValue && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-4">
                                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Educational Value</h3>
                                <p className="text-gray-700 dark:text-gray-300">{category.educationalValue}</p>
                            </div>
                        )}

                        {category.targetAudience && (
                            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                                <h3 className="font-semibold text-primary-900 dark:text-primary-200 mb-2">Target Audience</h3>
                                <p className="text-gray-700 dark:text-gray-300">{category.targetAudience}</p>
                            </div>
                        )}
                    </div>

                    {/* Subcategories */}
                    {subcategories && subcategories.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Subcategories</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subcategories.map(sub => (
                                    <Link key={sub._id} href={`/subcategories/${sub._id}`}>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{sub.name}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{sub.quizCount || 0} quizzes</p>
                                                </div>
                                                <FaChevronRight className="text-gray-400" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quizzes */}
                    <div>
                        <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Available Quizzes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {quizzes.map(quiz => (
                                <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{quiz.description}</p>

                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                                        {quiz.difficulty && (
                                            <span className={`px-2 py-1 rounded ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                quiz.difficulty === 'medium' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {quiz.difficulty}
                                            </span>
                                        )}
                                        {quiz.timeLimit && (
                                            <span className="flex items-center">
                                                <FaClock className="mr-1" /> {quiz.timeLimit} min
                                            </span>
                                        )}
                                        {quiz.level && (
                                            <span className="flex items-center">
                                                <FaChartBar className="mr-1" /> Level {quiz.level.levelNumber}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleStartQuiz(quiz._id)}
                                        className="w-full bg-gradient-to-r from-primary-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-red-700 transition-all font-semibold flex items-center justify-center"
                                    >
                                        <FaPlay className="mr-2" /> Start Quiz
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {quizzes.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
                                <FaQuestionCircle className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-xl text-gray-500 dark:text-gray-400">No quizzes available in this category yet.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                {pagination.hasPrev && (
                                    <Link href={`/categories/${category._id}?page=${pagination.page - 1}`}>
                                        <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            Previous
                                        </button>
                                    </Link>
                                )}
                                <span className="px-4 py-2 bg-gradient-to-r from-primary-600 to-red-600 dark:from-primary-500 dark:to-red-500 text-white rounded-lg">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                {pagination.hasNext && (
                                    <Link href={`/categories/${category._id}?page=${pagination.page + 1}`}>
                                        <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            Next
                                        </button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <UnifiedFooter />
        </>
    );
}

export async function getServerSideProps({ params, query }) {
    try {
        await dbConnect();
        const { categoryId } = params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return { notFound: true };
        }

        const page = parseInt(query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        // Get category details
        const category = await Category.findById(categoryId)
            .select('name description longDescription educationalValue targetAudience')
            .lean();

        if (!category) {
            return { notFound: true };
        }

        // Get subcategories for this category
        const subcategories = await Subcategory.find({ category: categoryId })
            .select('name description')
            .lean();

        // Count quizzes per subcategory
        const quizCounts = await Quiz.aggregate([
            { $match: { category: new mongoose.Types.ObjectId(categoryId), status: 'approved' } },
            { $group: { _id: '$subcategory', quizCount: { $sum: 1 } } }
        ]);
        const subcategoryIdToCount = new Map(quizCounts.map(c => [String(c._id), c.quizCount]));

        // Enhance subcategories with quiz counts
        const enhancedSubcategories = subcategories.map(sub => ({
            ...sub,
            _id: sub._id.toString(),
            quizCount: subcategoryIdToCount.get(String(sub._id)) || 0
        }));

        // Get quizzes for this category
        const quizzes = await Quiz.find({
            category: categoryId,
            status: 'approved'
        })
            .select('title description subcategory difficulty timeLimit tags educationalDescription createdAt')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Quiz.countDocuments({
            category: categoryId,
            status: 'approved'
        });
        const totalPages = Math.ceil(total / limit);

        const data = {
            category: JSON.parse(JSON.stringify(category)),
            subcategories: JSON.parse(JSON.stringify(enhancedSubcategories)),
            quizzes: JSON.parse(JSON.stringify(quizzes)),
            pagination: {
                page: page,
                limit: limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };

        return {
            props: data
        };
    } catch (error) {
        console.error('Error fetching category details:', error);
        return {
            props: {
                category: null,
                subcategories: [],
                quizzes: [],
                pagination: null,
            },
        };
    }
}
