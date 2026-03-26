import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../../lib/api';
import { FaGraduationCap, FaBuilding, FaCity } from 'react-icons/fa';
import UnifiedFooter from '../../components/UnifiedFooter';
import Loading from '../../components/Loading';

const GovernmentExamsLanding = ({ initialCategories = [], initialError = '', seo }) => {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(!initialCategories.length && !initialError);
  const [error, setError] = useState(initialError);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.getRealExamCategories();
      if (res?.success) {
        setCategories(res.data || []);
      } else {
        setError('Failed to load exam categories. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load exam categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!categories.length) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const groupedCategories = useMemo(() => categories.reduce((acc, cat) => {
    const type = cat.type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(cat);
    return acc;
  }, {}), [categories]);

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'central':
        return <FaBuilding className="text-md lg:text-2xl" />;
      case 'state':
        return <FaCity className="text-md lg:text-2xl" />;
      default:
        return <FaGraduationCap className="text-md lg:text-2xl" />;
    }
  };

  const getColorForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'central':
        return 'from-blue-500 to-indigo-600';
      case 'state':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-purple-500 to-pink-600';
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loading size="lg" color="gray" message="Loading exam categories..." />
        </div>
        <UnifiedFooter />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={fetchCategories}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <UnifiedFooter />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{seo?.title || 'Government Exams - SUBG QUIZ Platform'}</title>
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
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2 lg:px-4">
          <div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10">
            {/* Header */}
            <div className="text-center mb-6 lg:mb-12">
              <h1 className="text-xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
                <FaGraduationCap className="text-red-600" />
                Government Exams
              </h1>
              <p className="text-md lg:text-lg text-gray-600 dark:text-gray-400">
                Prepare for your dream government job with realistic mock tests
              </p>
            </div>

            {/* Categories by Type */}
            {Object.keys(groupedCategories).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12">
                {Object.entries(groupedCategories).map(([type, typeCategories]) => (
                  <div key={type}>
                    {/* Type Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 lg:p-3 rounded-lg bg-gradient-to-r ${getColorForType(type)} text-white`}>
                        {getIconForType(type)}
                      </div>
                      <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white capitalize">
                        {type} Exams
                      </h2>
                    </div>

                    {/* Category Grid */}
                    <div className="grid grid-cols-1 gap-6">
                      {typeCategories.map((category) => (
                        <div
                          key={category._id}
                          onClick={() =>
                            router.push(
                              {
                                pathname: `/govt-exams/category/${category._id}`,
                                query: {
                                  name: category.name,
                                  type: category.type || '',
                                  description: category.description || ''
                                }
                              },
                              `/govt-exams/category/${category._id}`
                            )
                          }
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 p-3 lg:p-6"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 lg:p-3 rounded-lg bg-gradient-to-r ${getColorForType(type)} text-white`}>
                              {getIconForType(type)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                                  {category.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between gap-2">
                                {category.examCount !== undefined && (
                                  <p className="text-sm text-red-600 font-semibold mt-2">
                                    {category.examCount} {category.examCount === 1 ? 'Exam' : 'Exams'}
                                  </p>
                                )}
                                {category.testCount !== undefined && (
                                  <p className="text-sm text-red-600 font-semibold mt-2">
                                    {category.testCount} {category.testCount === 1 ? 'Test' : 'Tests'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FaGraduationCap className="text-6xl text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  No Categories Available
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Categories will appear here once they're added
                </p>
              </div>
            )}
          </div>
        </div>
        <UnifiedFooter />
      </>
    </>
  );
};

export default GovernmentExamsLanding;

import dbConnect from '../../lib/db';
import ExamCategory from '../../models/ExamCategory';
import Exam from '../../models/Exam';
import PracticeTest from '../../models/PracticeTest';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  try {
    await dbConnect();
    
    const [categoriesDocs, examCounts, testCounts] = await Promise.all([
      ExamCategory.find().sort({ type: 1, name: 1 }).lean(),
      Exam.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', total: { $sum: 1 } } }
      ]),
      PracticeTest.aggregate([
        { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
        { $unwind: '$pattern' },
        { $lookup: { from: 'exams', localField: 'pattern.exam', foreignField: '_id', as: 'exam' } },
        { $unwind: '$exam' },
        { $match: { 'exam.isActive': true } },
        { $group: { _id: '$exam.category', total: { $sum: 1 } } }
      ])
    ]);

    const examCountMap = Object.fromEntries(examCounts.map(i => [i._id?.toString(), i.total]));
    const testCountMap = Object.fromEntries(testCounts.map(i => [i._id?.toString(), i.total]));

    const categories = categoriesDocs.map(c => ({
      ...JSON.parse(JSON.stringify(c)),
      examCount: examCountMap[c._id.toString()] || 0,
      testCount: testCountMap[c._id.toString()] || 0
    }));

    const categoryCount = categories.length;
    const totalExams = categories.reduce((sum, cat) => sum + (cat.examCount || 0), 0);

    const title = `Government Exams${categoryCount ? ` (${categoryCount} Categories)` : ''} - SUBG QUIZ Platform`;
    const descriptionParts = [
      'Prepare for your dream government job with realistic mock tests.',
      categoryCount ? `Explore ${categoryCount} exam categor${categoryCount === 1 ? 'y' : 'ies'}` : null,
      totalExams ? `covering ${totalExams} competitive exam${totalExams === 1 ? '' : 's'}.` : null
    ].filter(Boolean);
    const description = descriptionParts.join(' ');

    const categoryKeywords = Array.from(new Set(categories
      .map((cat) => cat?.name)
      .filter(Boolean)));
    const keywords = [
      'government exams',
      'sarkari exam',
      'mock test',
      'practice test',
      'central government exam',
      'state government exam',
      ...categoryKeywords
    ].join(', ');

    const seo = {
      title,
      description,
      keywords,
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams` : undefined
    };

    return {
      props: {
        initialCategories: categories,
        seo
      }
    };
  } catch (error) {
    console.error('Failed to pre-render govt exams categories:', error);

    const fallbackSeo = {
      title: 'Government Exams - SUBG QUIZ Platform',
      description: 'Prepare for government exams with realistic mock tests on SUBG QUIZ.',
      keywords: 'government exams, sarkari exam, mock test, practice test',
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams` : undefined
    };

    return {
      props: {
        initialCategories: [],
        initialError: 'Failed to load exam categories. Please try again.',
        seo: fallbackSeo
      }
    };
  }
}

