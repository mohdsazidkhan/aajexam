'use client';

import { useState, useEffect } from 'react';
import API from '../lib/api';
import Link from 'next/link';
import Loading from './Loading';

const LevelsShowcase = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.getPublicLevels();
      if (response.success) {
        setLevels(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load levels');
      console.error('Error loading levels:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionBadgeColor = (subscription) => {
    const colors = {
      'free': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'basic': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'premium': 'bg-purple-100 text-yellow-800 dark:bg-purple-900 dark:text-yellow-200',
      'pro': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[subscription] || colors.free;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="md" color="blue" message="Loading levels..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchLevels}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-8 text-center">
        <h2 className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎯 All Levels
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Progress through {levels.length} levels and become a legend!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {levels.map((level) => (
          <div
            key={level.levelNumber}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{ borderTopColor: level.color, borderTopWidth: '4px' }}
          >
            <div className="p-6">
              {/* Level Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{level.emoji}</span>
                  <div>
                    <h3 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                      {level.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Level {level.levelNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {level.description}
              </p>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Quizzes Required:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {level.quizzesRequired}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Users on this level:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {level.userCount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              {/* Subscription Badge */}
              <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getSubscriptionBadgeColor(level.requiredSubscription)}`}>
                  {level.requiredSubscription}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3">
              <Link
                href={`/levels/${level.levelNumber}`}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center gap-2"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LevelsShowcase;

