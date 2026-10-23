import React, { useState } from 'react';
import Link from '@/components/common/AppLink';
import { toast } from 'react-hot-toast';
import { Gift, Copy, Share2, Smartphone, Send, User, Lightbulb, Users, Wallet, UserPlus, Sparkles } from 'lucide-react';
import config from '../../lib/config/appConfig';
import useTranslate from '../../hooks/useTranslate';

// "Invite & Earn" gift voucher: the code sits in a dashed coupon box and the friends-joined
// counter lives on a perforated stub. Radii are inline (not `rounded-*`) on purpose —
// styles/index.css forces every [class*="rounded"] to a flat 8px with !important.
const ReferralBanner = ({ user }) => {
  const { translate, rich } = useTranslate();
  const [showShareOptions, setShowShareOptions] = useState(false);

  const referralCode = user?.referralCode;
  const referralCount = user?.referralCount || 0;

  const message =
    "🔥 Invite Your Friends & Earn Cash Rewards! 💰🔥\n\n" +
    "Invite your friends to AajExam and earn real rewards you can withdraw anytime! 🚀\n\n" +
    "Here's what you earn:\n\n" +
    `💰 ₹${config.QUIZ_CONFIG.REFERRAL_REWARD_PRO} when your friend buys a PRO plan (first-time)\n\n` +
    `🎁 Your Invitation Code: ${referralCode}\n\n` +
    "🔗 Join here:\n\n" +
    "https://aajexam.com/register";

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success(translate('Code copied to clipboard!'), {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const copyReferralMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success(translate('Message copied to clipboard!'), {
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

  const steps = [
    { icon: Share2, label: 'Share your code' },
    { icon: UserPlus, label: 'Friend signs up' },
    { icon: Wallet, label: 'You earn rewards' },
  ];

  const optionBtn = 'flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-primary-50 ring-1 ring-primary-200 text-primary-700 dark:bg-white/15 dark:hover:bg-white/25 dark:ring-white/30 dark:text-white text-xs font-black uppercase tracking-widest transition-colors';

  return (
    <section
      className="relative overflow-hidden mb-8 font-outfit text-slate-900 dark:text-white shadow-xl ring-1 ring-primary-200 dark:ring-white/10 bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-primary-600 dark:via-primary-700 dark:to-primary-900"
      style={{ borderRadius: 16 }}
    >
      {/* Decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
      <div className="pointer-events-none absolute -bottom-28 right-24 w-80 h-80 bg-primary-300/15 blur-3xl" style={{ borderRadius: '50%' }} />
      <Gift className="pointer-events-none absolute right-4 top-3 w-36 h-36 text-primary-600/10 dark:text-white/5 rotate-12" />

      <div className="relative grid grid-cols-1 xl:grid-cols-[1fr_240px]">
        {/* Voucher body */}
        <div className="p-5 xl:p-8 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3 xl:gap-4">
            <div className="shrink-0 w-12 h-12 xl:w-14 xl:h-14 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-500 dark:from-primary-200 dark:to-primary-400 text-primary-950 shadow-lg rotate-[-6deg]" style={{ borderRadius: 12 }}>
              <Gift className="w-6 h-6 xl:w-7 xl:h-7" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl md:text-2xl xl:text-3xl font-black uppercase tracking-tight leading-none">
                {rich('Invite <0>& Earn!</0>', [(c) => <span className="text-primary-600 dark:text-primary-300">{c}</span>])}
              </h3>
              <p className="mt-1.5 text-[11px] xl:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-white/75">
                {translate('Share with friends and unlock rewards')}
              </p>
            </div>
          </div>

          {/* Reward pill */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-primary-950 px-3 py-1.5 text-xs font-black shadow-[0_4px_18px_rgba(251,191,36,0.4)]" style={{ borderRadius: 999 }}>
            <Sparkles className="w-4 h-4 shrink-0" />
            {translate('Earn ₹{amount} when your friend buys a PRO plan', { amount: config.QUIZ_CONFIG.REFERRAL_REWARD_PRO })}
          </div>

          {/* Coupon: dashed box with the code */}
          <div className="bg-white/70 dark:bg-black/20 border-2 border-dashed border-primary-400 dark:border-white/45 p-3 xl:p-4" style={{ borderRadius: 12 }}>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-600 dark:text-white/70 mb-2">{translate('Your Invitation Code')}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0 font-mono font-black text-2xl xl:text-3xl tracking-[0.3em] text-primary-700 dark:text-primary-200 select-all truncate">
                {referralCode}
              </div>
              <button
                className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 dark:bg-white dark:text-primary-700 dark:hover:bg-primary-100 font-black uppercase tracking-widest text-xs shadow-lg transition-all active:translate-y-0.5"
                onClick={copyReferralCode}
              >
                <Copy className="w-4 h-4" />
                {translate('Copy')}
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-3 gap-2">
            {steps.map((st, i) => (
              <div key={st.label} className="flex flex-col items-center text-center gap-1.5 bg-white/80 ring-1 ring-primary-200 dark:bg-white/10 dark:ring-white/15 px-2 py-3" style={{ borderRadius: 10 }}>
                <div className="relative w-9 h-9 flex items-center justify-center bg-primary-500/10 text-primary-700 dark:bg-white/15 dark:text-white" style={{ borderRadius: 10 }}>
                  <st.icon className="w-4 h-4" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-primary-300 text-primary-950 text-[9px] font-black" style={{ borderRadius: '50%' }}>{i + 1}</span>
                </div>
                <p className="text-[9px] xl:text-[10px] font-black uppercase tracking-wider leading-tight text-slate-700 dark:text-white/90">{translate(st.label)}</p>
              </div>
            ))}
          </div>

          {/* Share */}
          <div className="space-y-3">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-primary-950 font-black uppercase tracking-widest text-sm shadow-lg hover:brightness-105 transition-all active:translate-y-0.5"
            >
              <Share2 className="w-5 h-5" />
              {translate('Share with Friends')}
            </button>

            {showShareOptions && (
              <div className="grid grid-cols-2 gap-2 animate-fade-in">
                <button onClick={shareOnWhatsApp} className={optionBtn}>
                  <Smartphone className="w-4 h-4" /> {translate('WhatsApp')}
                </button>
                <button onClick={shareOnTelegram} className={optionBtn}>
                  <Send className="w-4 h-4" /> {translate('Telegram')}
                </button>
                <button onClick={copyReferralMessage} className={optionBtn}>
                  <Copy className="w-4 h-4" /> {translate('Copy Text')}
                </button>
                <Link href="/student/profile" className={optionBtn}>
                  <User className="w-4 h-4" /> {translate('My Profile')}
                </Link>
              </div>
            )}
          </div>

          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] leading-relaxed text-slate-600 dark:text-white/70">
            <Lightbulb className="w-4 h-4 text-primary-600 dark:text-primary-300 shrink-0" />
            {translate('TIP: Share on WhatsApp & Telegram to get rewards faster!')}
          </p>
        </div>

        {/* Perforated stub: friends joined */}
        <div className="relative p-5 xl:p-6 bg-primary-600/5 dark:bg-black/20 border-t border-dashed border-primary-300 dark:border-white/35 xl:border-t-0 xl:border-l flex xl:flex-col items-center justify-center gap-4 xl:gap-2 text-center">
          <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
          <span className="xl:hidden absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />
          <span className="hidden xl:block absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-background-page" style={{ borderRadius: '50%' }} />

          <div className="w-12 h-12 flex items-center justify-center bg-white ring-1 ring-primary-200 text-primary-700 dark:bg-white/15 dark:ring-white/25 dark:text-white" style={{ borderRadius: 12 }}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-5xl xl:text-6xl font-black font-outfit leading-none text-primary-700 dark:text-primary-200">{referralCount}</div>
            <div className="mt-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 dark:text-white/75">{translate('Friends Joined')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralBanner;
