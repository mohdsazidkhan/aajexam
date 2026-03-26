import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaStar, FaUsers, FaChartLine } from 'react-icons/fa';
import API from '../lib/api';
import config from '../lib/config/appConfig';
import { useTokenValidation } from '../hooks/useTokenValidation';
import Loading from './Loading';

const MonthlyRewardDashboard = () => {
  const [activeTab, setActiveTab] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [data, setData] = useState({
    leaderboard: [],
    prizepool: null,
    userProgress: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { checkAuthStatus } = useTokenValidation();

  const fetchCompetitionData = async (type) => {
    try {
      setLoading(true);
      if (!(await checkAuthStatus())) {
        setError('Please log in to view leaderboard');
        return;
      }

      const limit = activeTab === 'daily' ? (config.QUIZ_CONFIG.DAILY_WINNER_COUNT || 1) :
                   activeTab === 'weekly' ? (config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT || 3) :
                   (config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT || 5);

      const [leaderboardRes, prizeRes, profileRes] = await Promise.all([
        API.getCompetitionLeaderboard(type, 1, limit),
        API.getPrizePools(),
        API.getProfile()
      ]);

      if (leaderboardRes.success && prizeRes.success && profileRes.success) {
        setData({
          leaderboard: leaderboardRes.leaderboard,
          prizepool: prizeRes.prizepools[type],
          userProgress: profileRes.user[`${type}Progress`],
          activeProUsers: prizeRes.activeProUsers
        });
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching competition data:', err);
      setError(err.message || 'Failed to fetch information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitionData(activeTab);
  }, [activeTab, checkAuthStatus]);

  if (loading && !data.leaderboard.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loading size="md" color="blue" message="" />
      </div>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <FaCrown className="text-yellow-500" />;
      case 2: return <FaMedal className="text-gray-400" />;
      case 3: return <FaMedal className="text-orange-500" />;
      default: return <FaStar className="text-blue-500" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
      case 2: return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
      case 3: return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
      default: return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily Challenge', color: 'blue' },
    { id: 'weekly', label: 'Weekly Challenge', color: 'purple' },
    { id: 'monthly', label: 'Monthly Challenge', color: 'orange' },
  ];

  const requirements = {
    daily: { 
      quizzes: config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT, 
      acc: config.QUIZ_CONFIG.DAILY_MINIMUM_ACCURACY || 70 
    },
    weekly: { 
      quizzes: config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT, 
      acc: config.QUIZ_CONFIG.WEEKLY_MINIMUM_ACCURACY || 70 
    },
    monthly: { 
      quizzes: config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT, 
      acc: config.QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY || 70 
    },
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
        {['daily', 'weekly', 'monthly'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 capitalize ${activeTab === tab
              ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Eligibility Status */}
      {data.userProgress && (
        <div className={`rounded-xl p-6 border-2 transition-all ${data.userProgress.rewardEligible
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
          : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
          }`}>
          <div className="flex items-center gap-3 mb-4">
            <FaTrophy className={`text-2xl ${data.userProgress.rewardEligible ? 'text-green-600' : 'text-blue-600'}`} />
            <h2 className="text-xl font-bold">
              {data.userProgress.rewardEligible ? `You are eligible for ${activeTab} rewards!` : `Track your ${activeTab} progress`}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1 caps">High-Score Wins</p>
              <p className="text-lg font-bold">{data.userProgress.highScoreWins} / {requirements[activeTab].quizzes}</p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1 caps">Accuracy</p>
              <p className="text-lg font-bold">{data.userProgress.accuracy}% / {requirements[activeTab].acc}%</p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1 caps">Total Score</p>
              <p className="text-lg font-bold">{data.userProgress.totalScore}</p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1 caps">Rank</p>
              <p className="text-lg font-bold text-blue-600">#{data.userProgress.rewardRank || '?'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Rankings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FaUsers className="text-2xl text-blue-600" />
            <h2 className="text-xl font-bold">
              Top {
                activeTab === 'daily' ? (config.QUIZ_CONFIG.DAILY_WINNER_COUNT || 1) :
                activeTab === 'weekly' ? (config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT || 3) :
                (config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT || 5)
              } Performers
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            Prize Pool: <span className="font-bold text-green-600">₹{data.prizepool?.total || 0}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loading size="md" /></div>
        ) : data.leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No eligible contestants yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.leaderboard.map((user) => (
              <div key={user.studentId} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.01] ${getRankColor(user.rank)}`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(user.rank)}
                    <span className="font-bold text-lg">#{user.rank}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.studentName}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>Wins: {user.stats.highScoreWins}</span>
                      <span>Acc: {user.stats.accuracy}%</span>
                      <span>Score: {user.stats.totalScore}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-600">
                    ₹{data.prizepool?.distribution?.find(d => d.rank === user.rank)?.amount || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prize Distribution Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <FaChartLine className="text-green-600" />
          Reward Distribution
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {data.prizepool?.distribution?.map((reward) => (
            <div key={reward.rank} className={`p-4 rounded-xl border text-center transition-all ${getRankColor(reward.rank)}`}>
              <p className="text-xs font-bold text-gray-500 mb-1">Rank #{reward.rank}</p>
              <p className="text-xl font-black text-green-600">₹{reward.amount}</p>
              <p className="text-[10px] text-gray-400">{reward.percentage}% of pool</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking Criteria */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaChartLine /> Ranking Priority
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <span className="block font-black text-blue-200 mb-1">1ST</span>
            Highest High-Score Wins
          </div>
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <span className="block font-black text-blue-200 mb-1">2ND</span>
            Accuracy Percentage
          </div>
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <span className="block font-black text-blue-200 mb-1">3RD</span>
            Total Score
          </div>
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <span className="block font-black text-blue-200 mb-1">4TH</span>
            Total Quizzes Played
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRewardDashboard;

