import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import { FaBook, FaChevronRight, FaQuestionCircle } from 'react-icons/fa';
import UnifiedNavbar from '../../components/UnifiedNavbar';
import UnifiedFooter from '../../components/UnifiedFooter';

export default function CategoriesPage({ categories }) {
    return (
        <>
            <Head>
                <title>Quiz Categories - Government Exam Preparation | SUBG QUIZ</title>
                <meta name="description" content="Browse quiz categories for SSC, UPSC, Banking, Railway and other government competitive exams. Comprehensive practice tests organized by subject and topic." />
                <meta name="keywords" content="quiz categories, government exam topics, SSC subjects, UPSC topics, banking exam categories, railway exam subjects" />
                <meta property="og:title" content="Quiz Categories - Government Exam Preparation | SUBG QUIZ" />
                <meta property="og:description" content="Browse quiz categories for all major government competitive exams." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Quiz Categories - SUBG QUIZ" />
                <meta name="twitter:description" content="Browse quiz categories for government exam preparation." />
                <meta name="robots" content="index, follow" />
            </Head>

            <UnifiedNavbar isLandingPage={true} />

            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 from-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
                <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                    {/* Header */}
                    <div className="text-center mb-8 lg:mb-16">
                        <div className="inline-block mb-0 lg:mb-4">
                            <FaBook className="text-3xl lg:text-6xl text-orange-700 dark:text-yellow-400 mx-auto" />
                        </div>
                        <h1 className="text-xl lg:text-3xl xl:text-4xl font-extrabold text-orange-700 dark:text-yellow-400 mb-4">
                            Quiz Categories
                        </h1>
                        <p className="text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 font-medium">
                            Browse quizzes by subject and topic for government exam preparation
                        </p>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                        {categories.map(category => (
                            <Link key={category._id} href={`/categories/${category._id}`}>
                                <div className="group bg-white dark:bg-gray-800 rounded-2xl p-3 lg:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 cursor-pointer">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-700 dark:group-hover:text-yellow-400 transition-colors">
                                                {category.name}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                                {category.description}
                                            </p>
                                        </div>
                                        <FaChevronRight className="text-gray-400 group-hover:text-orange-700 dark:group-hover:text-yellow-400 transition-colors mt-1" />
                                    </div>

                                    {/* Educational Value */}
                                    {category.educationalValue && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                            {category.educationalValue}
                                        </p>
                                    )}

                                    {/* Quiz Count */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center text-orange-700 dark:text-yellow-400">
                                            <FaQuestionCircle className="mr-2" />
                                            <span className="font-semibold">{category.totalQuizzes || 0} Quizzes</span>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-orange-700 dark:group-hover:text-yellow-400 transition-colors">
                                            Explore →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State */}
                    {categories.length === 0 && (
                        <div className="text-center py-20">
                            <FaBook className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-xl text-gray-500 dark:text-gray-400">No categories available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
            <UnifiedFooter />
        </>
    );
}

export async function getServerSideProps() {
    try {
        const dbConnect = (await import('../../lib/db')).default;
        const Category = (await import('../../models/Category')).default;
        const Subcategory = (await import('../../models/Subcategory')).default;
        const Quiz = (await import('../../models/Quiz')).default;

        await dbConnect();

        // Fetch categories with status 'approved'
        const categoriesData = await Category.find({ status: 'approved' }).lean();

        // Fetch subcategories and quiz counts for each category
        const data = await Promise.all(categoriesData.map(async (cat) => {
            const subcats = await Subcategory.find({
                category: cat._id,
                status: 'approved'
            }).limit(5).lean();

            const quizzes = await Quiz.countDocuments({
                category: cat._id,
                isActive: true,
                status: 'approved'
            });

            return {
                ...JSON.parse(JSON.stringify(cat)),
                subcategories: JSON.parse(JSON.stringify(subcats)),
                totalQuizzes: quizzes
            };
        }));

        // Sort categories by totalQuizzes descending
        data.sort((a, b) => b.totalQuizzes - a.totalQuizzes);

        return {
            props: {
                categories: data,
            },
        };
    } catch (error) {
        console.error('Error fetching categories in getServerSideProps:', error);
        return {
            props: {
                categories: [],
            },
        };
    }
}

