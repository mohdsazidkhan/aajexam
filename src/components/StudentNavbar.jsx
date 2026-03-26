import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaSearch,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronDown,
  FaWallet,
  FaTrophy,
  FaUser,
  FaCog,
} from 'react-icons/fa';
import { BsPersonCircle } from 'react-icons/bs';
import toast from 'react-hot-toast';
import API from '../lib/api';
import { toggleSidebar } from '../lib/store/sidebarSlice';
import { toggleDarkMode, initializeDarkMode } from '../store/darkModeSlice';
import { secureLogout, getCurrentUser, isAuthenticated } from '../lib/utils/authUtils';
import { useSSR } from '../hooks/useSSR';

const MIN_WITHDRAW_AMOUNT = parseInt(process.env.NEXT_PUBLIC_MIN_WITHDRAW_AMOUNT || '1000', 10);

const StudentNavbar = () => {
  const { isMounted, router } = useSSR();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar?.isOpen ?? false);
  const darkMode = useSelector((state) => state.darkMode?.isDark ?? false);
  const user = getCurrentUser();
  const authenticated = isAuthenticated();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [walletInfo, setWalletInfo] = useState({ walletBalance: 0, claimableRewards: 0 });
  const [isTopPerformer, setIsTopPerformer] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const fetchRef = useRef(false);

  useEffect(() => {
    if (isMounted) {
      dispatch(initializeDarkMode());
    }
  }, [isMounted, dispatch]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (authenticated && isMounted) {
        try {
          const res = await API.getWalletData();
          if (res && res.success && res.data) {
            const data = res.data;
            setWalletInfo({
              walletBalance: data.walletBalance || 0,
              claimableRewards: data.claimableRewards || 0
            });
            setIsTopPerformer(data.isTopPerformer || false);
          }
        } catch (err) {
          console.error('Error fetching wallet:', err);
        }
      }
    };
    if (authenticated && isMounted && !fetchRef.current) {
      fetchRef.current = true;
      fetchWallet();
    }
  }, [authenticated, isMounted]);

  const handleClaimRewards = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (walletInfo.claimableRewards <= 0) {
      toast.error("No rewards to claim!");
      return;
    }

    if (!isTopPerformer) {
      toast.error("Only Monthly Top Performers can claim rewards!");
      return;
    }

    try {
      setIsClaiming(true);
      const res = await API.claimRewards();
      if (res.success) {
        toast.success(res.message);
        setWalletInfo({
          walletBalance: res.data.walletBalance,
          claimableRewards: res.data.claimableRewards
        });
      } else {
        toast.error(res.message || "Failed to claim rewards");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong while claiming");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);
  const toggleSidebarMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleSidebar());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`block fixed z-50 top-0 left-0 right-0 transition-all duration-300 w-full ${darkMode
      ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700'
      : 'bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200'
      } shadow-sm`}>
      <div className="student_navbar w-full px-2">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Sidebar Toggle & Logo */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button - Only show when authenticated */}
            {authenticated && user && (
              <button
                type="button"
                onClick={toggleSidebarMenu}
                className={`p-2 rounded-lg transition-all duration-300 relative z-10 ${darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
                title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
                aria-label={isOpen ? "Hide Sidebar" : "Show Sidebar"}
              >
                {!isOpen ? <FaBars className="w-5 h-5" /> : <FaTimes className="w-5 h-5" />}
              </button>
            )}
            {/* Logo */}
            <Link
              href={authenticated && user ? "/home" : "/"}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
              title={authenticated && user ? "Go to Home" : "Go to Landing Page"}
            >
              <img
                src="/logo.png"
                alt="SUBG QUIZ Logo"
                className="w-10 h-10 object-contain"
              />
            </Link>
          </div>

          {/* Center Section - Search Bar - Only show when logged in */}
          {authenticated && user && (
            <div className={`hidden lg:flex flex-1 max-w-xl top_search_bar`}>
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Quizzes, Categories, Subcategories, Exams, Users, Blogs, etc..."
                  className={`w-full px-4 py-2 pl-10 rounded-lg border transition-all duration-300 ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-500'
                    } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50`}
                />
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
              </form>
            </div>
          )}

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Button - Only show when logged in */}
            {authenticated && user && (
              <Link
                href="/search"
                className={`md:hidden p-2 rounded-lg transition-all duration-300 ${darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
                title="Search"
              >
                <FaSearch className="w-5 h-5" />
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${darkMode
                ? 'text-yellow-400 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {/* User Profile Menu */}
            {user ? (
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
                    {user.profilePicture ? (
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
                    {user.name || 'Student'}
                  </span>
                  <FaChevronDown className={`hidden lg:block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50 ${darkMode
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

                    {/* Referral Wallet Section */}
                    <div className="px-4 py-2 space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span>Wallet Balance</span>
                        <FaWallet className="w-3 h-3" />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-sm font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          ₹{walletInfo.walletBalance.toLocaleString()}
                        </span>
                        <Link
                          href="/pro/wallet"
                          onClick={() => setShowProfileMenu(false)}
                          className="text-[10px] text-blue-500 hover:underline"
                        >
                          Withdraw
                        </Link>
                      </div>
                      <p className="text-[10px] text-gray-400">Minimum ₹{MIN_WITHDRAW_AMOUNT.toLocaleString()} withdraw</p>
                    </div>

                    <hr className={`my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

                    {/* Competition Rewards Section */}
                    <div className="px-4 py-2 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span>Comp. Rewards</span>
                        <FaTrophy className="w-3 h-3 text-yellow-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          ₹{walletInfo.claimableRewards.toLocaleString()}
                        </span>
                        <button
                          onClick={handleClaimRewards}
                          disabled={isClaiming || walletInfo.claimableRewards <= 0}
                          className={`text-[10px] px-2 py-1 rounded transition-colors ${isTopPerformer && walletInfo.claimableRewards > 0
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          {isClaiming ? 'Claiming...' : 'Claim'}
                        </button>
                      </div>
                      {!isTopPerformer && walletInfo.claimableRewards > 0 && (
                        <p className="text-[9px] text-red-400 leading-tight">Requires Top Performer status to claim</p>
                      )}
                    </div>
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
            ) : (
              // Hide Login button on auth pages
              !['/login', '/register', '/forgot-password', '/reset-password'].includes(router.pathname) && (
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${darkMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white'
                    }`}
                >
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default StudentNavbar;
