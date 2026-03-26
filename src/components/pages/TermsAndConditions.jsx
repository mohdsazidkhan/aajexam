'use client';

import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaFileContract, FaShieldAlt, FaUsers, FaGift, FaBan, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaUserCheck, FaGavel, FaLock } from 'react-icons/fa';

import MobileAppWrapper from '../MobileAppWrapper';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';
import AuthorBio from '../AuthorBio';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';

const TermsAndConditions = () => {
  const router = useRouter();
  const canonicalUrl = getCanonicalUrl(router.asPath);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms & Conditions' }
  ]);

  return (
    <MobileAppWrapper title="Terms & Conditions">
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
        <div className="container mx-auto px-4 lg:px-10 py-8 mt-0">

          {/* Hero Section */}
          <div className="text-center mb-4 lg:mb-12">
            <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFileContract className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-4">
              Terms & Conditions
            </h1>
            <p className="text-md lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Legal Terms Governing Your Use of SUBG QUIZ Platform
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last Updated: February 12, 2026
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6 lg:space-y-8 mb-8 lg:mb-12">
            {/* Introduction */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <FaInfoCircle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  1. Acceptance of Terms
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-md lg:text-lg leading-relaxed">
                  Welcome to <strong>SUBG QUIZ</strong>, India's premier government exam preparation platform. These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and SUBG QUIZ (operated by Mohd Sazid Khan, UDYAM registered enterprise) governing your access to and use of our platform, services, and educational content.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  By creating an account, accessing our website, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and all applicable laws and regulations. If you do not agree with any part of these Terms, you must immediately discontinue use of our platform.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  SUBG QUIZ is a <strong>100% skill-based educational platform</strong> designed to help students prepare for government competitive examinations including SSC, UPSC, Banking, Railway, and state-level exams. Our platform does not involve gambling, games of chance, or any activities prohibited under Indian law. All achievements and recognition are based solely on knowledge, accuracy, and consistent performance.
                </p>
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <FaUserCheck className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  2. User Eligibility & Account Registration
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-md lg:text-lg leading-relaxed">
                  <strong>Age Requirement:</strong> You must be at least <strong>14 years of age</strong> to register and use SUBG QUIZ. Users between 14-18 years should have parental or guardian consent. By registering, you represent and warrant that you meet this age requirement.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  <strong>Account Accuracy:</strong> You agree to provide accurate, current, and complete information during registration and to update such information to maintain its accuracy. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  <strong>One Account Per User:</strong> Each user is permitted only one account. Creating multiple accounts to manipulate rankings, referrals, or rewards is strictly prohibited and will result in permanent suspension of all associated accounts.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  <strong>Account Security:</strong> You must immediately notify us of any unauthorized use of your account or any other breach of security. We are not liable for any loss or damage arising from your failure to protect your account credentials.
                </p>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <FaUsers className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  3. Subscription Plans & Payments
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-md lg:text-lg leading-relaxed">
                  SUBG QUIZ offers two subscription tiers, each providing access to different levels of our progression system:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Free Plan</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Access to Levels 0-9</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-800/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Pro Plan</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Full access to all Levels 0-10 (including Legend) and all premium features</p>
                  </div>
                </div>
                <p className="text-md lg:text-lg leading-relaxed mt-4">
                  <strong>Payment Terms:</strong> All subscription fees are processed through secure third-party payment gateways (PayU). Subscription fees are <strong>non-refundable</strong> under any circumstances, including but not limited to account suspension, disqualification from rewards, or voluntary account closure.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  <strong>Auto-Renewal:</strong> Subscriptions may auto-renew unless cancelled before the renewal date. You can manage your subscription settings through your account dashboard.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  <strong>Price Changes:</strong> We reserve the right to modify subscription pricing at any time. Price changes will apply to new subscriptions and renewals but will not affect active subscription periods already paid for.
                </p>
              </div>
            </div>

            {/* Performance Recognition System */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <FaGift className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  4. Performance Recognition & Reward Programs
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-md lg:text-lg leading-relaxed">
                  Our platform rewards academic excellence and community contribution. These are <strong>merit-based achievement systems</strong>, not contests or lotteries.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6">A. Daily, Weekly & Monthly Challenges</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <p>
                      <strong>Daily & Weekly:</strong> Open to active participants based on leaderboard rankings over the respective timeframes.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <p>
                      <strong>Monthly Eligibility:</strong> Must achieve Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} and hold an active PRO subscription.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <p>
                      <strong>Ranking Criteria:</strong> Highest scoring quizzes, accuracy rate, and total points earned during the challenge period.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 mt-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">Prize Pools</h3>
                  <p className="text-sm">
                    Top eligible users share dynamic total recognition pools depending on the challenge timeframe (e.g., active PRO player counts for Monthly). Distribution is processed within 7 business days after the challenge ends.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6">B. Referral Rewards</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <p>
                      <strong>Referrals:</strong> Earn wallet rewards when your referred friends sign up and purchase a PRO subscription. This helps support the community and gives you a direct bonus. Minimum withdrawal limits and verification processes apply.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6">Important Terms</h3>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Progress metrics reset at the end of each challenge period.</li>
                  <li>Recognition is subject to verification and strict fraud detection.</li>
                  <li>We reserve the right to withhold any rewards if fraudulent activity is detected.</li>
                  <li>Wallet withdrawals require verified bank details and meeting the minimum withdrawal threshold.</li>
                  <li>Applicable taxes and processing fees may be deducted as per Indian law.</li>
                </ul>
              </div>
            </div>

            {/* Prohibited Activities */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <FaBan className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  5. Prohibited Activities & Code of Conduct
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-md lg:text-lg leading-relaxed">
                  To maintain fairness and integrity, the following activities are strictly prohibited:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                    <span><strong>Cheating:</strong> Using external resources, answer keys, or collaboration during quizzes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                    <span><strong>Automation:</strong> Using bots, scripts, or automated tools to complete quizzes or manipulate rankings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                    <span><strong>Multiple Accounts:</strong> Creating or operating multiple accounts to gain unfair advantages</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                    <span><strong>Referral Fraud:</strong> Creating fake referrals or incentivizing sign-ups through misleading means</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                    <span><strong>System Manipulation:</strong> Attempting to exploit bugs, vulnerabilities, or loopholes in our platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                    <span><strong>Impersonation:</strong> Misrepresenting your identity or impersonating other users</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaBan className="text-red-500 mt-1 flex-shrink-0" />
                    <span><strong>Harassment:</strong> Engaging in abusive, threatening, or inappropriate behavior toward other users or staff</span>
                  </li>
                </ul>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700 mt-4">
                  <p className="text-md font-semibold text-red-800 dark:text-red-300">
                    ⚠️ Violation Consequences: Any violation of these prohibitions will result in immediate and permanent account suspension, forfeiture of all recognition/rewards, and potential legal action.
                  </p>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <FaLock className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  6. Intellectual Property Rights
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-md lg:text-lg leading-relaxed">
                  All content on SUBG QUIZ, including but not limited to quiz questions, educational materials, text, graphics, logos, icons, images, audio clips, digital downloads, and software, is the exclusive property of SUBG QUIZ or its content suppliers and is protected by Indian and international copyright laws.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material from our platform except as permitted for personal, non-commercial use.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <FaGavel className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  7. Limitation of Liability & Disclaimers
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-md lg:text-lg leading-relaxed">
                  SUBG QUIZ is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our platform will be uninterrupted, secure, or error-free.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use our platform, including but not limited to loss of data, loss of profits, or exam performance outcomes.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  While our educational content is designed to aid exam preparation, we make no guarantees regarding exam success or job placement. Your performance in actual government exams depends on multiple factors beyond our control.
                </p>
              </div>
            </div>

            {/* Modifications */}
            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-3xl shadow-xl p-4 md:p-6 lg:p-8 border border-orange-200 dark:border-orange-700">
              <div className="flex items-start gap-4">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaExclamationTriangle className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    8. Modifications to Terms & Services
                  </h3>
                  <p className="text-md lg:text-lg text-gray-700 dark:text-gray-300">
                    We reserve the right to modify these Terms, our services, quiz content, subscription pricing, recognition program structure, or any other aspect of our platform at any time without prior notice. Material changes will be communicated through email or platform notifications. Your continued use of SUBG QUIZ after such modifications constitutes acceptance of the updated Terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Governing Law */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <FaGavel className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  9. Governing Law & Dispute Resolution
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="text-md lg:text-lg leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of SUBG QUIZ shall be subject to the exclusive jurisdiction of courts in [Your City/State], India.
                </p>
                <p className="text-md lg:text-lg leading-relaxed">
                  We encourage users to contact our support team first to resolve any concerns amicably before pursuing legal action.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaInfoCircle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  10. Contact Information
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                For questions, concerns, or clarifications regarding these Terms, please contact us at: <strong>support@mohdsazidkhan.com</strong>
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Fair Play Guaranteed</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                Strict monitoring and anti-fraud measures ensure a level playing field for all users.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Transparent Terms</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                All rules, conditions, and recognition structures are clearly defined and accessible.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <FaUsers className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">User Protection</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                Comprehensive policies protect user rights and ensure a safe learning environment.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-100 to-purple-100 dark:from-yellow-800 dark:to-purple-800 rounded-3xl p-4 md:p-6 lg:p-8">
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                Questions About Our Terms?
              </h2>
              <p className="text-md lg:text-xl mb-4 lg:mb-6 opacity-90 text-gray-800 dark:text-white">
                Our support team is here to help clarify any questions or concerns
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-white text-gray-700 dark:text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Contact Support
              </button>
            </div>
          </div>

          {/* Author Bio */}
          <AuthorBio />

          {/* Last Updated */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            Last Updated: February 12, 2026
          </p>

        </div>
      </div>
      <UnifiedFooter />
    </MobileAppWrapper>
  );
};

export default TermsAndConditions;
