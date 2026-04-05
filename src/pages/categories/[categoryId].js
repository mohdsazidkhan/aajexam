import dbConnect from '../../lib/db';
import mongoose from 'mongoose';
import Head from 'next/head';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaBook, FaChevronRight, FaQuestionCircle, FaPlay, FaClock, FaChartBar } from 'react-icons/fa';
import { requireAuthForAction } from '../../lib/auth';

export default function CategoryDetailPage({ category, subcategories, quizzes, pagination }) {
  const router = useRouter();

  const handleStartQuiz = (quizId) => {
    if (requireAuthForAction(router, `/quiz/${quizId}/attempt`)) {
      router.push(`/quiz/${quizId}/attempt`);
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center font-outfit">
        <div className="text-center">
          <h1 className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Category Not Found</h1>
          <Link href="/categories">
            <span className="text-primary-600 dark:text-primary-500 font-black uppercase tracking-widest text-xs hover:underline cursor-pointer">← Back to Categories</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MobileAppWrapper showHeader={true} title={category.name}>
      <Head>
        <title>{category.name} - Quiz Category | AajExam</title>
        <meta name="description" content={category.description || `Practice quizzes for ${category.name} - Government exam preparation`} />
        <meta name="keywords" content={`${category.name}, government exam, quiz, practice test`} />
        <meta property="og:title" content={`${category.name} - Quiz Category | AajExam`} />
        <meta property="og:description" content={category.description} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="py-20 lg:py-24 min-h-screen bg-white dark:bg-slate-950 px-4 font-outfit relative overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-2 lg:px-6 xl:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Link href="/categories">
              <span className="text-primary-700 dark:text-primary-400 hover:text-primary-500 transition-colors">Categories</span>
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400">{category.name}</span>
          </div>

          {/* Category Header */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 lg:p-10 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mr-6 shadow-duo-primary border-2 border-white dark:border-slate-800">
                <FaBook className="text-3xl text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {category.name}
              </h1>
            </div>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
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

          {subcategories && subcategories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-md md:text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Subcategories</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6">
                {subcategories.map(sub => (
                  <Link key={sub._id} href={`/subcategories/${sub._id}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-b-6 border-slate-100 dark:border-slate-800 group active:translate-y-1 active:border-b-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{sub.name}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{sub.quizCount || 0} quizzes</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                          <FaChevronRight className="text-xs" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-md md:text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Available Quizzes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {quizzes.map(quiz => (
                <div key={quiz._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-slate-100 dark:border-slate-800 flex flex-col justify-between group">
                  <div>
                    <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{quiz.title}</h3>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">{quiz.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mb-8">
                      {quiz.difficulty && (
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${quiz.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          quiz.difficulty === 'medium' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                          {quiz.difficulty}
                        </span>
                      )}
                      {quiz.timeLimit && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <FaClock className="text-xs" /> {quiz.timeLimit} MIN
                        </span>
                      )}
                      {quiz.requiredLevel && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <FaChartBar className="text-xs" /> LVL {quiz.requiredLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(quiz._id)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0"
                  >
                    <FaPlay className="mr-2 text-[10px]" /> Start Quiz
                  </button>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {quizzes.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
                <FaQuestionCircle className="text-6xl text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                <p className="text-xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">No quizzes available in this category yet.</p>
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
    </MobileAppWrapper>
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
    const Category = (await import('../../models/Category')).default;
    const Subcategory = (await import('../../models/Subcategory')).default;
    const Quiz = (await import('../../models/Quiz')).default;

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
