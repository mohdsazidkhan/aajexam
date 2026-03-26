'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { FaTrophy, FaCrown, FaStar, FaMedal, FaRocket, FaBrain, FaChartLine, FaArrowLeft, FaAward, FaGem } from 'react-icons/fa';
import { FaUserGraduate, FaMagic } from 'react-icons/fa';
import API from '../../lib/api';
import MonthlyRewardsInfo from '../MonthlyRewardsInfo';
// MobileAppWrapper import removed
import Loading from '../Loading';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';
import UnifiedNavbar from '../UnifiedNavbar';
// Level badge icon mapping (same as HomePage)
const levelBadgeIcons = {
  'Starter': FaUserGraduate,
  'Rookie': FaStar,
  'Explorer': FaRocket,
  'Thinker': FaBrain,
  'Strategist': FaChartLine,
  'Achiever': FaAward,
  'Mastermind': FaGem,
  'Champion': FaTrophy,
  'Prodigy': FaMedal,
  'Wizard': FaMagic,
  'Legend': FaCrown,
  Default: FaStar,
};

// Fallback levels data if API fails
const fallbackLevels = [
  { _id: 0, levelName: 'Starter', quizzesRequired: 0, quizCount: 0, description: 'Starting point for all users' },
  { _id: 1, levelName: 'Rookie', quizzesRequired: 2, quizCount: 0, description: 'Begin your quiz journey' },
  { _id: 2, levelName: 'Explorer', quizzesRequired: 6, quizCount: 0, description: 'Discover new challenges' },
  { _id: 3, levelName: 'Thinker', quizzesRequired: 12, quizCount: 0, description: 'Develop critical thinking' },
  { _id: 4, levelName: 'Strategist', quizzesRequired: 20, quizCount: 0, description: 'Master quiz strategies' },
  { _id: 5, levelName: 'Achiever', quizzesRequired: 30, quizCount: 0, description: 'Reach new heights' },
  { _id: 6, levelName: 'Mastermind', quizzesRequired: 42, quizCount: 0, description: 'Become a quiz expert' },
  { _id: 7, levelName: 'Champion', quizzesRequired: 56, quizCount: 0, description: 'Compete with the best' },
  { _id: 8, levelName: 'Prodigy', quizzesRequired: 72, quizCount: 0, description: 'Show exceptional talent' },
  { _id: 9, levelName: 'Wizard', quizzesRequired: 90, quizCount: 0, description: 'Master of all quizzes' },
  { _id: 10, levelName: 'Legend', quizzesRequired: config.QUIZ_CONFIG.LEVEL_10_QUIZ_REQUIREMENT || 110, quizCount: 0, description: 'Achieve legendary status' }
];



const LevelsPage = ({ showNavbar = true }) => {
  const router = useRouter();
  const [userLevelData, setUserLevelData] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeProUsers, setActiveProUsers] = useState(0);
  console.log(userLevelData, 'userLevelData')
  useEffect(() => {
    const fetchData = async () => {
      let profileRes = null;
      try {
        setLoading(true);

        // Check if user is logged in
        const token = localStorage.getItem('token');

        // Fetch levels (public), profile (if authenticated) and stats for prize pool
        const promises = [API.getAllLevels(), API.getPublicLandingStats()];
        if (token) {
          promises.unshift(API.getProfile());
        }

        const results = await Promise.all(promises);

        // Parse results based on whether profile was fetched
        if (token) {
          profileRes = results[0];
          const levelsRes = results[1];
          const statsRes = results[2];
          setUserLevelData(profileRes?.user);
          if (levelsRes.success) {
            setLevels(levelsRes.data);
          } else {
            console.warn('Using fallback levels data due to API failure');
            setLevels(fallbackLevels);
          }
          if (statsRes?.success) {
            setActiveProUsers(statsRes.data.activeProUsers || 0);
          }
        } else {
          // No authentication - just use levels and stats data
          const levelsRes = results[0];
          const statsRes = results[1];
          if (levelsRes.success) {
            setLevels(levelsRes.data);
          } else {
            console.warn('Using fallback levels data due to API failure');
            setLevels(fallbackLevels);
          }
          if (statsRes?.success) {
            setActiveProUsers(statsRes.data.activeProUsers || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          stack: err.stack
        });
        console.warn('Using fallback levels data due to error');
        setLevels(fallbackLevels);
        // Only set error if it's a critical failure
        if (err.message && !err.message.includes('Not authorized')) {
          setError(`Failed to load data: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const highScoreQuizzes = userLevelData?.monthlyProgress?.highScoreWins || 0;
  const totalQuizAttempts = userLevelData?.monthlyProgress?.totalQuizAttempts || 0;
  // Use the levelInfo from API response instead of calculating from highScoreQuizzes
  const userLevel = userLevelData?.levelInfo?.currentLevel || { number: 0, name: 'Starter' };

  if (loading) {
    return <Loading fullScreen={true} size="lg" color="yellow" message="Loading level data..." />;
  }

  if (error && levels.length === 0) {
    return (
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-yellow-600 hover:to-red-600 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
        {showNavbar && <UnifiedNavbar isLandingPage={true} />}
        <div className="container mx-auto px-4 lg:px-10 py-8 mt-0">

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTrophy className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-600 dark:text-white mb-2 sm:mb-4 drop-shadow-lg">
              Level Progression System
            </h1>
            <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-200 font-medium">
              Journey from{" "}
              <span className="font-bold text-orange-700 dark:text-yellow-300">
                Starter
              </span>{" "}
              to{" "}
              <span className="font-bold text-red-600 dark:text-red-300">
                Legend
              </span>{" "}
              through{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                11 exciting levels
              </span>
            </p>
          </div>


          {/* Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Scholarship Info */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-3xl shadow-2xl p-2 md:p-4 lg:p-6 xl:p-8 border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <FaAward className="text-white text-2xl" />
                </div>
                <h3 className="text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white">
                  Scholarship & Prizes
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} ranked users in Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} (<span className="font-bold text-orange-700">Legend</span>) win scholarships and prizes!
                </p>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-700 mb-2">
                      {activeProUsers > 0 ? `₹${(activeProUsers * config.QUIZ_CONFIG.PRIZE_PER_PRO).toLocaleString('en-IN')}` : `₹${config.QUIZ_CONFIG.PRIZE_PER_PRO}+`}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Monthly Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} PRO users at Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with ≥{config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% accuracy win prizes (active PRO users × ₹{config.QUIZ_CONFIG.PRIZE_PER_PRO})</div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-orange-700 dark:text-yellow-400">
                    Reach Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with high accuracy to qualify for monthly prizes!
                  </span>
                </p>
              </div>
            </div>

            {/* Progression Rules */}
            <div className="bg-gradient-to-br from-yellow-50 to-red-50 dark:from-yellow-900/30 dark:to-red-900/30 rounded-3xl shadow-2xl p-2 xl:p-4 lg:p-6 xl:p-8 border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <FaGem className="text-white text-2xl" />
                </div>
                <h3 className="text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white">
                  Progression Rules
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Only quizzes with <span className="font-bold text-green-600">{config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% or higher score</span> count towards level progression
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Achieve high scores consistently to advance through levels
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Focus on quality over quantity - aim for excellence in every quiz!
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Every month, your progress resets to encourage fresh learning
                    and growth
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Reach Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with ≥{config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% accuracy to win monthly prizes!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Rewards Information */}
          <div className="mb-8">
            <MonthlyRewardsInfo />
          </div>

          {/* Current Level Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-2 md:p-8 border border-white/20 mb-8">
            <div className="text-center">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
                🎯 Your Current Level
              </h2>
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className={`w-12 h-12 md:w-24 md:h-24 bg-gradient-to-r from-yellow-100 to-red-100 dark:from-yellow-500 dark:to-red-500 rounded-2xl flex items-center justify-center`}>
                  {(() => {
                    const BadgeIcon = levelBadgeIcons[userLevel.name] || levelBadgeIcons.Default;
                    return (
                      <BadgeIcon className="text-red-600 dark:text-white text-3xl md:text-5xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                    );
                  })()}
                </div>
                <div className="text-left">
                  <div className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    {userLevel.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Level {userLevel.number}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {userLevel.description}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-md lg:text-2xl font-bold text-orange-700 dark:text-yellow-400 mb-2">
                  {highScoreQuizzes} / {totalQuizAttempts || 0} Quizzes
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  High-score quizzes completed ({config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}%+ score)
                </div>
              </div>
            </div>
          </div>

          {/* Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {levels.map((lvl) => {
              const isCurrentLevel = lvl.level === userLevel.number;
              const isUnlocked = highScoreQuizzes >= lvl.quizzesRequired;
              const cardBg = `bg-gradient-to-br 
  from-yellow-50 to-red-50
  dark:from-gray-800 dark:via-gray-900 dark:to-black`;
              return (
                <div
                  key={lvl.level}
                  className={`group relative rounded-2xl shadow-xl border-2 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 ${isCurrentLevel
                    ? 'border-yellow-500 shadow-yellow-500/25'
                    : isUnlocked
                      ? 'border-green-500 shadow-green-500/25'
                      : 'border-gray-300 dark:border-gray-600'
                    } ${cardBg}`}
                >
                  {/* Level Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isCurrentLevel
                      ? 'bg-yellow-500'
                      : isUnlocked
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                      }`}>
                      {lvl.level}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 md:w-24 md:h-24 bg-gradient-to-r from-yellow-100 to-red-100 dark:from-yellow-500 dark:to-red-500 rounded-2xl flex items-center justify-center mx-auto mt-6 mb-4">
                    {(() => {
                      const BadgeIcon = levelBadgeIcons[lvl.name] || levelBadgeIcons.Default;
                      return (
                        <BadgeIcon className="text-orange-700 dark:text-yellow-200 text-3xl md:text-5xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                      );
                    })()}
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-0">
                    <h3 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-2 text-center">
                      {lvl.name}
                    </h3>

                    <p className="text-gray-800 dark:text-white text-sm mb-4 text-center">
                      {lvl.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-200 text-sm">Required:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{lvl.quizzesRequired} quizzes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-200 text-sm">Available:</span>
                        <span className="font-semibold text-black dark:text-orange-200">{lvl.quizCount} quizzes</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className={`text-center py-2 rounded-lg text-sm font-semibold shadow-md ${isCurrentLevel
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : isUnlocked
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-gray-600 dark:bg-red-700 dark:text-red-300'
                      }`}>
                      {isCurrentLevel ? 'Current Level' : isUnlocked ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>


          {/* Back Button */}
          <div className="text-center">
            <button
              className="bg-gradient-to-r from-yellow-600 to-red-600 text-white px-8 py-3 rounded-xl hover:from-yellow-700 hover:to-red-700 transition-all duration-300 font-semibold transform hover:scale-105 flex items-center space-x-2 mx-auto"
              onClick={() => {
                router.back();
              }}
            >
              <FaArrowLeft className="text-sm" />
              <span>Back to Profile</span>
            </button>
          </div>
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default LevelsPage;







