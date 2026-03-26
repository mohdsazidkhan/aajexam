import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  isTokenExpired, 
  isTokenExpiringSoon, 
  getTimeUntilExpiration,
  handleTokenExpiration 
} from '../lib/utils/tokenUtils';
import { safeLocalStorage } from '../lib/utils/storage';

export const useTokenValidation = () => {
  const router = useRouter();

  // Check if token is valid
  const checkToken = useCallback(() => {
    const token = safeLocalStorage.getItem('token');
    
    if (!token) {
      handleTokenExpiration();
      return false;
    }
    
    if (isTokenExpired(token)) {
      console.log('Token expired, logging out user');
      handleTokenExpiration();
      return false;
    }
    
    return true;
  }, []);

  // Check if token expires soon
  const checkTokenExpiringSoon = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (!token) return false;
    
    if (isTokenExpiringSoon(token)) {
      const timeLeft = getTimeUntilExpiration(token);
      const minutesLeft = Math.floor(timeLeft / 60);
      
      // Show warning if expires within 5 minutes
      if (minutesLeft <= 5) {
        // You can show a toast notification here
        console.warn(`Session expires in ${minutesLeft} minutes`);
        
        // Optionally show a modal or notification
        if (minutesLeft <= 1) {
          // Show urgent warning
          alert(`⚠️ Your session will expire in ${minutesLeft} minute(s). Please save your work and login again.`);
        }
      }
      
      return true;
    }
    
    return false;
  }, []);

  // Validate token before making API calls
  const validateTokenBeforeRequest = useCallback(() => {
    if (!checkToken()) {
      return false;
    }
    
    // Check if expiring soon
    checkTokenExpiringSoon();
    
    return true;
  }, [checkToken, checkTokenExpiringSoon]);

  // Set up periodic token checking
  useEffect(() => {
    // Check immediately
    checkToken();
    
    // Check every 30 seconds
    const interval = setInterval(() => {
      checkToken();
      checkTokenExpiringSoon();
    }, 30000);
    
    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkToken();
        checkTokenExpiringSoon();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkToken, checkTokenExpiringSoon]);

  return {
    checkToken,
    checkTokenExpiringSoon,
    validateTokenBeforeRequest,
    isTokenValid: checkToken()
  };
};

