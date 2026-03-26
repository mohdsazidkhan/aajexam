import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaHome,
  FaFire,
  FaUsers,
  FaBookmark,
  FaPlay,
  FaBook,
  FaGamepad,
  FaUsers as FaTeam,
  FaTrophy,
  FaStore,
  FaShoppingCart,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaQuestionCircle,
  FaGraduationCap,
  FaSearch,
  FaBlog,
  FaWallet,
  FaCreditCard,
  FaUserFriends,
  FaUserPlus,
  FaHistory,
  FaCrown,
  FaEdit,
  FaPlusCircle,
  FaRupeeSign,
  FaChartLine,
} from 'react-icons/fa';
import { toggleSidebar } from '../lib/store/sidebarSlice';
import { secureLogout, getCurrentUser, isAuthenticated } from '../lib/utils/authUtils';
import { useSSR } from '../hooks/useSSR';
import { hasActiveSubscription } from '../lib/utils/subscriptionUtils';
import { toast } from 'react-toastify';
import API from '../lib/api';
import { useRef } from 'react';

const StudentSidebar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const [walletBalance, setWalletBalance] = useState(0);
  const [claimableRewards, setClaimableRewards] = useState(0);
  const fetchRef = useRef(false);

  useEffect(() => {
    const fetchWallet = async () => {
      if (authenticated && isMounted) {
        try {
          const res = await API.getWalletData();
          if (res && res.success && res.data) {
            setWalletBalance(res.data.walletBalance || 0);
            setClaimableRewards(res.data.claimableRewards || 0);
          }
        } catch (err) {
          console.error('Error fetching wallet in sidebar:', err);
        }
      }
    };

    if (authenticated && isMounted && !fetchRef.current) {
      fetchRef.current = true;
      fetchWallet();
    }
  }, [authenticated, isMounted]);

  // Menu expansion states
  const [expandedMenus, setExpandedMenus] = useState({
    games: false,
    groups: false,
    teams: false,
    tournaments: false,
    marketplace: false,
    profile: false,
    shop: false,
    blogs: false,
  });

  useEffect(() => {
    // Auto-expand menus based on current route
    if (router?.pathname) {
      if (router.pathname.startsWith('/home')) {
        setExpandedMenus(prev => ({ ...prev, games: false }));
      }
    }
  }, [router?.pathname]);

  if (!isMounted) {
    return null;
  }

  // Don't show sidebar if user is not authenticated
  if (!authenticated || !user) {
    return null;
  }

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActiveRoute = (path) => {
    if (!router?.pathname) return false;
    if (path === '/home') {
      return router.pathname === '/home' || router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  const getActiveClass = (path) => {
    const baseClass = "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200";
    if (isActiveRoute(path)) {
      return `${baseClass} bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-md`;
    }
    return `${baseClass} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`;
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      dispatch(toggleSidebar());
    }
  };

  const handleLogout = () => {
    secureLogout(router);
  };

  // Get profile children dynamically based on user's username
  const getProfileChildren = () => {
    const username = user?.username;
    const children = [
      { path: '/profile', label: 'My Profile' },
      { path: '/pro/quizzes/mine', label: 'My Quizzes' },
      { path: '/pro/questions/mine', label: 'My Questions' },
      { path: '/pro/my-blogs', label: 'My Blogs' },
    ];

    // Add followers and followings if username exists
    if (username) {
      children.push(
        { path: `/profile/${username}/followers`, label: 'My Followers' },
        { path: `/profile/${username}/following`, label: 'My Followings' }
      );
    }

    // Add Exam History
    children.push({ path: '/exam-history', label: 'Exams History' });
    children.push({ path: '/quiz-history', label: 'Quizzes History' });

    // Add existing items
    children.push(
      { path: '/settings', label: 'Settings' }
    );

    return children;
  };

  // Student-related routes organized into logical sections - User-friendly order
  const sidebarSections = [
    {
      title: 'Quick Access',
      items: [
        { path: '/home', icon: FaHome, label: 'Home', hasChildren: false },
        { path: '/search', icon: FaSearch, label: 'Search', hasChildren: false },
      ]
    },
    {
      title: 'Learn & Practice',
      items: [
        { path: '/questions/public', icon: FaQuestionCircle, label: 'Questions', hasChildren: false },
        { path: '/articles', icon: FaBlog, label: 'Articles', hasChildren: false },
        { path: '/govt-exams', icon: FaGraduationCap, label: 'Govt Exams', hasChildren: false },
        { path: '/quiz-levels', icon: FaBook, label: 'My Levels', hasChildren: false },
      ]
    },
    {
      title: 'Compete & Win',
      items: [
        { path: '/leaderboard', icon: FaCrown, label: 'Leaderboard', hasChildren: false },
        { path: '/monthly-winners', icon: FaTrophy, label: 'Winners', hasChildren: false },
        { path: '/rewards', icon: FaTrophy, label: 'Rewards', hasChildren: false },
      ]
    },
    {
      title: 'Create & Share',
      items: [
        { path: '/pro/questions/new', icon: FaPlusCircle, label: 'Post Question', hasChildren: false },
        { path: '/pro/quiz/create', icon: FaEdit, label: 'Post Quiz', hasChildren: false },
        {
          path: '/pro/create-blog',
          icon: FaBlog,
          label: 'Post Blog',
          hasChildren: false,
        },
      ]
    },
    {
      title: 'My Account',
      items: [
        {
          path: '/profile',
          icon: FaUser,
          label: 'My Profile',
          hasChildren: true,
          getChildren: getProfileChildren,
        },
        { path: '/pro/wallet', icon: FaWallet, label: 'My Wallet', hasChildren: false },
        { path: '/subscription', icon: FaCreditCard, label: 'Subscription', hasChildren: false },
      ]
    },
    {
      title: 'My Earnings',
      items: [
        { path: '/my-analytics', icon: FaChartLine, label: 'My Analytics', hasChildren: false },
        { path: '/pro/user-quiz-rewards', icon: FaTrophy, label: 'Quiz Rewards', hasChildren: false },
        { path: '/pro/question-rewards-history', icon: FaQuestionCircle, label: 'Question Rewards', hasChildren: false },
        { path: '/pro/blog-rewards-history', icon: FaBlog, label: 'Blog Rewards', hasChildren: false },
        { path: '/referral-history', icon: FaHistory, label: 'Referral Rewards', hasChildren: false },
      ]
    },
    {
      title: 'Help & Support',
      items: [
        { path: '/contact', icon: FaUser, label: 'Contact Us', hasChildren: false },
      ]
    },
  ];

  return (
    <div className={`student-sidebar bg-white dark:bg-gray-900 text-gray-900 dark:text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col h-full shadow-lg relative`}>

      {/* Navigation Links - Scrollable on mobile, with bottom padding on desktop for fixed user section */}
      <nav className="flex-1 overflow-y-auto py-4 md:pb-10">
        <div className="space-y-4 px-2">
          {sidebarSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1">
              {/* Section Header */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>

              {/* Section Items */}
              {section.items.map((item, itemIndex) => {
                // Skip items that require Pro ₹99 if user doesn't have it
                if (item.requiresPro99 && !hasPro99Plan()) {
                  return null;
                }

                const Icon = item.icon;
                // Get children from either static children array or dynamic getChildren function
                const children = item.getChildren ? item.getChildren() : item.children;
                const hasChildren = item.hasChildren && children && children.length > 0;
                const isExpanded = expandedMenus[item.label.toLowerCase().replace(/\s+/g, '')] || false;

                return (
                  <div key={itemIndex}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => toggleMenu(item.label.toLowerCase().replace(/\s+/g, ''))}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${isActiveRoute(item.path)
                            ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="text-lg" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {isExpanded ? (
                            <FaChevronDown className="text-sm" />
                          ) : (
                            <FaChevronRight className="text-sm" />
                          )}
                        </button>
                        {isExpanded && children && (
                          <div className="ml-6 mt-1 space-y-1">
                            {children.map((child, childIndex) => (
                              <Link
                                key={childIndex}
                                href={child.path}
                                onClick={handleNavClick}
                                className={`block px-3 py-2 rounded-lg transition-all duration-200 ${isActiveRoute(child.path)
                                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 font-medium'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={(e) => {
                          // Validate Pro ₹99 plan for Post Blog
                          if (item.requiresPro99 && !hasPro99Plan()) {
                            e.preventDefault();
                            toast.error('Only Pro ₹99 users can create blogs. Upgrade now to start earning rewards.');
                            router.push('/subscription');
                            return;
                          }
                          handleNavClick();
                        }}
                        className={getActiveClass(item.path)}
                      >
                        <Icon className="text-lg" />
                        <span className="font-medium flex-1">{item.label}</span>
                        {item.path === '/pro/wallet' && walletBalance > 0 && (
                          <span className="ml-2 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-bold">
                            ₹{walletBalance.toLocaleString()}
                          </span>
                        )}
                        {item.path === '/rewards' && claimableRewards > 0 && (
                          <span className="ml-2 text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-600 px-2 py-0.5 rounded-full font-bold">
                            ₹{claimableRewards.toLocaleString()}
                          </span>
                        )}
                        {item.requiresPro99 && (
                          <span className="ml-2 text-xs bg-yellow-300 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                            Pro
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Section - Scrollable on mobile (inside nav), will be hidden on desktop */}
        {user && (
          <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700 md:hidden">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.name || 'Student'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || 'support@mohdsazidkhan.com'}
                </p>
                {walletBalance > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400">
                    <FaWallet className="text-[8px]" />
                    <span>₹{walletBalance.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 text-white text-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
            >
              <FaSignOutAlt className="text-lg" /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* User Section - Fixed at bottom on desktop only */}
      {user && (
        <div className="hidden md:block p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 text-white text-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
          >
            <FaSignOutAlt className="text-lg" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentSidebar;