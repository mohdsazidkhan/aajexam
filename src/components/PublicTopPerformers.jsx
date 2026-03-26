'use client';

import React, { useEffect, useState } from 'react';
import { FaList, FaTable, FaTh } from 'react-icons/fa';
import API from '../lib/api';
import config from '../lib/config/appConfig';
import Loading from './Loading';

const PublicTopPerformers = () => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    const fetchTop = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.getPublicLandingTopPerformers(10);
        if (res?.success && Array.isArray(res.data)) {
          const sorted = [...res.data].sort((a, b) => {
            const aHigh = a.highQuizzes || 0;
            const bHigh = b.highQuizzes || 0;
            if (aHigh !== bHigh) return bHigh - aHigh;
            const aAcc = a.accuracy || 0;
            const bAcc = b.accuracy || 0;
            if (aAcc !== bAcc) return bAcc - aAcc;
            const aTotal = a.totalQuizzes || 0;
            const bTotal = b.totalQuizzes || 0;
            return bTotal - aTotal;
          });
          setTopPerformers(sorted);
        } else {
          setTopPerformers([]);
        }
      } catch (e) {
        setError('Failed to load top performers');
      } finally {
        setLoading(false);
      }
    };
    fetchTop();

    // Set default view mode based on screen size
    // Mobile (< 768px): list view, Desktop (>= 768px): table view
    const setDefaultViewMode = () => {
      if (typeof window !== 'undefined') {
        const defaultMode = window.innerWidth >= 768 ? 'table' : 'list';
        setViewMode(defaultMode);
      }
    };

    setDefaultViewMode();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loading size="md" color="blue" message="Loading leaderboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-primary-600 dark:text-red-400">{error}</div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border-2 border-secondary-300 dark:border-indigo-500">
      <div className="p-2 lg:p-6 border-b-2 border-secondary-200 dark:border-secondary-700 bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20">
        <div className="flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-4">

          <h3 className="text-md md:text-xl font-semibold text-secondary-800 dark:text-secondary-200 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Leaderboard
          </h3>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/80 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table'
                ? 'bg-secondary-500 dark:bg-secondary-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              title="Table View"
            >
              <FaTable className="text-sm sm:text-base" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list'
                ? 'bg-secondary-500 dark:bg-secondary-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              title="List View"
            >
              <FaList className="text-sm sm:text-base" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                ? 'bg-secondary-500 dark:bg-secondary-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              title="Grid View"
            >
              <FaTh className="text-sm sm:text-base" />
            </button>

          </div>
          <p className="text-sm text-secondary-600 dark:text-secondary-300">
            Top performers based on high scores, accuracy
          </p>

        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="p-2 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {topPerformers.map((performer, index) => (
              <div key={performer?._id || `performer-${index}`} className={`bg-white dark:bg-gray-900 rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-lg group ${index === 0
                ? 'border-primary-400 bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20'
                : index === 1
                  ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20'
                  : index === 2
                    ? 'border-primary-400 bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20'
                    : 'border-secondary-200 dark:border-secondary-600 hover:border-secondary-400'
                }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${index === 0
                    ? 'bg-gradient-to-r from-primary-400 to-primary-500'
                    : index === 1
                      ? 'bg-gradient-to-r from-gray-400 to-slate-500'
                      : index === 2
                        ? 'bg-gradient-to-r from-primary-400 to-amber-500'
                        : 'bg-gradient-to-r from-secondary-400 to-indigo-500'
                    }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  {index < 3 && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {index === 0 ? 'Champion' : index === 1 ? 'Runner-up' : '3rd Place'}
                    </span>
                  )}
                </div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-secondary-100 to-indigo-100 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl text-secondary-600 dark:text-secondary-400">{performer?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg">{performer?.name || 'Anonymous'}</div>
                  <div className={`subscription-name-badge mx-auto ${performer?.subscriptionName === 'PRO'
                    ? 'bg-gradient-to-r from-primary-400 to-secondary-500'
                    : 'bg-gradient-to-r from-green-400 to-teal-500'
                    }`}>
                    {performer?.subscriptionName || 'FREE'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <span className="text-green-600 dark:text-green-400 text-sm">📈</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Level</div>
                    <div className="font-bold text-gray-900 dark:text-white">{performer?.userLevel || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-secondary-100 to-indigo-100 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <span className="text-secondary-600 dark:text-secondary-400 text-sm">📚</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Quizzes</div>
                    <div className="font-bold text-gray-900 dark:text-white">{performer?.totalQuizzes || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-100 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <span className="text-primary-600 dark:text-primary-400 text-sm">🏆</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">High Score Quizzes</div>
                    <div className="font-bold text-gray-900 dark:text-white">{performer?.highQuizzes || 0}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <span className="text-primary-600 dark:text-primary-400 text-sm">🎯</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Accuracy</div>
                    <div className="font-bold text-gray-900 dark:text-white">{performer?.accuracy || 0}%</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm">✅</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Correct</div>
                    <div className="font-bold text-gray-900 dark:text-white">{performer?.totalCorrectAnswers || 0} out of {performer?.totalScore}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="p-2 lg:p-6 space-y-3">
          {topPerformers.map((performer, index) => (
            <div
              key={performer?._id || `performer-${index}`}
              className={`p-3 lg:p-4 rounded-lg border transition-all duration-200 ${index === 0
                ? 'bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 border-primary-200 dark:border-primary-600 shadow-lg'
                : index === 1
                  ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-600 shadow-md'
                  : index === 2
                    ? 'bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20 border-primary-200 dark:border-primary-600 shadow-md'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600'
                }`}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className={`w-6 h-6 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-gradient-to-r from-primary-400 to-primary-500' : index === 1 ? 'bg-gradient-to-r from-gray-400 to-slate-500' : index === 2 ? 'bg-gradient-to-r from-primary-400 to-amber-500' : 'bg-gradient-to-r from-secondary-400 to-indigo-500'
                  }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">{performer?.name || 'Anonymous'}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Level {performer?.userLevel || 0}</div>
                </div>
                <div className="text-xs sm:text-lg text-gray-800 dark:text-gray-100">🎯 {performer?.accuracy || 0}%</div>
                <div className="text-xs sm:text-lg text-gray-800 dark:text-gray-100">🏆 {performer?.highQuizzes || 0}</div>
                <div className="text-xs sm:text-lg text-gray-800 dark:text-gray-100">📚 {performer?.totalQuizzes || 0}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 lg:w-10 lg:h-10 bg-gradient-to-r from-secondary-100 to-indigo-100 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                  <span className="text-secondary-600 dark:text-secondary-400 text-sm">{performer?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                </div>
                <div className={`subscription-name-badge text-xs sm:text-lg ${performer?.subscriptionName === 'PRO'
                  ? 'bg-gradient-to-r from-primary-400 to-secondary-500'
                  : 'bg-gradient-to-r from-green-400 to-teal-500'
                  }`}>
                  {performer?.subscriptionName || 'FREE'}
                </div>
                <div className="ml-auto flex items-center gap-3 text-xs sm:text-lg">
                  <span className="text-gray-800 dark:text-gray-100">✅ {performer?.totalCorrectAnswers || 0} out of {performer?.totalScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-2 lg:p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-secondary-200 dark:border-secondary-700 bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20">
                <th className="py-3 px-3 text-left text-secondary-800 dark:text-secondary-200 text-sm md:text-base">🏆 Rank</th>
                <th className="py-3 px-3 text-left text-secondary-800 dark:text-secondary-200 text-sm md:text-base">👤 Name</th>
                <th className="py-3 px-3 text-left text-secondary-800 dark:text-secondary-200 text-sm md:text-base">📈 Level</th>
                <th className="py-3 px-3 text-left text-secondary-800 dark:text-secondary-200 text-sm md:text-base">📚 Total Quizzes</th>
                <th className="py-3 px-3 text-left text-secondary-800 dark:text-secondary-200 text-sm md:text-base">⭐ High Score Quizzes</th>
                <th className="py-3 px-3 text-left text-secondary-800 dark:text-secondary-200 text-sm md:text-base">🎯 Accuracy</th>
                <th className="py-3 px-3 text-left text-secondary-800 dark:text-secondary-200 text-sm md:text-base">✅ Total Correct</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((performer, index) => (
                <tr
                  key={performer?._id || `performer-row-${index}`}
                  className={`border-b border-gray-200 dark:border-gray-700 ${index === 0
                    ? 'bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/10 dark:to-primary-900/10'
                    : index === 1
                      ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10'
                      : index === 2
                        ? 'bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/10 dark:to-amber-900/10'
                        : ''
                    }`}
                >
                  <td className="py-3 px-3">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-secondary-100 to-indigo-100 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm text-secondary-600 dark:text-secondary-400">{performer?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{performer?.name || 'Anonymous'}</div>
                        <div className={`subscription-name-badge ${performer?.subscriptionName === 'PRO'
                          ? 'bg-gradient-to-r from-primary-400 to-secondary-500'
                          : 'bg-gradient-to-r from-green-400 to-teal-500'
                          }`}>
                          {performer?.subscriptionName || 'FREE'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">{performer?.userLevel || 0}</td>
                  <td className="py-3 px-3">{performer?.totalQuizzes || 0}</td>
                  <td className="py-3 px-3">{performer?.highQuizzes || 0}</td>
                  <td className="py-3 px-3">{(performer?.accuracy || 0)}%</td>
                  <td className="py-3 px-3">{performer?.totalCorrectAnswers || 0} out of {performer?.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PublicTopPerformers;


