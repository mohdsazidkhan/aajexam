import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import config from '../lib/config/appConfig';

const ReferralBanner = ({ user }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const referralCode = user?.referralCode;
  const referralCount = user?.referralCount || 0;

  const message =
    "🔥 Share Your Referral Code & Earn Instant Wallet Money! 💰🔥\n\n" +
    "Invite your friends to AajExam and earn real wallet rewards you can withdraw anytime! 🚀\n\n" +
    "Here's what you earn:\n\n" +
    `💰 ₹${config.QUIZ_CONFIG.REFERRAL_REWARD_PRO} when your friend buys the Pro ₹${config.SUBSCRIPTION_PLANS.PRO.price} subscription (first-time)\n\n` +
    `🎁 Your Referral Code: ${referralCode}\n\n` +
    "🔗 Login / Register on Website:\n\n" +
    "https://aajexam.com/register";

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success('Referral code copied to clipboard!', {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const copyReferralMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Referral message copied to clipboard!', {
      position: "top-center",
      duration: 2000,
    });
  };

  const shareOnWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
  };

  const shareOnTelegram = () => {
    const telegramMessage = encodeURIComponent(message);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${telegramMessage}`, '_blank');
  };

  const getNextMilestone = () => {
    return { target: 10, reward: `₹${config.SUBSCRIPTION_PLANS.PRO.price} PRO plan`, color: 'from-secondary-400 to-secondary-500' };
  };

  const nextMilestone = getNextMilestone();
  const progressPercentage = Math.min((referralCount / nextMilestone.target) * 100, 100);

  return (
    <div className="bg-gradient-to-br from-primary-50 via-primary-50 to-red-50 dark:from-primary-900/20 dark:via-primary-900/20 dark:to-red-900/20 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-primary-200/50 dark:border-primary-400/30 mb-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🎯</div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Earn Free Subscriptions!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 tex-sm lg:text-lg">
          Refer friends and unlock PRO features automatically
        </p>
      </div>

      {/* Progress Section */}
      <div className="bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 mb-6 border border-white/50">
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
            {referralCount}
          </div>
          <div className="text-gray-700 dark:text-gray-300 font-medium">
            Referrals Joined
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Next: {nextMilestone.reward}
            </span>
            <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">
              {referralCount}/{nextMilestone.target}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`bg-gradient-to-r ${nextMilestone.color} h-3 rounded-full transition-all duration-1000 ease-out shadow-lg`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-gradient-to-r from-primary-100 to-primary-100 dark:from-primary-500/25 dark:to-primary-500/25 rounded-2xl p-4 mb-6 border border-primary-200 dark:border-primary-400/30">
        <div className="text-center">
          <h4 className="text-gray-800 dark:text-white font-bold text-lg mb-3 flex items-center justify-center gap-2">
            <span className="text-xl">🔑</span>
            Your Referral Code
          </h4>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-primary-300 to-primary-400 text-gray-900 dark:text-gray-900 font-mono font-bold px-4 py-2 rounded-xl tracking-widest border-2 border-primary-200 dark:border-primary-300 shadow-lg text-lg select-all">
              {referralCode}
            </div>
            <button
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
              onClick={copyReferralCode}
              title="Copy Referral Code"
            >
              <span>📋</span>
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {/* Pro Milestone */}
        <div
          className={`bg-gradient-to-br ${referralCount >= 10
            ? 'from-secondary-400 to-secondary-500 text-white'
            : 'from-gray-200 to-gray-300 text-black dark:from-gray-700 dark:to-gray-600 dark:text-white'
            } rounded-xl p-4 text-center border border-white/50 shadow-lg`}
        >
          <div className="font-bold text-lg mb-1">10 Referrals</div>
          <div className="text-sm opacity-90">₹{config.SUBSCRIPTION_PLANS.PRO.price} PRO</div>
          {referralCount >= 10 && <div className="text-sm font-bold mt-2">✅ Earned</div>}
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          className="w-full bg-gradient-to-r from-green-500 to-secondary-600 hover:from-green-600 hover:to-secondary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <span>📤</span>
          Share Your Code
        </button>

        {showShareOptions && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <button
              onClick={shareOnWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📱</span>
              WhatsApp
            </button>
            <button
              onClick={shareOnTelegram}
              className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>✈️</span>
              Telegram
            </button>
            <button
              onClick={copyReferralMessage}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📋</span>
              Copy Message
            </button>
            <Link
              href="/profile"
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>👤</span>
              View Profile
            </Link>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          💡 <strong>Pro Tip:</strong> Share on social media and WhatsApp groups to reach milestones faster!
        </p>
      </div>
    </div >
  );
};

export default ReferralBanner;

