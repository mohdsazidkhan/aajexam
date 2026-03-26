'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Pages Router
import Link from 'next/link';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import Loading from '../../Loading';

const ProQuizDetail = () => {
  const router = useRouter();
  console.log(router, 'router')
  const { quizId } = router.query;
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (quizId) {
          // Prefer protected detail (owner view); fallback to public detail if unauthorized
          try {
            const response = await API.getMyQuiz(quizId);
            if (response?.success) {
              setQuiz(response.data);
            } else {
              // fallback to public endpoint structure
              const pub = await API.getUserQuizDetails(quizId);
              setQuiz(pub?.data || pub);
            }
          } catch (err) {
            const pub = await API.getUserQuizDetails(quizId);
            setQuiz(pub?.data || pub);
          }
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, router]);

  if (loading) {
    return <Loading fullScreen={true} size="lg" color="blue" message="Loading quiz details..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h1 className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {quiz?.title || 'Quiz Details'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {quiz?.description || 'No description available.'}
            </p>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{quiz?.category?.name || '—'}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <div className="text-sm text-gray-500 dark:text-gray-400">Subcategory</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{quiz?.subcategory?.name || '—'}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <div className="text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{quiz?.difficulty}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <div className="text-sm text-gray-500 dark:text-gray-400">Required Level</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{quiz?.requiredLevel}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <div className="text-sm text-gray-500 dark:text-gray-400">Time Limit</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{quiz?.timeLimit} min</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{quiz?.status}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{quiz?.viewsCount ?? 0}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40">
              <div className="text-sm text-gray-500 dark:text-gray-400">Attempts</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{quiz?.attemptsCount ?? 0}</div>
            </div>
          </div>

          {/* Questions */}
          {Array.isArray(quiz?.questions) && quiz.questions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">Questions</h2>
              <div className="space-y-4">
                {quiz.questions.map((q, idx) => (
                  <div key={q._id || idx} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {idx + 1}. {q.questionText}
                    </div>
                    <ul className="space-y-2">
                      {q.options?.map((opt, oIdx) => (
                        <li key={oIdx} className={`px-3 py-2 rounded-lg ${oIdx === q.correctAnswerIndex ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300'}`}>
                          {String.fromCharCode(65 + oIdx)}. {opt}
                          {oIdx === q.correctAnswerIndex && (
                            <span className="ml-2 text-xs font-semibold">(Correct)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Time limit: {q.timeLimit}s</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <Link
              href="/pro/quizzes/mine"
              className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              View All Quizzes
            </Link>
            <Link
              href="/pro/quiz/create"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create New Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProQuizDetail;
