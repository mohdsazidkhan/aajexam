import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import { FaBook, FaChevronRight, FaQuestionCircle } from 'react-icons/fa';
import MobileAppWrapper from '../../components/MobileAppWrapper';
// UnifiedNavbar removed
import UnifiedFooter from '../../components/UnifiedFooter';

export default function CategoriesPage({ categories }) {
    return (
        <MobileAppWrapper showHeader={true} title="Quiz Categories">
            <Head>
                <title>Quiz Categories - Government Exam Preparation | AajExam</title>
                <meta name="description" content="Browse quiz categories for SSC, UPSC, Banking, Railway and other government competitive exams. Comprehensive practice tests organized by subject and topic." />
                <meta name="keywords" content="quiz categories, government exam topics, SSC subjects, UPSC topics, banking exam categories, railway exam subjects" />
                <meta property="og:title" content="Quiz Categories - Government Exam Preparation | AajExam" />
                <meta property="og:description" content="Browse quiz categories for all major government competitive exams." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Quiz Categories - AajExam" />
                <meta name="twitter:description" content="Browse quiz categories for government exam preparation." />
                <meta name="robots" content="index, follow" />
            </Head>

            <div className="py-20 lg:py-24 min-h-screen bg-white dark:bg-slate-950 px-4 font-outfit relative overflow-hidden">
                {/* Background atmosphere */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-2 lg:px-6 xl:px-8 relative z-10">
                    {/* Header */}
                    <div className='flex justify-center items-center gap-3'>
                        <div className="inline-block mb-6">
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-duo-primary border-2 border-white dark:border-slate-800">
                                <FaBook className="text-3xl text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>

                        <h1 className="text-xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">
                            Quiz Categories
                        </h1>
                    </div>
                    <p className="text-center text-lg lg:text-xl lg:text-3xl font-black text-slate-600 dark:text-slate-400 max-w-3xl mx-auto uppercase tracking-widest text-xs mb-4">
                        Browse quizzes by subject and topic for government exam preparation
                    </p>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                        {categories.map(category => (
                            <Link key={category._id} href={`/categories/${category._id}`}>
                                <div className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-b-8 border-slate-100 dark:border-slate-800 active:translate-y-1 active:border-b-2 cursor-pointer h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                <FaBook className="text-2xl text-primary-600 dark:text-primary-400 group-hover:text-white" />
                                            </div>
                                            <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                                {category.name}
                                            </h2>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                                            {category.description}
                                        </p>
                                    </div>

                                    {/* Educational Value */}
                                    {category.educationalValue && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                            {category.educationalValue}
                                        </p>
                                    )}

                                    {/* Quiz Count */}
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                                            <FaQuestionCircle />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{category.totalQuizzes || 0} Quizzes</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary-600 transition-all">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Explore</span>
                                            <FaChevronRight className="text-[10px]" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State */}
                    {categories.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
                            <FaBook className="text-6xl text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">No categories available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </MobileAppWrapper>
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


