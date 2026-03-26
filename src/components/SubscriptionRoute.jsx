import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '../utils/authUtils';
import { hasActiveSubscription } from '../utils/subscriptionUtils';
import { toast } from 'react-hot-toast';

/**
 * Route component that requires active subscription
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.redirectTo - Where to redirect if no subscription (default: '/subscription')
 * @param {boolean} props.showToast - Whether to show error toast (default: true)
 */
const SubscriptionRoute = ({ children, redirectTo = '/subscription', showToast = true }) => {
  const router = useRouter();
  
  // First check if user is authenticated
  if (!isAuthenticated()) {
    router.push('/login');
    return null;
  }

  // Then check if user has active subscription
  if (!hasActiveSubscription()) {
    if (showToast) {
      toast.error('This feature requires an active subscription!');
    }
    router.push(redirectTo);
    return null;
  }

  return children;
};

export default SubscriptionRoute;
