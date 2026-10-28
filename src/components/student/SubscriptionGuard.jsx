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
    <section className="relative isolate overflow-hidden border border-border-primary text-center px-5 py-8 xl:py-12 bg-background-surface" style={{ borderRadius: 16 }}>
      <Lock className="pointer-events-none absolute right-6 top-4 w-28 h-28 xl:w-40 xl:h-40 text-primary-600/10 dark:text-white/5 rotate-12 -z-10" />

      <div className="relative max-w-xl mx-auto">
        <div className="w-16 h-16 xl:w-20 xl:h-20 mx-auto mb-4 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 20 }}>
          <Lock className="w-8 h-8 xl:w-10 xl:h-10" />
        </div>
        <h3 className="text-xl xl:text-3xl font-bold font-outfit tracking-tight text-content-primary mb-2">
          {translate('Subscription Required')}
        </h3>
        <p className="text-sm xl:text-base font-semibold text-content-secondary dark:text-white/75 mb-5 max-w-md mx-auto">
          {message}
        </p>

        <div className="border-t border-dashed border-border-primary pt-5 space-y-4">
          <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <span className="text-lg">{statusInfo.icon}</span>
            <span className={`text-sm font-bold uppercase tracking-wide ${statusInfo.textColor}`}>
              {statusInfo.text}
            </span>
          </div>

          {showUpgradeButton && (
            <div>
              <Link
                href="/student/subscription"
                style={{ borderRadius: 14 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-on-primary font-bold uppercase tracking-wide text-sm hover:brightness-105 hover:-translate-y-0.5 transition-all bg-primary-600"
              >
                <Crown className="w-5 h-5" />
                {translate('Upgrade to PRO')}
              </Link>
            </div>
          )}

          <p className="text-sm font-semibold text-content-secondary dark:text-white/70">Already have a subscription? <Link href="/student/subscription" className="font-bold text-primary-600 hover:underline">{translate('Check your status')}</Link></p>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionGuard;


