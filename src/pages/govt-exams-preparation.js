import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MobileAppWrapper from '../components/MobileAppWrapper';
import { FaGraduationCap, FaChartLine, FaChevronLeft, FaChevronRight, FaQuestionCircle } from 'react-icons/fa';
import { generateBreadcrumbSchema, renderSchema } from '../utils/schema';
import dbConnect from '../lib/db';
import Exam from '../models/Exam';

export default function GovtExamsPreparation({ initialData }) {
    const router = useRouter();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
    const exams = initialData?.exams || [];
    const pagination = initialData?.pagination || {};
    const [loading, setLoading] = useState(false);

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Government Exams Preparation' }
    ]);

    const handlePageChange = async (newPage) => {
        setLoading(true);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage },
        }, undefined, { scroll: true });
    };

    return (
        <MobileAppWrapper showHeader={true} title="Govt Exams Preparation">
            <Head>
                <title>Govt Exams Preparation Guide - AajExam</title>
                <meta name="description" content="Comprehensive guide and practice quizzes for SSC, UPSC, Banking, and Railway exams. Prepare with experts at AajExam." />
                <link rel="canonical" href={`${siteUrl}/govt-exams-preparation`} />
                <meta property="og:title" content="Govt Exams Preparation Guide - AajExam" />
                <meta property="og:description" content="Comprehensive guide and practice quizzes for SSC, UPSC, Banking, and Railway exams. Prepare with experts at AajExam." />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="AajExam" />
                <meta property="og:url" content={`${siteUrl}/govt-exams-preparation`} />
                <meta property="og:image" content={`${siteUrl}/logo.png`} />
                <meta property="og:locale" content="en_IN" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@AajExam" />
                <meta name="twitter:title" content="Govt Exams Preparation Guide - AajExam" />
                <meta name="twitter:description" content="Comprehensive guide and practice quizzes for SSC, UPSC, Banking, and Railway exams." />
                <meta name="twitter:image" content={`${siteUrl}/logo.png`} />
                <meta name="robots" content="index, follow" />
                {renderSchema(breadcrumbSchema)}
            </Head>

            <div className="py-4 lg:py-8 h-auto lg:min-h-screen  px-4 font-outfit relative overflow-hidden">
                {/* Background atmosphere */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
                    <div className="text-center mb-4 lg:mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest shadow-duo border-2 border-white dark:border-slate-800 mb-3 lg:mb-6">
                            <FaQuestionCircle className="w-4 h-4" />
                            <span>{pagination.totalExams || 0} Exams Available</span>
                        </div>
                        <h1 className="text-xl lg:text-5xl font-black text-slate-900 dark:text-white mb-3 lg:mb-6 uppercase tracking-tighter">
                            Government Exams <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-600">Preparation</span>
                        </h1>
                        <p className="text-md lg:text-xl font-bold text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Master your competitive exams with our structured quiz modules and real-time performance tracking.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {exams.length > 0 ? (
                                    exams.map((exam, index) => (
                                        <div key={exam._id || index} className="bg-white dark:bg-slate-900 rounded-[1rem] lg:rounded-[2.5rem] p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-b-8 border-slate-100 dark:border-slate-800 flex flex-col justify-between group active:translate-y-1 active:border-b-2">
                                            <div>
                                                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-6 shadow-duo border-2 border-white dark:border-slate-800 overflow-hidden">
                                                    {exam.logo ? (
                                                        <img src={exam.logo} alt={exam.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaGraduationCap className="text-primary-600 dark:text-primary-400 text-2xl" />
                                                    )}
                                                </div>
                                                <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                                    {exam.name}
                                                </h3>
                                                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                                                    {exam.description || 'Comprehensive exam preparation materials and practice tests.'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/exams/${exam.code || exam._id}`)}
                                                className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0"
                                            >
                                                Start Practice <FaChartLine className="ml-2" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl font-bold uppercase tracking-widest text-slate-400 text-sm">
                                        No exams found.
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-20 flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage <= 1}
                                        className="w-12 h-12 bg-white dark:bg-slate-900 border-2 border-b-4 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-duo active:translate-y-1 active:border-b-0"
                                    >
                                        <FaChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                            const pageNum = pagination.currentPage <= 3
                                                ? idx + 1
                                                : pagination.currentPage + idx - 2;

                                            if (pageNum > pagination.totalPages || pageNum <= 0) return null;

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
                        </>
                    )}

                    <div className="mt-32 bg-slate-950 dark:bg-slate-900 rounded-[3rem] p-4 lg:p-10 xl:p-20 text-white text-center border-4 border-slate-800 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />

                        <h2 className="text-2xl lg:text-5xl font-black mb-3 lg:mb-6 uppercase tracking-tighter relative z-10">
                            Ready to <span className="text-primary-400">Ace</span> Your Exam?
                        </h2>
                        <p className="text-md lg:text-xl font-bold opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed relative z-10">
                            Join thousands of students who are already using AajExam to improve their scores and time management.
                        </p>
                        <button
                            onClick={() => router.push('/govt-exams')}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-duo-primary border-b-[8px] border-primary-700 active:translate-y-2 active:border-b-0 transition-all relative z-10"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>
            </div>
        </MobileAppWrapper>
    );
}

export async function getServerSideProps(context) {
    try {
        const { page = 1, limit = 9 } = context.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        await dbConnect();
        const [exams, total] = await Promise.all([
            Exam.find({ isActive: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Exam.countDocuments({ isActive: true })
        ]);

        const totalPages = Math.ceil(total / limitNum);

        return {
            props: {
                initialData: {
                    exams: JSON.parse(JSON.stringify(exams)),
                    pagination: {
                        currentPage: pageNum,
                        totalPages,
                        totalExams: total,
                        hasMore: pageNum < totalPages
                    }
                }
            }
        };
    } catch (error) {
        console.error('Error in govt-exams-preparation getServerSideProps:', error);
        return {
            props: {
                initialData: { exams: [], pagination: {} }
            }
        };
    }
}

