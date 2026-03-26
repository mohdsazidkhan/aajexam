import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { useClientSide, useAuthStatus } from '../hooks/useClientSide';
import {
  FaSun,
  FaMoon,
  FaCreditCard,
  FaCalendarAlt,
  FaSignOutAlt,
  FaAd,
  FaPlus,
  FaQuestion,
  FaRupeeSign,
  FaTrophy,
  FaEdit,
  FaBlog,
  FaChartLine,
  FaGraduationCap,
  FaUser,
  FaCog,
  FaChevronDown
} from 'react-icons/fa';
import { BsPersonCircle, BsSearch } from 'react-icons/bs';
import { MdDashboard } from 'react-icons/md';
import { secureLogout, getCurrentUser } from '../lib/utils/authUtils';
import { toggleDarkMode, initializeDarkMode } from '../store/darkModeSlice';
import { hasActiveSubscription } from '../lib/utils/subscriptionUtils';
import { isAdmin } from '../lib/utils/adminUtils';
import CreateActionModal from './CreateActionModal';


const UnifiedNavbar = ({ isLandingPage = false, scrollToSection }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isClient = useClientSide();
  const { user, isAuthenticated } = useAuthStatus();
  const darkMode = useSelector((state) => state.darkMode.isDark);

  useEffect(() => {
    if (isClient) {
      dispatch(initializeDarkMode());
    }
  }, [isClient, dispatch]);

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Navbar links for students (aligned with StudentNavbar right side)
  const studentLinks = (
    <>
      <div className="relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${darkMode
            ? 'hover:bg-gray-700'
            : 'hover:bg-gray-100'
            }`}
          title="Profile Menu"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center">
            {user && user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <BsPersonCircle className="w-6 h-6 text-white" />
            )}
          </div>
          <span className={`hidden lg:block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            {user ? (user.name || 'Student') : 'Student'}
          </span>
          <FaChevronDown className={`hidden lg:block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-[100] ${darkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
            }`}>
            <Link
              href="/profile"
              onClick={() => setShowProfileMenu(false)}
              className={`block px-4 py-2 text-sm transition-colors ${darkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center space-x-2">
                <FaUser className="w-4 h-4" />
                <span>My Profile</span>
              </div>
            </Link>
            <Link
              href="/settings"
              onClick={() => setShowProfileMenu(false)}
              className={`block px-4 py-2 text-sm transition-colors ${darkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center space-x-2">
                <FaCog className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </Link>
            <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
            <button
              onClick={() => {
                setShowProfileMenu(false);
                handleLogout();
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${darkMode
                ? 'text-red-400 hover:bg-gray-700'
                : 'text-red-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center space-x-2">
                <FaSignOutAlt className="w-4 h-4" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        )}
      </div>
      {/* Overlay to close dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-[90] cursor-default"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );

  // Navbar links for admin
  const adminLinks = (
    <Link
      title="Admin Dashboard"
      href="/admin/dashboard"
      className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 p-2 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
    >
      <MdDashboard className="text-lg text-white" />
    </Link>
  );

  // Auth links for guests
  const guestLinks = (
    <>
      <Link
        href="/login"
        className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-red-600 text-white rounded-lg font-medium hover:from-yellow-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
      >
        Get Started
      </Link>
    </>
  );

  // Landing page navigation links
  const landingPageLinks = (
    <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
      <Link
        href="/"
        className="hover:text-orange-700 dark:hover:text-yellow-400 transition-colors font-medium text-sm lg:text-base"
      >
        Home
      </Link>
      <Link
        href="/categories"
        className="hover:text-orange-700 dark:hover:text-yellow-400 transition-colors font-medium text-sm lg:text-base"
      >
        Categories
      </Link>
      <Link
        href="/levels"
        className="hover:text-orange-700 dark:hover:text-yellow-400 transition-colors font-medium text-sm lg:text-base"
      >
        Levels
      </Link>
      <Link
        href="/quizzes"
        className="hover:text-orange-700 dark:hover:text-yellow-400 transition-colors font-medium text-sm lg:text-base"
      >
        Quizzes
      </Link>
      <Link
        href="/govt-exams-preparation"
        className="hover:text-orange-700 dark:hover:text-yellow-400 transition-colors font-medium text-sm lg:text-base"
      >
        Govt. Exams
      </Link>
      <Link
        href="/articles"
        className="hover:text-orange-700 dark:hover:text-yellow-400 transition-colors font-medium text-sm lg:text-base"
      >
        Articles
      </Link>
    </nav>
  );

  return (
    <>
      <header className={`${!user || isLandingPage ? 'block' : 'hidden md:block'} fixed z-[99] transition-all duration-300 w-full ${isClient && darkMode
        ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700'
        : 'bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200'
        } top-0`}>
        <div className="container mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href={user ? "/home" : "/"}
                className="w-10 h-10 lg:w-16 lg:h-16 flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
                title={user ? "Go to Home" : "Go to Landing Page"}
              >
                <img src="/logo.png" alt="SUBG QUIZ Logo" title="SUBG QUIZ" className="w-full h-full object-contain" />
              </Link>
            </div>

            {/* Navigation - Show landing page links when isLandingPage prop is true */}
            {isLandingPage ? landingPageLinks : null}

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {/* Guest Links - Get Started button for non-logged in users (hide on auth pages) */}
              {isClient && !user && !['/login', '/register', '/forgot-password', '/reset-password'].includes(router.pathname) && (
                <div className="block">
                  {guestLinks}
                </div>
              )}

              {/* Admin Links - Only show for admin users */}
              {isClient && user && isAdmin() && (
                <div className="flex items-center space-x-2">
                  {adminLinks}
                </div>
              )}
              {/* Student Links - Only show for student users */}
              {isClient && user && !isAdmin() && (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block">
                  </div>
                  {studentLinks}
                </div>
              )}

              {/* Dark mode toggle */}
              <button
                aria-label="Toggle Dark Mode"
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-blue-600 p-2 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
              >
                {isClient && darkMode ? <FaSun className="w-5 h-5 text-white" /> : <FaMoon className="w-5 h-5 text-white" />}
              </button>

              {/* Logout Button - Only show for logged-in users */}
              {isClient && user && (
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-600 p-2 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
                  title="Logout"
                >
                  <FaSignOutAlt className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {user && (
        <CreateActionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          userSubscription={(user.subscriptionStatus || '').toLowerCase()}
        />
      )}
    </>
  );
};

export default UnifiedNavbar;