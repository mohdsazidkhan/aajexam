'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../../../lib/api';
import { FaArrowLeft, FaGraduationCap, FaClock, FaUsers, FaBuilding, FaChartLine } from 'react-icons/fa';
import Loading from '../../../components/Loading';

const CategoryExams = ({ initialCategory = null, initialExams = [], initialError = '', seo, categoryId }) => {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [exams, setExams] = useState(initialExams);
  const [loading, setLoading] = useState(!initialExams.length && !initialError);
  const [error, setError] = useState(initialError);

  const fetchCategoryAndExams = useCallback(async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError('');

      const res = await API.getExamsByCategory(categoryId);

      if (res?.success) {
        const fetchedExams = res.data || [];
        setExams(fetchedExams);

        const derivedCategory = res.category || fetchedExams[0]?.category;
        if (derivedCategory) {
          setCategory((prev) => ({
            ...(prev || {}),
            ...derivedCategory
          }));
        }
      } else {
        setError('Failed to load exams. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (!initialExams.length && !initialError) {
      fetchCategoryAndExams();
    }
  }, [initialExams.length, initialError, fetchCategoryAndExams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="lg" color="gray" message="Loading exams..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Exams
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mr-3"
          >
            Go Back
          </button>
          <button
            onClick={fetchCategoryAndExams}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const categoryName = category?.name || 'Government Exams';
  const categoryDescription = category?.description || 'Explore government exams in this category';
  const examCount = exams.length;

  return (
    <>
      <Head>
        <title>{seo?.title || `${categoryName} - Government Exams | AajExam`}</title>
        {seo?.description && <meta name="description" content={seo.description} />}
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        <meta property="og:type" content="website" />
        {seo?.title && <meta property="og:title" content={seo.title} />}
        {seo?.description && <meta property="og:description" content={seo.description} />}
        {seo?.image && <meta property="og:image" content={seo.image} />}
        {seo?.url && <meta property="og:url" content={seo.url} />}
        <meta name="twitter:card" content="summary_large_image" />
        {seo?.title && <meta name="twitter:title" content={seo.title} />}
        {seo?.description && <meta name="twitter:description" content={seo.description} />}
        {seo?.image && <meta name="twitter:image" content={seo.image} />}
        {seo?.url && <link rel="canonical" href={seo.url} />}
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 lg:py-4 px-2 lg:px-4">
        <div className="container mx-auto py-0 px-0 lg:px-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between gap-2 mb-2 lg:mb-4">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
            >
              <FaArrowLeft /> Back to Categories
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl py-2 px-4 text-white">
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-xl lg:text-3xl" />
                <h1 className="text-xl lg:text-2xl font-bold">
                  {category?.name ? category.name + " " + "Exams" : 'Government Exams'}
                </h1>
              </div>
              {category?.description && (
                <p className="text-red-100 text-lg">{category.description}</p>
              )}
            </div>
          </div>

          {/* Exams Grid */}
          {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  onClick={() => router.push(`/govt-exams/exam/${exam._id}`)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 overflow-hidden"
                >
                  {/* Exam Header */}
                  <div className="flex flex-col justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 p-2 lg:p-4 text-white">
                    <h3 className="text lg:text-xl font-bold mb-2">{exam.name}</h3>
                    {exam.code && (
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                        {exam.code}
                      </span>
                    )}
                  </div>

                  {/* Exam Details */}
                  <div className="p-2 lg:p-4">
                    {exam.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-0 lg:mb-4 line-clamp-3">
                        {exam.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {exam.department && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <FaBuilding className="text-gray-500" />
                          <span>{exam.department}</span>
                        </div>
                      )}
                      {exam.level && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <FaChartLine className="text-gray-500" />
                          <span className="capitalize">{exam.level}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                      {exam.patternCount !== undefined && (
                        <p className="text-sm font-semibold text-red-600">
                          {exam.patternCount} {exam.patternCount === 1 ? 'Pattern' : 'Patterns'}
                        </p>
                      )}
                      {exam.testCount !== undefined && (
                        <p className="text-sm text-red-600 font-semibold">
                          {exam.testCount} {exam.testCount === 1 ? 'Test' : 'Tests'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <FaGraduationCap className="text-6xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Exams Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Exams will appear here once they're added to this category
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryExams;

import dbConnect from '../../../lib/db';
import Exam from '../../../models/Exam';
import ExamCategory from '../../../models/ExamCategory';
import ExamPattern from '../../../models/ExamPattern';
import PracticeTest from '../../../models/PracticeTest';

export async function getServerSideProps({ params }) {
  const categoryId = params?.categoryId;

  if (!categoryId) {
    return { notFound: true };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  try {
    await dbConnect();

    // Fetch exams for the category
    const examsDocs = await Exam.find({ category: categoryId, isActive: true })
      .populate('category', 'name type description')
      .sort({ name: 1 })
      .lean();

    const examIds = examsDocs.map(e => e._id);
    
    let exams = [];
    let category = null;

    if (examIds.length > 0) {
      const [patterns, tests] = await Promise.all([
        ExamPattern.aggregate([
          { $match: { exam: { $in: examIds } } },
          { $group: { _id: '$exam', total: { $sum: 1 } } }
        ]),
        PracticeTest.aggregate([
          { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
          { $unwind: '$pattern' },
          { $match: { 'pattern.exam': { $in: examIds } } },
          { $group: { _id: '$pattern.exam', total: { $sum: 1 } } }
        ])
      ]);

      const patternMap = Object.fromEntries(patterns.map(i => [i._id.toString(), i.total]));
      const testMap = Object.fromEntries(tests.map(i => [i._id.toString(), i.total]));

      exams = examsDocs.map(e => ({
        ...JSON.parse(JSON.stringify(e)),
        patternCount: patternMap[e._id.toString()] || 0,
        testCount: testMap[e._id.toString()] || 0
      }));

      category = exams[0]?.category || null;
    }

    // If no exams found, we still need to try to get the category info
    if (!category) {
      const catDoc = await ExamCategory.findById(categoryId).lean();
      if (catDoc) {
        category = JSON.parse(JSON.stringify(catDoc));
      }
    }

    if (!category && exams.length === 0) {
      return { notFound: true };
    }

    const categoryName = category?.name || 'Government Exams';
    const examCount = exams.length;

    const descriptionSegments = [
      category?.description,
      examCount ? `Practice ${examCount} competitive exam${examCount === 1 ? '' : 's'} with detailed patterns and insights.` : 'Practice top competitive exams with detailed patterns and insights.'
    ].filter(Boolean);
    const description = descriptionSegments.join(' ');

    const baseKeywords = [
      categoryName,
      category?.type,
      'government exam',
      'sarkari exam',
      'mock test',
      'practice test'
    ].filter(Boolean);
    const keywords = Array.from(new Set(baseKeywords)).join(', ');

    const seo = {
      title: `${categoryName} - Government Exams | AajExam`,
      description,
      keywords,
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams/category/${categoryId}` : undefined
    };

    return {
      props: {
        categoryId,
        initialCategory: category,
        initialExams: exams,
        seo
      }
    };
  } catch (error) {
    console.error('Failed to pre-render govt exam category:', error);

    const fallbackSeo = {
      title: 'Government Exams - AajExam Platform',
      description: 'Explore government exam categories and practice with mock tests on AajExam.',
      keywords: 'government exams, mock test, practice test',
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams/category/${categoryId}` : undefined
    };

    return {
      props: {
        categoryId,
        initialCategory: null,
        initialExams: [],
        initialError: 'Failed to load exams. Please try again.',
        seo: fallbackSeo
      }
    };
  }
}

