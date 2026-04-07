import { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaRocket, FaGift, FaCreditCard, FaShieldAlt, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
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
      icon: <FaRocket className="text-secondary-500" />,
      color: "blue",
      description: `Win Daily! Top ${config.QUIZ_CONFIG.DAILY_WINNER_COUNT} performers with at least ${config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT} high-score quizzes and ${config.QUIZ_CONFIG.DAILY_MINIMUM_ACCURACY}% accuracy win!`
    },
    weekly: {
      title: "Weekly Competition",
      icon: <FaCalendarAlt className="text-primary-500" />,
      color: "purple",
      description: `Win Weekly! Top ${config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT} performers with at least ${config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes and ${config.QUIZ_CONFIG.WEEKLY_MINIMUM_ACCURACY}% accuracy win!`
    },
    monthly: {
      title: "Monthly Mega Competition",
      icon: <FaTrophy className="text-amber-500" />,
      color: "green",
      description: `The Big One! Top ${config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT} performers with at least ${config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes and ${config.QUIZ_CONFIG.MONTHLY_MINIMUM_ACCURACY}% accuracy win!`
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily', color: 'bg-primary-600' },
    { id: 'weekly', label: 'Weekly', color: 'bg-purple-600' },
    { id: 'monthly', label: 'Monthly', color: 'bg-green-600' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4 font-outfit">
      <div
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto transition-all duration-500 transform border-2 border-b-8 border-slate-200 dark:border-slate-800 font-outfit scrollbar-none ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
      >
        <div className="bg-primary-500 text-white p-4 lg:p-10 rounded-t-[2.5rem] shadow-duo-primary border-b-4 border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl transform -rotate-6">
                <FaRocket className="text-3xl text-primary-700 dark:text-primary-500" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">New Rewards</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-100 opacity-80 mt-1">Version 2.0 â€¢ Live Mission</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all active:translate-y-1"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-10 space-y-8">
          <div className="bg-primary-500 text-white rounded-[2rem] p-8 shadow-duo-secondary border-2 border-white dark:border-slate-700">
            <h3 className="text-sm lg:text-xl font-black mb-6 flex items-center uppercase tracking-tight">
              <FaCreditCard className="mr-3" /> One Wallet, Two Balances
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border-2 border-white/30 shadow-inner">
                <p className="font-black uppercase text-[10px] tracking-widest text-white mb-2">1. Main Balance</p>
                <p className="text-sm font-medium opacity-90 leading-relaxed">Earnings from Blogging, Quiz creation, and Referrals go here.</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border-2 border-white/30 shadow-inner">
                <p className="font-black uppercase text-[10px] tracking-widest text-white mb-2">2. Claimable Rewards</p>
                <p className="text-sm font-medium opacity-90 leading-relaxed">All winnings from Daily, Weekly, and Monthly challenges!</p>
              </div>
            </div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary-100 opacity-80 text-center">
              * Note: Move winnings from "Claimable" to "Main Wallet" anytime!
            </p>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-xl p-4">
            <div className="flex flex-col items-start">
              <h3 className="text-md lg:text-lg font-black text-primary-800 dark:text-primary-200 mb-2 flex items-center gap-2 uppercase tracking-tight">
                <FaShieldAlt className="text-primary-600" /> Competition Rules & Eligibility
              </h3>
              <p className="text-primary-700 dark:text-primary-300 text-sm lg:text-base font-medium">
                Our new competition system is now fully active! Compete 
                <span className="font-black text-primary-800 dark:text-primary-400 mx-1 underline decoration-primary-500 decoration-2">Daily, Weekly, and Monthly</span>
                to win exciting prizes based on accuracy and speed.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] p-4 lg:p-8 border-2 border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <h3 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] flex items-center">
                Challenge Tiers
              </h3>

              <div className="flex bg-slate-100 dark:bg-slate-800/50 p-2 rounded-[1.5rem] border-2 border-slate-200/50 dark:border-slate-700/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                      ? `${tab.color} text-white shadow-duo active:translate-y-0.5`
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border-2 border-slate-200/50 dark:border-slate-700/30 shadow-inner">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-3xl">{rewardData[activeTab].icon}</span>
                <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{rewardData[activeTab].title}</h4>
              </div>
              <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-loose">
                {rewardData[activeTab].description}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { place: '1st', medal: 'ðŸ¥‡', color: 'bg-primary-500' },
                { place: '2nd', medal: 'ðŸ¥ˆ', color: 'bg-slate-200 dark:bg-slate-700' },
                { place: '3rd', medal: 'ðŸ¥‰', color: 'bg-primary-500/80' },
                { place: '4th', medal: 'ðŸŽ–ï¸', color: 'bg-primary-500' },
                { place: '5th', medal: 'ðŸŽ–ï¸', color: 'bg-primary-500/80' },
              ].filter((_, i) => {
                const count = activeTab === 'daily' ? config.QUIZ_CONFIG.DAILY_WINNER_COUNT :
                  activeTab === 'weekly' ? config.QUIZ_CONFIG.WEEKLY_WINNER_COUNT :
                    config.QUIZ_CONFIG.MONTHLY_WINNER_COUNT;
                return i < count;
              }).map(({ place, medal, color }) => (
                <div key={place} className="flex flex-col items-center bg-white dark:bg-slate-800/50 rounded-2xl p-4 border-2 border-b-4 border-slate-200/50 dark:border-slate-800/30 shadow-xl transition-all hover:-translate-y-1">
                  <div className="text-3xl mb-3">{medal}</div>
                  <div className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1">{place}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-pink-50 dark:from-primary-900/20 dark:to-pink-900/20 border border-primary-200 dark:border-primary-700 rounded-2xl p-6">
            <h3 className="text-sm lg:text-xl font-black text-primary-800 dark:text-primary-200 mb-2 flex items-center uppercase tracking-tight">
              <FaGift className="text-2xl mr-2 text-primary-600" />
              Referral Bonuses
            </h3>
            <p className="text-sm text-primary-700 dark:text-primary-300 mb-4 font-bold uppercase tracking-widest opacity-80">
              Earn unlimited wallet credits! Example: 10 referrals with Pro plan = ₹{10 * config.QUIZ_CONFIG.REFERRAL_REWARD_PRO} each month!
            </p>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-700 rounded-2xl p-6">
            <h3 className="text-sm lg:text-xl font-black text-primary-800 dark:text-primary-200 mb-2 flex items-center uppercase tracking-tight">
              <span className="text-xl mr-2">ðŸ“±</span>
              AajExam Mobile App is Now Live!
            </h3>
            <p className="text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              The updated mobile app is now available on Google Play Store! You can now claim rewards, track your histories, and compete in quizzes directly from your phone.
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.aajexam.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-duo active:translate-y-1 font-black uppercase text-xs tracking-widest"
            >
              <FaRocket className="mr-3" />
              Download from Play Store
            </a>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-b-[2.5rem] border-t-2 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center sm:text-left leading-loose">
              Welcome to the new era of education.<br />Learn, compete, and grow daily.
            </p>
            <button
              onClick={handleClose}
              className="bg-primary-500 text-white px-12 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all active:translate-y-1 shadow-duo-primary"
            >
              Let's Go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemUpdateModal;







