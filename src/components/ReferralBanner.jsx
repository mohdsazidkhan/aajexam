import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Target, Copy, Share2, Smartphone, Send, User, Lightbulb } from 'lucide-react';
import config from '../lib/config/appConfig';

const ReferralBanner = ({ user }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const referralCode = user?.referralCode;
  const referralCount = user?.referralCount || 0;

  const message =
    "🔥 Invite Your Friends & Earn Cash Rewards! 💰🔥\n\n" +
    "Invite your friends to AajExam and earn real rewards you can withdraw anytime! 🚀\n\n" +
    "Here's what you earn:\n\n" +
    `💰 ₹${config.QUIZ_CONFIG.REFERRAL_REWARD_PRO} when your friend buys the PRO ₹${config.SUBSCRIPTION_PLANS.PRO.price} plan (first-time)\n\n` +
    `ðŸŽ Your Invitation Code: ${referralCode}\n\n` +
    "🔗 Join here:\n\n" +
    "https://aajexam.com/register";

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success('Code copied to clipboard!', {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const copyReferralMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Message copied to clipboard!', {
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


  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-5 lg:p-10 border-2 border-b-8 border-slate-100 dark:border-slate-700 relative overflow-hidden mb-8 font-outfit">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-[2rem] flex items-center justify-center shadow-inner border-2 border-slate-100 dark:border-slate-600 mx-auto mb-6">
          <Target className="w-10 h-10 text-primary-500" />
        </div>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
          Invite <span className="text-primary-700 dark:text-primary-500">& Earn!</span>
        </h3>
        <p className="text-slate-700 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">
          Share with friends and unlock rewards
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 mb-8 border-2 border-slate-100 dark:border-slate-700">
        <div className="text-center">
          <div className="text-5xl font-black text-primary-700 dark:text-primary-500 mb-1">
            {referralCount}
          </div>
          <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em]">
            Friends Joined
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 mb-8 border-2 border-b-8 border-slate-100 dark:border-slate-700 shadow-xl">
        <div className="text-center">
          <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] mb-6">
            Your Invitation Code
          </h4>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-black px-8 py-4 rounded-2xl tracking-[0.3em] border-2 border-slate-200 dark:border-slate-700 shadow-inner text-2xl select-all">
              {referralCode}
            </div>
            <button
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-duo-primary transition-all active:translate-y-1 flex items-center gap-3"
              onClick={copyReferralCode}
            >
              <Copy className="w-5 h-5" />
              Copy
            </button>
          </div>
        </div>
      </div>


      {/* Share Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-widest py-6 px-8 rounded-[1.5rem] shadow-duo-secondary transition-all active:translate-y-1 flex items-center justify-center gap-3"
        >
          <Share2 className="w-5 h-5" />
          Share with Friends
        </button>

        {showShareOptions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <button
              onClick={shareOnWhatsApp}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <Smartphone className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={shareOnTelegram}
              className="bg-[#0088cc] hover:bg-[#0077b5] text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <Send className="w-5 h-5" />
              Telegram
            </button>
            <button
              onClick={copyReferralMessage}
              className="bg-purple-500 hover:bg-purple-600 text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <Copy className="w-5 h-5" />
              Copy Text
            </button>
            <Link
              href="/profile"
              className="bg-slate-700 hover:bg-slate-800 text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 w-full"
            >
              <User className="w-5 h-5" />
              My Profile
            </Link>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700">
        <p className="text-slate-700 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed flex items-center justify-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
          TIP: Share on WhatsApp & Telegram to get rewards faster!
        </p>
      </div>
    </div >
  );
};

export default ReferralBanner;


