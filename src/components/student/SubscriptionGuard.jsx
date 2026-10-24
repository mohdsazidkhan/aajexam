import Link from '@/components/common/AppLink';
import { Lock, Crown } from 'lucide-react';
import { hasProSubscription, getSubscriptionStatusTextWithTheme } from '../../lib/utils/subscriptionUtils';
import useTranslate from '../../hooks/useTranslate';

/**
 * Component that shows subscription prompt for non-subscribed users
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.message - Custom message to show
 * @param {boolean} props.showUpgradeButton - Whether to show upgrade button
 */
const SubscriptionGuard = ({ 
  children, 
  message = "This feature requires a PRO subscription to access.", 
  showUpgradeButton = true 
}) => {
  const { translate } = useTranslate();
  if (hasProSubscription()) {
    return children;
  }

  const statusInfo = getSubscriptionStatusTextWithTheme();
  
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl text-center px-5 py-8 xl:py-12" style={{ borderRadius: 16 }}>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
      <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
      <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
      <Lock className="pointer-events-none absolute right-6 top-4 w-28 h-28 xl:w-40 xl:h-40 text-primary-600/10 dark:text-white/5 rotate-12 -z-10" />

      <div className="relative max-w-xl mx-auto">
        <div className="w-16 h-16 xl:w-20 xl:h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-black shadow-xl rotate-[-4deg]" style={{ borderRadius: 20 }}>
          <Lock className="w-8 h-8 xl:w-10 xl:h-10" />
        </div>
        <h3 className="text-xl xl:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white mb-2">
          {translate('Subscription Required')}
        </h3>
        <p className="text-sm xl:text-base font-semibold text-slate-600 dark:text-white/75 mb-5 max-w-md mx-auto">
          {message}
        </p>

        <div className="border-t border-dashed border-slate-300 dark:border-white/25 pt-5 space-y-4">
          <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <span className="text-lg">{statusInfo.icon}</span>
            <span className={`text-sm font-black uppercase tracking-wide ${statusInfo.textColor}`}>
              {statusInfo.text}
            </span>
          </div>

          {showUpgradeButton && (
            <div>
              <Link
                href="/student/subscription"
                style={{ borderRadius: 14 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-black font-black uppercase tracking-wide text-sm shadow-lg hover:brightness-105 hover:-translate-y-0.5 transition-all"
              >
                <Crown className="w-5 h-5" />
                {translate('Upgrade to PRO')}
              </Link>
            </div>
          )}

          <p className="text-sm font-semibold text-slate-700 dark:text-white/70">Already have a subscription? <Link href="/student/subscription" className="font-black text-primary-700 dark:text-primary-200 hover:underline">{translate('Check your status')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGuard;


