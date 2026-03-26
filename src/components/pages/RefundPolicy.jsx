'use client';

import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaCreditCard, FaBan, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaGift, FaShieldAlt, FaClock } from 'react-icons/fa';

import MobileAppWrapper from '../MobileAppWrapper';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';

const RefundPolicy = () => {
  const router = useRouter();

  return (
    <MobileAppWrapper title="Refund Policy">
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
        <div className="container mx-auto px-4 lg:px-10 py-8 mt-0">

          {/* Hero Section */}
          <div className="text-center mb-4 lg:mb-12">
            <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaMoneyBillWave className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-bold bg-gradient-to-r from-primary-600 via-red-600 to-primary-700 bg-clip-text text-transparent mb-4">
              Refund & Subscription Policy
            </h1>
            <p className="text-md lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Please read this policy carefully before subscribing or purchasing any plan
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6 lg:space-y-8 mb-8 lg:mb-12">
            {/* Introduction */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-secondary-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <FaInfoCircle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  Introduction
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                Thank you for using <strong>AajExam</strong>. Please read this Refund & Subscription Policy carefully. By subscribing or purchasing any plan, you agree to the terms below.
              </p>
            </div>

            {/* General Policy */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <FaBan className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  1. General Policy
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    All subscription purchases are <strong>final and non‑refundable</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-secondary-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Subscriptions provide access to content and features for a fixed duration. Access is not contingent on performance, leaderboard position, or rewards outcomes.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    AajExam is a <strong>skill‑based</strong> platform. Fees are charged for access to premium content/features, not for winning rewards.
                  </p>
                </div>
              </div>
            </div>

            {/* Subscriptions */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-primary-500 rounded-2xl flex items-center justify-center">
                  <FaCreditCard className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  2. Subscriptions
                </h2>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-secondary-600 dark:text-secondary-400" />
                    Plan Access
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Each plan grants access to specific levels/features as shown on the subscription page.</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaClock className="text-green-600 dark:text-green-400" />
                    Validity
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Plans are prepaid and remain active until their stated expiry date.</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 from-red-100 dark:from-purple-900/30 dark:from-red-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-primary-600 dark:text-primary-400" />
                    Renewals
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">If auto‑renewal is enabled on your account or payment method, the plan may renew automatically at the then‑current price. You can disable renewal any time before the next billing date from your account or payment provider.</p>
                </div>
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl p-4 border border-primary-200 dark:border-primary-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-primary-600 dark:text-primary-400" />
                    Upgrades
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">If supported, upgrades may take effect immediately; the new plan price applies. No pro‑rated refunds for the remaining period of the previous plan.</p>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-pink-100 dark:from-red-900/30 dark:to-pink-800/30 rounded-xl p-4 border border-red-200 dark:border-red-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    <FaExclamationTriangle className="text-primary-600 dark:text-red-400" />
                    Downgrades/Cancellations
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Downgrades or cancellations apply from the next cycle. We do not provide partial/remaining‑period refunds.</p>
                </div>
              </div>
            </div>

            {/* Payments & Invoicing */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 from-red-500 rounded-2xl flex items-center justify-center">
                  <FaCreditCard className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  3. Payments & Invoicing
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Processors:</strong> Payments are handled securely via trusted third‑party processors (e.g., PAYU). We do not store full card/UPI details.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-primary-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Failed/Declined Payments:</strong> If a payment fails or is declined, access to premium features may be paused until the payment is completed successfully.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-secondary-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Taxes/Fees:</strong> Prices may be subject to applicable taxes/charges as per law.
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Eligibility */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <FaCheckCircle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  4. Refund Eligibility (Exceptional Cases Only)
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                While plans are non‑refundable, we may review limited cases such as:
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Duplicate Charge:</strong> You were charged more than once for the same order.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Technical Failure:</strong> A verified payment was made but your subscription did not activate and we are unable to provision access within a reasonable time.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  To request a review, contact us within <strong>7 days</strong> of the transaction with order ID, payment proof, and account details. Approved cases (if any) are refunded to the original payment method within standard banking timelines.
                </p>
              </div>
            </div>

            {/* Challenge Rewards & Refunds */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                  <FaGift className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  5. Challenge Rewards & Refunds
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Daily, Weekly, and Monthly challenge rewards are <strong>not purchases</strong> and are <strong>not refundable</strong>. They are prizes based on performance, leaderboard position, and eligibility.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Rewards System:</strong> Eligible users win from diverse dynamic prize pools. Eligibility is strictly based on performance during the specific challenge timeframe you are participating in.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-secondary-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Challenge rewards are processed at the end of each respective period and stats reset. Previous period achievements do not carry forward.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-primary-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Withdrawals (if enabled) may require bank details/KYC verification to comply with regulations.
                  </p>
                </div>
              </div>
            </div>

            {/* Chargebacks & Disputes */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <FaExclamationTriangle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  6. Chargebacks & Disputes
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Unauthorized or fraudulent transactions should be reported promptly to both us and your payment provider.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-primary-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Filing a chargeback after successfully receiving plan access may result in account restrictions and recovery actions as per our Terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Responsible Play & Eligibility */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-secondary-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <FaShieldAlt className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  7. Responsible Play & Eligibility
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-secondary-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    AajExam is a <strong>skill‑based</strong> platform. There is no gambling or chance involved.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    You must be <strong>14 years or older</strong> to register and play.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Us */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <FaInfoCircle className="text-white text-md lg:text-2xl" />
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  8. Contact Us
                </h2>
              </div>
              <p className="text-md lg:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                Need help with a payment or subscription? Contact <strong>support@mohdsazidkhan.com</strong> with your registered email/phone and order details.
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-primary-100 to-red-100 dark:from-primary-900/30 dark:to-red-900/30 rounded-3xl shadow-xl p-4 md:p-6 lg:p-8 border border-primary-200 dark:border-primary-700 mb-8 lg:mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Important Reminder
                </h3>
                <p className="text-md lg:text-lg text-gray-700 dark:text-gray-300">
                  All subscription purchases are <strong>final and non-refundable</strong>. Please ensure you understand the terms before making a purchase. AajExam is a skill-based platform where fees are charged for access to premium content and features, not for winning rewards.
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
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Secure Payments</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                All payments are processed securely through trusted third-party processors.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-4">
                <FaInfoCircle className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Clear Terms</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                All refund and subscription policies are clearly defined and transparent.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-2">Fair Policy</h3>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">
                We review exceptional cases fairly and provide support when needed.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary-100 to-red-100 dark:from-primary-800 dark:to-red-800 rounded-3xl p-4 md:p-6 lg:p-8">
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                Need Help with Payments?
              </h2>
              <p className="text-md lg:text-xl mb-4 lg:mb-6 opacity-90 text-gray-800 dark:text-white">
                Contact our support team for assistance with subscriptions or refund requests
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-white text-gray-700 dark:text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Contact Support
              </button>
            </div>
          </div>

        </div>
      </div>
      <UnifiedFooter />
    </MobileAppWrapper>
  );
};

export default RefundPolicy;
