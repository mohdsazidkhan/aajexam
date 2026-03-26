import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../../../lib/api';
import { FaArrowLeft, FaClock, FaTrophy, FaList, FaBookmark } from 'react-icons/fa';
import Loading from '../../../components/Loading';

const ExamDetails = ({ initialExam = null, initialPatterns = [], initialError = '', seo, examId }) => {
  const router = useRouter();
  const [exam, setExam] = useState(initialExam);
  const [patterns, setPatterns] = useState(initialPatterns);
  const [loading, setLoading] = useState(!initialPatterns.length && !initialError);
  const [error, setError] = useState(initialError);

  const fetchExamAndPatterns = useCallback(async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError('');
      const res = await API.getPatternsByExam(examId);

      if (res?.success) {
        const fetchedPatterns = res.data || [];
        setPatterns(fetchedPatterns);
        if (res.exam) {
          setExam(res.exam);
        } else if (fetchedPatterns[0]?.exam) {
          setExam(fetchedPatterns[0].exam);
        }
      } else {
        setError('Failed to load exam details. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching exam and patterns:', err);
      setError('Failed to load exam details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (!initialPatterns.length && !initialError) {
      fetchExamAndPatterns();
    }
  }, [initialPatterns.length, initialError, fetchExamAndPatterns]);

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="lg" color="gray" message="Loading exam details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const examName = exam?.name || 'Government Exam';
  const examDescription = exam?.description || 'Practice exam patterns and prepare for your government job';
  const patternCount = patterns.length;

  return (
    <>
      <Head>
        <title>{seo?.title || `${examName} - Exam Patterns | AajExam`}</title>
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

            <div className="flex items-start lg:items-center justify-start lg:justify-between gap-4">

              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
              >
                <FaArrowLeft /> Back
              </button>

              <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Available Patterns
              </h2>
            </div>

            {/* Exam Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl px-4 py-2 text-white gap-4">
              <h1 className="text-xl lg:text-2xl font-bold">{exam?.name || 'Exam Patterns'}</h1>
              {exam?.description && (
                <p className="text-blue-100 text-lg">{exam.description}</p>
              )}
              {exam?.code && (
                <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-semibold">
                  {exam.code}
                </span>
              )}
            </div>
          </div>

          {/* Patterns List */}
          {patterns.length > 0 ? (
            <div className="space-y-6">


              {patterns.map((pattern) => (
                <div
                  key={pattern._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* Pattern Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 py-2 px-4 text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-md lg:text-xl font-bold">{pattern.title}</h3>
                        {pattern.description && (
                          <p className="text-yellow-100">{pattern.description}</p>
                        )}
                      </div>
                      {pattern.testCount > 0 && (
                        <span className="ml-4 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                          {pattern.testCount} Tests
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pattern Details */}
                  <div className="p-2 lg:p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4 mb-2 lg:mb-6">
                      {pattern.duration && (
                        <div className="flex items-center gap-3">
                          <FaClock className="text-red-600 text-xl" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatDuration(pattern.duration)}
                            </p>
                          </div>
                        </div>
                      )}

                      {pattern.totalMarks && (
                        <div className="flex items-center gap-3">
                          <FaTrophy className="text-orange-700 text-xl" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {pattern.totalMarks} marks
                            </p>
                          </div>
                        </div>
                      )}

                      {pattern.sections && pattern.sections.length > 0 && (
                        <div className="flex items-center gap-3">
                          <FaList className="text-blue-600 text-xl" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sections</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {pattern.sections.length} section{pattern.sections.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sections List */}
                    {pattern.sections && pattern.sections.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sections:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pattern.sections.map((section, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {section.name || `Section ${idx + 1}`}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {section.totalQuestions || 0} Q
                                </span>
                              </div>
                              {section.marks && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {section.marks} marks
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={() => router.push(`/govt-exams/pattern/${pattern._id}/tests`)}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <FaBookmark /> View Practice Tests
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <FaList className="text-6xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Patterns Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Patterns will appear here once they're added
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExamDetails;

import dbConnect from '../../../lib/db';
import Exam from '../../../models/Exam';
import ExamPattern from '../../../models/ExamPattern';
import PracticeTest from '../../../models/PracticeTest';

export async function getServerSideProps({ params }) {
  const examId = params?.examId;

  if (!examId) {
    return { notFound: true };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  try {
    await dbConnect();

    // Fetch patterns for the exam
    const patternsDocs = await ExamPattern.find({ exam: examId })
      .populate('exam', 'name code description')
      .sort({ title: 1 })
      .lean();

    const patternIds = patternsDocs.map(p => p._id);
    
    let patterns = [];
    let exam = null;

    if (patternIds.length > 0) {
      const testCounts = await PracticeTest.aggregate([
        { $match: { examPattern: { $in: patternIds } } },
        { $group: { _id: '$examPattern', total: { $sum: 1 } } }
      ]);

      const testMap = Object.fromEntries(testCounts.map(i => [i._id.toString(), i.total]));

      patterns = patternsDocs.map(p => ({
        ...JSON.parse(JSON.stringify(p)),
        testCount: testMap[p._id.toString()] || 0
      }));

      exam = patterns[0]?.exam || null;
    }

    // If no patterns found, try to fetch exam info directly
    if (!exam) {
      const examDoc = await Exam.findById(examId).lean();
      if (examDoc) {
        exam = JSON.parse(JSON.stringify(examDoc));
      }
    }

    if (!exam && patterns.length === 0) {
      return { notFound: true };
    }

    const examName = exam?.name || 'Government Exam';
    const patternCount = patterns.length;

    const descriptionPieces = [
      exam?.description,
      patternCount ? `Explore ${patternCount} exam pattern${patternCount === 1 ? '' : 's'} and practice with realistic mock tests.` : 'Explore detailed exam patterns and practice with realistic mock tests.'
    ].filter(Boolean);
    const description = descriptionPieces.join(' ');

    const keywordSet = new Set([
      examName,
      exam?.code,
      'government exam',
      'exam pattern',
      'mock test',
      'practice test',
      'sarkari exam'
    ].filter(Boolean));

    const seo = {
      title: `${examName} - Exam Patterns | AajExam`,
      description,
      keywords: Array.from(keywordSet).join(', '),
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams/exam/${examId}` : undefined
    };

    return {
      props: {
        examId,
        initialExam: exam,
        initialPatterns: patterns,
        seo
      }
    };
  } catch (error) {
    console.error('Failed to pre-render govt exam detail:', error);

    const fallbackSeo = {
      title: 'Government Exam Patterns | AajExam',
      description: 'Explore government exam patterns and practice with realistic mock tests on AajExam.',
      keywords: 'government exam, exam pattern, mock test, practice test',
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams/exam/${examId}` : undefined
    };

    return {
      props: {
        examId,
        initialExam: null,
        initialPatterns: [],
        initialError: 'Failed to load exam details. Please try again.',
        seo: fallbackSeo
      }
    };
  }
}

