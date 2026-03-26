import { jwtDecode } from 'jwt-decode'

export const isTokenValid = () => {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('token')
  if (!token) return false

  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    
    return decoded.exp > currentTime
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

export const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const setToken = (token) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('token', token)
}

export const removeToken = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
}

export const getUserId = () => {
  if (typeof window === 'undefined') return null
  
  const token = getToken()
  if (!token) return null

  try {
    const decoded = jwtDecode(token)
    return decoded.userId
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const getUserRole = () => {
  if (typeof window === 'undefined') return null
  
  const token = getToken()
  if (!token) return null

  try {
    const decoded = jwtDecode(token)
    return decoded.role
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const isAdmin = () => {
  const role = getUserRole()
  return role === 'admin'
}

export const hasAdminPrivileges = () => {
  if (typeof window === 'undefined') return false
  
  const token = getToken()
  if (!token) return false

  try {
    const decoded = jwtDecode(token)
    return decoded.role === 'admin' && decoded.adminPrivileges === true
  } catch (error) {
    console.error('Error checking admin privileges:', error)
    return false
  }
}

export const isStudent = () => {
  const role = getUserRole()
  return role === 'student'
}

export const isAuthenticated = () => {
  return isTokenValid()
}

export const logout = () => {
  removeToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

/**
 * Secure logout function that clears all sensitive data
 * @param {Object} router - Next.js router object
 * @param {boolean} showToast - Whether to show logout success toast
 * @param {boolean} shouldReload - Whether to reload the page (default: true)
 */
export const secureLogout = (router, showToast = true, shouldReload = true) => {
  try {
    // Clear all sensitive data from localStorage
    const sensitiveKeys = [
      'userInfo',
      'token',
      'refreshToken',
      'authToken',
      'sessionToken',
      'userData',
      'authData'
    ];

    // Remove specific sensitive keys
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Also clear any other potential auth-related keys
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('user') ||
          key.toLowerCase().includes('session')) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage as well
    sessionStorage.clear();

    // Show success message
    if (showToast) {
      // You can add toast notification here if needed
      console.log('Logged out successfully!');
    }

    // Navigate to login page instead of reloading
    if (router) {
      router.push('/login');
    } else if (shouldReload) {
      // Fallback: only reload if router is not provided
      window.location.href = '/login';
    }

  } catch (error) {
    console.error('Error during logout:', error);
    // You can add error toast here if needed
    console.error('Error during logout. Please try again.');
  }
};

/**
 * Get current user info
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return null;
    
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

/**
 * Get auth token
 * @returns {string|null}
 */
export const getAuthToken = () => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('token');
};

/**
 * Handle API errors and auto-logout on auth errors
 * @param {Error} error - API error
 * @param {Object} router - Next.js router object
 */
export const handleAuthError = (error, router) => {
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    console.error('Session expired. Please login again.');
    secureLogout(router, false);
  }
};
