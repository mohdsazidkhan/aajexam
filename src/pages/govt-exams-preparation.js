import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import { FaGraduationCap, FaChartLine, FaChevronLeft, FaChevronRight, FaQuestionCircle } from 'react-icons/fa';
import dbConnect from '../lib/db';
import Exam from '../models/Exam';

export default function GovtExamsPreparation({ initialData }) {
    const router = useRouter();
    const exams = initialData?.exams || [];
    const pagination = initialData?.pagination || {};
    const [loading, setLoading] = useState(false);

    const handlePageChange = async (newPage) => {
        setLoading(true);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage },
        }, undefined, { scroll: true });
    };

    return (
        <MobileAppWrapper title="Govt Exams Preparation">
            <Head>
                <title>Govt Exams Preparation Guide - AajExam</title>
                <meta name="description" content="Comprehensive guide and practice quizzes for SSC, UPSC, Banking, and Railway exams. Prepare with experts at AajExam." />
            </Head>

            <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark py-12 px-4 lg:px-10">
                <div className="container bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 lg:p-12 border-t-8 border-primary-600">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-bold mb-4">
                            <FaQuestionCircle className="w-4 h-4" />
                            <span>{pagination.totalExams || 0} Exams Available</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Government Exams Preparation</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Master your competitive exams with our structured quiz modules and real-time performance tracking.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {exams.length > 0 ? (
                                    exams.map((exam, index) => (
                                        <div key={exam._id || index} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group">
                                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                                                {exam.logo ? (
                                                    <img src={exam.logo} alt={exam.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FaGraduationCap className="text-indigo-600 dark:text-indigo-400 text-2xl" />
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{exam.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">{exam.description || 'Comprehensive exam preparation materials and practice tests.'}</p>
                                            <button
                                                onClick={() => router.push(`/exams/${exam.code || exam._id}`)}
                                                className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform"
                                            >
                                                Start Practice <FaChartLine />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10 text-gray-500">
                                        No exams found.
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage <= 1}
                                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all flex items-center"
                                    >
                                        <FaChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                            const pageNum = pagination.currentPage <= 3
                                                ? idx + 1
                                                : pagination.currentPage + idx - 2;

                                            if (pageNum > pagination.totalPages || pageNum <= 0) return null;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${pageNum === pagination.currentPage
                                                        ? 'bg-primary-600 text-white shadow-lg'
                                                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
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
                                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all flex items-center"
                                    >
                                        <FaChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    <div className="mt-20 bg-indigo-600 rounded-3xl p-10 lg:p-16 text-white text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Ace Your Exam?</h2>
                        <p className="text-lg opacity-90 mb-10 max-w-xl mx-auto">Join thousands of students who are already using AajExam to improve their scores and time management.</p>
                        <button
                            onClick={() => router.push('/quizzes')}
                            className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>
            </div>
            <UnifiedFooter />
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
