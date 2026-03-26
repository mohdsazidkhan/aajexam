/**
 * Authentication Helper Functions
 * Handles authentication checks and redirects for public pages
 */

/**
 * Check if user is authenticated and redirect to login if needed
 * @param {Object} router - Next.js router instance
 * @param {string} redirectPath - Path to redirect back to after login
 * @returns {boolean} - True if authenticated, false if redirected to login
 */
export const requireAuthForAction = (router, redirectPath) => {
    if (typeof window === 'undefined') {
        // Server-side - can't check localStorage
        return false;
    }

    const token = localStorage.getItem('token');

    if (!token) {
        // Not logged in - redirect to login with return URL
        const encodedRedirect = encodeURIComponent(redirectPath);
        router.push(`/login?redirect=${encodedRedirect}`);
        return false;
    }

    return true;
};

/**
 * Check if user is currently authenticated (client-side only)
 * @returns {boolean} - True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    const token = localStorage.getItem('token');
    return !!token;
};

/**
 * Get authentication token
 * @returns {string|null} - Token if authenticated, null otherwise
 */
export const getAuthToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem('token');
};

/**
 * Higher-order function to protect actions that require authentication
 * @param {Function} action - The action to execute if authenticated
 * @param {Object} router - Next.js router instance
 * @param {string} redirectPath - Path to redirect back to after login
 * @returns {Function} - Wrapped function that checks auth before executing
 */
export const withAuth = (action, router, redirectPath) => {
    return (...args) => {
        if (requireAuthForAction(router, redirectPath)) {
            return action(...args);
        }
    };
};

/**
 * Get user data from localStorage
 * @returns {Object|null} - User object if authenticated, null otherwise
 */
export const getUser = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

/**
 * Check if user has a specific subscription level
 * @param {string} requiredLevel - Required subscription level
 * @returns {boolean} - True if user has required level or higher
 */
export const hasSubscription = (requiredLevel) => {
    const user = getUser();
    if (!user) return false;

    const levels = {
        'free': 0,
        'basic': 1,
        'premium': 2,
        'pro': 3,
        'admin': 4
    };

    const userLevel = levels[user.subscriptionStatus] || 0;
    const required = levels[requiredLevel] || 0;

    return userLevel >= required;
};
