'use client';

import { useRouter } from 'next/navigation';
import { FaRocket, FaUserPlus, FaCreditCard, FaPlayCircle, FaChartLine, FaTrophy, FaGift, FaCheckCircle, FaLightbulb, FaShieldAlt } from 'react-icons/fa';

import MobileAppWrapper from '../MobileAppWrapper';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';

const HowItWorks = () => {
  const router = useRouter();

  return (
    <MobileAppWrapper title="How It Works">
      <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark">
        <div className="container mx-auto px-4 lg:px-10 py-8 mt-0">

          {/* Hero Section */}
          <div className="text-center mb-4 lg:mb-12">
            <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaRocket className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-bold bg-gradient-to-r from-secondary-600 via-secondary-500 to-secondary-700 bg-clip-text text-transparent mb-4">
              How It Works
            </h1>
            <p className="text-md lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your step-by-step guide to mastering AajExam and earning rewards
            </p>
          </div>

          {/* Steps Section */}
          <div className="space-y-6 lg:space-y-8 mb-8 lg:mb-12">
            {/* Step 1 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaUserPlus className="text-white text-2xl lg:text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm lg:text-base font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">Step 1</span>
                    <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      Register / Login
                    </h2>
                  </div>
                  <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    Sign up using your mobile number or email to create your AajExam account. It's quick, easy, and free to get started!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-r from-primary-500 to-primary-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaCreditCard className="text-white text-2xl lg:text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm lg:text-base font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">Step 2</span>
                    <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      Choose Subscription & Access Levels
                    </h2>
                  </div>
                  <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                    Access quizzes based on your subscription plan:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-xl p-3 lg:p-4 border border-secondary-200 dark:border-secondary-700">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCheckCircle className="text-secondary-600 dark:text-secondary-400" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">Free Plan</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Levels 0 to 9</p>
                    </div>
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl p-3 lg:p-4 border border-primary-200 dark:border-primary-700">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCheckCircle className="text-primary-600 dark:text-primary-400" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">Pro Plan</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">All Levels (0 to 10)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaPlayCircle className="text-white text-2xl lg:text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm lg:text-base font-semibold text-primary-600 dark:text-primary-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">Step 3</span>
                    <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      Play Daily, Weekly & Monthly Quizzes
                    </h2>
                  </div>
                  <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    Participate in skill-based multiple-choice quizzes designed to test your knowledge across various topics. Compete in Daily, Weekly & Monthly Challenges!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-r from-secondary-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaChartLine className="text-white text-2xl lg:text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm lg:text-base font-semibold text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-900/30 px-3 py-1 rounded-full">Step 4</span>
                    <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      Track Progress
                    </h2>
                  </div>
                  <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    View your quiz performance, accuracy stats, and level advancement in your dashboard. Monitor your growth and see how you're improving over time.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaGift className="text-white text-2xl lg:text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm lg:text-base font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">Step 5</span>
                    <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      Daily, Weekly & Monthly Reward System
                    </h2>
                  </div>
                  <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                    Rewards are given to top eligible users from dynamic prize pools across multiple timeframes:
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300"><strong>Daily Rewards:</strong> Compete every day to win from our daily prize pool.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300"><strong>Weekly Rewards:</strong> Consistent performance throughout the week earns you bigger rewards.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300"><strong>Monthly Rewards:</strong> Reached <strong>Level 10</strong>? Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} PRO users share the massive dynamic prize pool.</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Ranking is based on:</strong> 1) High-scoring quizzes, 2) Accuracy, 3) Total score.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaLightbulb className="text-white text-2xl lg:text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm lg:text-base font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">Step 6</span>
                    <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      Refer Friends & Earn More
                    </h2>
                  </div>
                  <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    Boost your earnings by actively participating in the community! You can earn wallet credits by:
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-md lg:text-lg text-gray-700 dark:text-gray-300 space-y-1">
                    <li><strong>Referring Friends:</strong> Invite friends and earn a bonus when they subscribe to PRO!</li>
                    <li><strong>Upgrading to PRO:</strong> Get access to the massive monthly prize pool.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaTrophy className="text-white text-2xl lg:text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm lg:text-base font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">Step 7</span>
                    <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      Result & Prize Distribution
                    </h2>
                  </div>
                  <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    Results are declared regularly per the challenge timeframe (e.g., end of the month for monthly). Winners receive their rewards from our dynamic prize pool directly to their wallets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-gradient-to-r from-primary-100 to-red-100 dark:from-primary-900/30 dark:to-red-900/30 rounded-3xl shadow-xl p-4 md:p-6 lg:p-8 border border-primary-200 dark:border-primary-700 mb-8 lg:mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaLightbulb className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Important Note
                </h3>
                <p className="text-md lg:text-lg text-gray-700 dark:text-gray-300">
                  AajExam is a <strong>100% skill-based platform</strong>. There is no gambling or betting involved. Rewards are purely based on consistent knowledge, accuracy, and performance.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Skill-Based</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                Every quiz tests your knowledge and skills. No luck involved - only your expertise matters.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <FaTrophy className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Real Rewards</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                Earn real rewards based on your performance and accuracy in monthly competitions.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 to-primary-500 rounded-xl flex items-center justify-center mb-4">
                <FaChartLine className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Track Progress</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                Monitor your performance, accuracy, and level progression in real-time.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-secondary-100 from-red-100 dark:from-secondary-800 dark:from-red-800 rounded-3xl p-4 md:p-6 lg:p-8">
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                Ready to Start Your Quiz Journey?
              </h2>
              <p className="text-md lg:text-xl mb-4 lg:mb-6 opacity-90 text-gray-800 dark:text-white">
                Join thousands of learners who are already turning their knowledge into success
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-white text-gray-700 dark:text-secondary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Get Started Today
              </button>
            </div>
          </div>

        </div>
      </div>
      <UnifiedFooter />
    </MobileAppWrapper>
  );
};

export default HowItWorks;
