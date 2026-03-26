import { getCurrentUser } from './authUtils';

// Admin role constants
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Admin permissions
export const ADMIN_PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_QUIZZES: 'manage_quizzes',
  MANAGE_CATEGORIES: 'manage_categories',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  MANAGE_REWARDS: 'manage_rewards',
  MANAGE_PAYMENTS: 'manage_payments',
  MANAGE_SYSTEM: 'manage_system'
};

// Check if user is admin
export const isAdmin = () => {
    const user = getCurrentUser();
  return user && user.role && [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN].includes(user.role);
};

// Check if user has admin privileges
export const hasAdminPrivileges = () => {
  const user = getCurrentUser();
  return user && user.role && Object.values(ADMIN_ROLES).includes(user.role);
};
    
// Check if user has specific admin permission
export const hasAdminPermission = (permission) => {
    const user = getCurrentUser();
  
  if (!user || !user.role) return false;
  
  // Super admin has all permissions
  if (user.role === ADMIN_ROLES.SUPER_ADMIN) return true;
  
  // Check user's specific permissions
  if (user.permissions && user.permissions.includes(permission)) return true;
  
  // Default permissions based on role
  switch (user.role) {
    case ADMIN_ROLES.ADMIN:
      return [
        ADMIN_PERMISSIONS.MANAGE_USERS,
        ADMIN_PERMISSIONS.MANAGE_QUIZZES,
        ADMIN_PERMISSIONS.MANAGE_CATEGORIES,
        ADMIN_PERMISSIONS.VIEW_ANALYTICS,
        ADMIN_PERMISSIONS.MANAGE_SUBSCRIPTIONS,
        ADMIN_PERMISSIONS.MANAGE_REWARDS,
        ADMIN_PERMISSIONS.MANAGE_PAYMENTS
      ].includes(permission);
    
    case ADMIN_ROLES.MODERATOR:
      return [
        ADMIN_PERMISSIONS.MANAGE_QUIZZES,
        ADMIN_PERMISSIONS.MANAGE_CATEGORIES,
        ADMIN_PERMISSIONS.VIEW_ANALYTICS
      ].includes(permission);
    
    default:
    return false;
  }
};

// Get admin role display name
export const getAdminRoleDisplayName = (role) => {
  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      return 'Super Admin';
    case ADMIN_ROLES.ADMIN:
      return 'Admin';
    case ADMIN_ROLES.MODERATOR:
      return 'Moderator';
    default:
      return 'User';
  }
};

// Get admin role color
export const getAdminRoleColor = (role) => {
  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    case ADMIN_ROLES.ADMIN:
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    case ADMIN_ROLES.MODERATOR:
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  }
};

// Log admin action
export const logAdminAction = (action, details = {}) => {
    const user = getCurrentUser();
  
  if (!user || !hasAdminPrivileges()) {
    console.warn('Attempted to log admin action without admin privileges');
    return;
  }

  const logData = {
    adminId: user.id,
    adminUsername: user.username,
      action,
      details,
    timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    ip: null // This would be set by the backend
  };

  // In a real application, you would send this to your logging service
  console.log('Admin Action:', logData);
  
  // You could also send this to your backend for persistent logging
  // API.post('/api/admin/logs', logData).catch(console.error);
};

// Validate admin access to resource
export const validateAdminAccess = (resource, action = 'read') => {
  const permission = `${action}_${resource}`;
  return hasAdminPermission(permission);
};

// Get admin dashboard stats permissions
export const getAdminStatsPermissions = () => {
  return {
    canViewUserStats: hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_USERS),
    canViewQuizStats: hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_QUIZZES),
    canViewPaymentStats: hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_PAYMENTS),
    canViewSystemStats: hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_SYSTEM)
  };
};

// Format admin action for display
export const formatAdminAction = (action, details = {}) => {
  const actionMap = {
    create_user: 'Created user account',
    update_user: 'Updated user account',
    delete_user: 'Deleted user account',
    ban_user: 'Banned user account',
    unban_user: 'Unbanned user account',
    create_quiz: 'Created quiz',
    update_quiz: 'Updated quiz',
    delete_quiz: 'Deleted quiz',
    create_category: 'Created category',
    update_category: 'Updated category',
    delete_category: 'Deleted category',
    update_subscription: 'Updated subscription',
    process_payment: 'Processed payment',
    update_system_settings: 'Updated system settings'
  };

  let formatted = actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  if (details.username) {
    formatted += ` (${details.username})`;
  }
  
  if (details.resourceId) {
    formatted += ` [ID: ${details.resourceId}]`;
  }

  return formatted;
};

// Admin navigation items based on permissions
export const getAdminNavigationItems = () => {
  const items = [];

  if (hasAdminPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
    items.push({
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: 'MdDashboard'
    });
  }

  if (hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_USERS)) {
    items.push({
      name: 'Users',
      href: '/admin/users',
      icon: 'MdPeople'
    });
  }

  if (hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_QUIZZES)) {
    items.push({
      name: 'Quizzes',
      href: '/admin/quizzes',
      icon: 'MdQuiz'
    });
  }

  if (hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_CATEGORIES)) {
    items.push({
      name: 'Categories',
      href: '/admin/categories',
      icon: 'MdCategory'
    });
  }

  if (hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_SUBSCRIPTIONS)) {
    items.push({
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: 'MdAccountBalance'
    });
  }

  if (hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_REWARDS)) {
    items.push({
      name: 'Rewards',
      href: '/admin/rewards',
      icon: 'MdCardGiftcard'
    });
  }

  if (hasAdminPermission(ADMIN_PERMISSIONS.MANAGE_PAYMENTS)) {
    items.push({
      name: 'Payments',
      href: '/admin/payments',
      icon: 'MdPayment'
    });
  }

  if (hasAdminPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
    items.push({
      name: 'Analytics',
      href: '/admin/analytics',
      icon: 'MdAnalytics'
    });
  }

  return items;
};