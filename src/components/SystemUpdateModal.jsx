import { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaRocket, FaGift, FaCreditCard } from 'react-icons/fa';
import config from '../lib/config/appConfig';

const SystemUpdateModal = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const rewardData = {
    daily: {
      title: "Daily Competition",
      icon: "⚡",
      color: "blue",
      description: `Win Daily! Top ${config.QUIZ_CONFIG.DAILY_WINNER_COUNT} performers with at least ${config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT} high-score quizzes and ${config.QUIZ_CONFIG.DAILY_MINIMUM_ACCURACY}% accuracy win!`
    },
    weekly: {
      title: "Weekly Competition",
      icon: "📅",
      color: "purple",
      description: `Win Weekly! Top ${config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT} performers with at least ${config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes and ${config.QUIZ_CONFIG.WEEKLY_MINIMUM_ACCURACY}% accuracy win!`
    },
    monthly: {
      title: "Monthly Mega Competition",
      icon: "🏆",
      color: "green",
      description: `The Big One! Top ${config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT} performers with at least ${config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes and ${config.QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY}% accuracy win!`
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily', color: 'bg-secondary-600' },
    { id: 'weekly', label: 'Weekly', color: 'bg-purple-600' },
    { id: 'monthly', label: 'Monthly', color: 'bg-green-600' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isVisible ? 'opacity-50' : 'opacity-0'
          }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto transition-all duration-300 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
      >
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-3 lg:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaRocket className="text-2xl" />
              </div>
              <div>
                <h2 className="text-md lg:text-2xl font-bold">New Rewards System</h2>
                <p className="text-secondary-100">Live on Web & Mobile App</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-3 lg:p-6 space-y-6">
          {/* New Wallet Structure */}
          <div className="bg-gradient-to-r from-secondary-600 to-indigo-600 text-white rounded-xl p-4 lg:p-6 shadow-lg">
            <h3 className="text-lg lg:text-xl font-bold mb-4 flex items-center">
              <FaCreditCard className="mr-2" /> One Wallet, Two Balances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <p className="font-bold text-primary-300">1. Main Wallet (Withdrawable)</p>
                <p className="text-sm">Earnings from Blogging, Quiz creation, and Referrals go here.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <p className="font-bold text-green-300">2. Claimable Rewards</p>
                <p className="text-sm">All winning from Daily, Weekly, and Monthly competitions!</p>
              </div>
            </div>
            <p className="mt-4 text-xs lg:text-sm font-medium italic opacity-90">
              * Note: Move winnings from "Claimable" to "Main Wallet" anytime using the new Claim button!
            </p>
          </div>

          <div className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-700 rounded-xl p-3 lg:p-4">
            <div className="flex flex-col items-start">
              <h3 className="text-md lg:text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-2">
                {"🎯 Competition Rules & Eligibility"}
              </h3>
              <p className="text-secondary-700 dark:text-secondary-300 text-sm lg:text-base">
                {"Our new competition system is now fully active! Compete "}
                <span className="font-bold text-primary-600 dark:text-red-400">Daily, Weekly, and Monthly</span>
                {" to win exciting prizes based on accuracy and speed."}
              </p>
            </div>
          </div>

          <div className={`bg-${rewardData[activeTab].color}-50 dark:bg-${rewardData[activeTab].color}-900/20 border border-${rewardData[activeTab].color}-200 dark:border-${rewardData[activeTab].color}-700 rounded-xl p-2 lg:p-4 transition-colors duration-300`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className={`text-md lg:text-lg font-semibold text-${rewardData[activeTab].color}-800 dark:text-${rewardData[activeTab].color}-200 flex items-center`}>
                <span className="text-xl mr-2">{rewardData[activeTab].icon}</span>
                {rewardData[activeTab].title}
              </h3>

              <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id
                      ? `${tab.color} text-white shadow-md`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mb-4 text-sm text-gray-700 dark:text-gray-200 italic p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              {rewardData[activeTab].description}
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { place: '1st', medal: '🥇', pct: '35%', color: 'text-primary-600' },
                { place: '2nd', medal: '🥈', pct: '25%', color: 'text-gray-400' },
                { place: '3rd', medal: '🥉', pct: '20%', color: 'text-primary-600' },
                { place: '4th', medal: '🏅', pct: '12%', color: 'text-secondary-600' },
                { place: '5th', medal: '🏅', pct: '8%', color: 'text-secondary-600' },
              ].filter((_, i) => {
                const count = activeTab === 'daily' ? config.QUIZ_CONFIG.DAILY_WINNER_COUNT :
                  activeTab === 'weekly' ? config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT :
                    config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT;
                return i < count;
              }).map(({ place, medal, pct, color }) => (
                <div key={place} className="text-center bg-white dark:bg-gray-700 rounded-lg p-3 border border-transparent hover:border-secondary-400/50 transition-all">
                  <div className="text-2xl mb-2">{medal}</div>
                  <div className={`text-sm font-bold ${color}`}>{place} Place</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {activeTab === 'daily' ? '100% of pool' : pct + ' of pool'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Section (Simplified) */}
          <div className="bg-gradient-to-br from-primary-50 to-pink-50 dark:from-primary-900/20 dark:to-pink-900/20 border border-primary-200 dark:border-primary-700 rounded-xl p-4">
            <h3 className="text-md lg:text-xl font-bold text-primary-800 dark:text-primary-200 mb-2 flex items-center">
              <FaGift className="text-2xl mr-2" />
              🎁 Referral Bonuses
            </h3>
            <p className="text-sm text-primary-600 dark:text-primary-300 mb-4 font-medium">
              {"Earn unlimited wallet credits! Example: 10 referrals with Pro plan = ₹ "}{10 * config.QUIZ_CONFIG.REFERRAL_REWARD_PRO}{" each month!"}
            </p>
          </div>

          {/* Mobile App Section */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2 flex items-center">
              <span className="text-xl mr-2">📱</span>
              Subg Mobile App is Now Live!
            </h3>
            <p className="text-primary-700 dark:text-primary-300 text-sm lg:text-base mb-4">
              The updated mobile app is now available on Google Play Store! You can now claim rewards, track your histories, and compete in quizzes directly from your phone.
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.subgapp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md"
            >
              <FaRocket className="mr-2" />
              Download from Play Store
            </a>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
              {"🎉 Welcome to the new era of competition! Win daily, weekly, and monthly."}
            </p>
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-secondary-600 to-indigo-600 hover:from-secondary-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Got It! Let's Start
            </button>
          </div>
        </div>
      </div>
    </div >

  );
};

export default SystemUpdateModal;





