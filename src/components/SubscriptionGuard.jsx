import Link from 'next/link';
import { hasProSubscription, getSubscriptionStatusTextWithTheme } from '../lib/utils/subscriptionUtils';

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
  if (hasProSubscription()) {
    return children;
  }

  const statusInfo = getSubscriptionStatusTextWithTheme();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Subscription Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
          {message}
        </p>
        
        <div className="mb-4">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <span className="text-lg">{statusInfo.icon}</span>
            <span className={`text-sm font-medium ${statusInfo.textColor}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>

        {showUpgradeButton && (
          <Link
            href="/subscription"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <span className="mr-2">💳</span>
            Upgrade to PRO
          </Link>
        )}

        <div className="mt-4 text-sm text-slate-700 dark:text-gray-400">
          <p>Already have a subscription? <Link href="/subscription" className="text-primary-700 dark:text-primary-500 hover:underline">Check your status</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGuard;


