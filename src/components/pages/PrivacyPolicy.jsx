'use client';

import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaShieldAlt, FaDatabase, FaLock, FaUserShield, FaEye, FaCookie, FaCheckCircle, FaInfoCircle, FaGift } from 'react-icons/fa';

import MobileAppWrapper from '../MobileAppWrapper';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';
import AuthorBio from '../AuthorBio';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';

const PrivacyPolicy = () => {
  const router = useRouter();
  const canonicalUrl = getCanonicalUrl(router.asPath);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy' }
  ]);

  return (
    <MobileAppWrapper title="Privacy Policy">
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
            <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShieldAlt className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-green-700 bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-md lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your privacy and data security are our top priorities
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
                  Introduction
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                This Privacy Policy explains how <strong>SUBG QUIZ</strong> collects, uses, stores, and protects your information when you use our platform. By using SUBG QUIZ, you agree to the practices described below.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <FaDatabase className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  1. Information We Collect
                </h2>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                    Account Information
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Name, email, phone number, password (hashed), referral code.</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600 dark:text-green-400" />
                    Profile/Student Data
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Level progression, badges, leaderboard placement, high‑score quizzes count, quiz best scores, total quizzes played.</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 from-red-100 dark:from-purple-900/30 dark:from-red-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-orange-700 dark:text-yellow-400" />
                    Quiz Activity
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Quiz attempts, scores, timings, and related analytics used to calculate levels, leaderboard ranks, and rewards eligibility.</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-800/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaGift className="text-orange-700 dark:text-yellow-400" />
                    Rewards & Wallet
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Locked/unlocked/claimed rewards history, claimable balance, and monthly rewards processing status.</p>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-pink-100 dark:from-red-900/30 dark:to-pink-800/30 rounded-xl p-4 border border-red-200 dark:border-red-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-red-600 dark:text-red-400" />
                    Bank/Withdrawal Details (Optional)
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">If you provide bank information for rewards withdrawal, we store it securely and use it only for payout verification and processing.</p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-800/30 rounded-xl p-4 border border-teal-200 dark:border-teal-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-teal-600 dark:text-teal-400" />
                    Subscription & Payments
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Plan details and payment status handled via secure third‑party processors (e.g., PAYU). We do not store full card/UPI details.</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-indigo-100 dark:from-yellow-900/30 dark:to-indigo-800/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-red-600 dark:text-red-400" />
                    Device/Log Data
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">IP, browser type, device information, timestamps, and limited logs for security and troubleshooting.</p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <FaEye className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  2. How We Use Your Information
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">To create and manage your account, authenticate logins, and provide core features.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">To run quizzes, compute scores, determine level progression, and show leaderboard rankings.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    To process rewards, including <strong>Daily, Weekly & Monthly Reward Systems</strong>:
                  </p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 ml-8">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Daily & Weekly:</strong> Handled dynamically based on short-term leaderboard rankings.
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Monthly:</strong> Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} eligible PRO users at Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with {process.env.NEXT_PUBLIC_MONTHLY_REWARD_QUIZ_REQUIREMENT || 50} high-score quizzes win from a dynamic prize pool.
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Reset:</strong> Progress and rewards reset at the beginning of each respective challenge period.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">To send important updates (e.g., account notices, reward status, subscription reminders).</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">To improve platform performance, safety, and user experience.</p>
                </div>
              </div>
            </div>

            {/* Sharing & Third-Party Services */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <FaUserShield className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  3. Sharing & Third‑Party Services
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Payments:</strong> We use trusted payment processors (e.g., PAYU) to handle subscription payments securely. Necessary transaction data is shared with them to complete payment processing.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Email/SMS:</strong> We may use reputable communication providers to deliver OTPs, receipts, or important notifications.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>No Ads/No Sale of Data:</strong> We do not sell your personal information or share it for third‑party advertising.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Legal/Safety:</strong> We may disclose information if required by law or to protect users, our rights, and the platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaLock className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  4. Data Security
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                We use industry‑standard safeguards to protect data in transit and at rest where applicable (e.g., HTTPS, hashed passwords, access controls). Only authorized personnel/business partners with a need to know may access relevant data. No method of transmission or storage is 100% secure; however, we continuously improve our protections.
              </p>
            </div>

            {/* Data Retention */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <FaDatabase className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  5. Data Retention
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Account, quiz, and rewards records are retained for service continuity, audits, and legal compliance.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Bank details (if provided) are retained only as long as necessary for payouts and compliance, or until you request deletion (subject to legal requirements).</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Transaction logs are retained as required by applicable laws and platform security needs.</p>
                </div>
              </div>
            </div>

            {/* Your Rights & Choices */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <FaCheckCircle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  6. Your Rights & Choices
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Access, update, or correct your profile information.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Request deletion of optional data (e.g., bank details) where not legally required to retain.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Export your data upon reasonable request.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">Opt out of non‑essential communications.</p>
                </div>
              </div>
            </div>

            {/* Cookies & Authentication */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <FaCookie className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  7. Cookies & Authentication
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">Essential Cookies</h3>
                  <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    We use essential cookies/tokens for authentication and session management. Disabling them may limit functionality such as login persistence.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-orange-700 dark:text-yellow-400" />
                    Google AdSense & Advertising Cookies
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>SUBG QUIZ</strong> uses <strong>Google AdSense</strong> to display advertisements on our platform. Google AdSense may use cookies and web beacons to serve ads based on your prior visits to this website or other websites on the Internet.
                    </p>
                    <p>
                      <strong>What this means:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Google may collect information about your browsing activity to show you personalized ads</li>
                      <li>Cookies help Google determine which ads to display based on your interests</li>
                      <li>Third-party vendors, including Google, use cookies to serve ads based on your past visits</li>
                      <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites</li>
                    </ul>
                    <p>
                      <strong>Your Privacy Choices:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>
                        You can opt out of personalized advertising by visiting{' '}
                        <a
                          href="https://www.google.com/settings/ads"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-700 dark:text-yellow-400 hover:underline font-semibold"
                        >
                          Google Ads Settings
                        </a>
                      </li>
                      <li>
                        You can also opt out via the{' '}
                        <a
                          href="http://www.aboutads.info/choices/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-700 dark:text-yellow-400 hover:underline font-semibold"
                        >
                          Digital Advertising Alliance
                        </a>
                      </li>
                      <li>European users can visit{' '}
                        <a
                          href="http://www.youronlinechoices.eu/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-700 dark:text-yellow-400 hover:underline font-semibold"
                        >
                          Your Online Choices
                        </a>
                      </li>
                    </ul>
                    <p className="text-xs italic mt-2">
                      Note: Opting out of personalized advertising does not mean you will see fewer ads; it means the ads you see will be less relevant to your interests.
                    </p>
                  </div>
                </div>
              </div>
            </div>


            {/* Eligibility */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <FaUserShield className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  8. Eligibility
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                You must be <strong>14 years or older</strong> to use SUBG QUIZ. By registering, you confirm that you meet this requirement.
              </p>
            </div>

            {/* Changes to This Policy */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <FaInfoCircle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  9. Changes to This Policy
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                We may update this policy to reflect product, legal, or security changes. The updated version will be posted here with a revised date. Continued use of SUBG QUIZ after updates constitutes acceptance of the revised policy.
              </p>
            </div>

            {/* Contact Us */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <FaInfoCircle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  10. Contact Us
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                For privacy questions or requests, please contact: <strong>support@mohdsazidkhan.com</strong>
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <FaLock className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Secure Data</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                Industry-standard encryption and security measures to protect your information.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <FaUserShield className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">No Data Sale</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                We never sell your personal information to third parties for advertising.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Your Control</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                Access, update, or delete your data at any time through your account settings.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-800 dark:to-teal-800 rounded-3xl p-4 md:p-6 lg:p-8">
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                Questions About Privacy?
              </h2>
              <p className="text-md lg:text-xl mb-4 lg:mb-6 opacity-90 text-gray-800 dark:text-white">
                Contact us if you have any privacy concerns or requests
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-white text-gray-700 dark:text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
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

export default PrivacyPolicy;
