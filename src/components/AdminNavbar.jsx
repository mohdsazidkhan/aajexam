import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSSR } from '../hooks/useSSR';
import {
  FaTrophy,
  FaCrown,
  FaStar,
  FaMedal,
  FaRocket,
  FaChartLine,
  FaAward,
  FaGem,
  FaBook,
  FaFlask,
  FaLaptopCode,
  FaGlobe,
  FaCalculator,
  FaPalette,
  FaLeaf,
  FaUserGraduate,
  FaLayerGroup,
  FaClock,
  FaQuestionCircle,
  FaUserCircle,
  FaLevelUpAlt,
  FaSun,
  FaMoon,
  FaArrowRight,
  FaPlay,
  FaUsers,
  FaGift,
  FaCheckCircle,
  FaShieldAlt,
  FaHeadset,
  FaMobileAlt,
  FaDesktop,
  FaTabletAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaMagic,
  FaCreditCard,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCog,
  FaBell
} from 'react-icons/fa';
import { BsPersonCircle, BsSearch } from 'react-icons/bs';
import { MdDarkMode, MdDashboard, MdLogout, MdPerson4, MdPersonAdd, MdAdminPanelSettings } from 'react-icons/md';
import { toggleSidebar } from '../lib/store/sidebarSlice';
import { toggleDarkMode, initializeDarkMode } from '../store/darkModeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { secureLogout, getCurrentUser, getAuthToken } from '../lib/utils/authUtils';
import { isAdmin, hasAdminPrivileges } from '../lib/utils/adminUtils';
import API from '../lib/api';

const AdminNavbar = () => {
  // All hooks must be called at the top level, before any conditional returns
  const { isMounted, isRouterReady, router } = useSSR();
  const user = getCurrentUser();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const darkMode = useSelector((state) => state.darkMode.isDark);

  const [notifCount, setNotifCount] = useState(0);
  // Initialize dark mode on mount to ensure DOM is in sync
  useEffect(() => {
    if (isMounted) {
      dispatch(initializeDarkMode());
    }
  }, [isMounted, dispatch]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const resCount = await API.getAdminNotifications(1, 1, { unreadOnly: true });
        const total = resCount?.pagination?.total || (resCount?.data?.length || 0);
        setNotifCount(total);
      } catch { }
    };
    if (!isMounted) return;
    fetchCount();
  }, [isMounted]);

  // Don't render anything during SSR
  if (!isMounted) {
    return <div>Loading...</div>;
  }

  const toggleTheme = () => dispatch(toggleDarkMode());
  const handleLogout = () => secureLogout(router);



  return (
    <header className={`fixed z-[99] transition-all duration-300 w-full hidden md:block ${darkMode
      ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 md:border-b md:border-t-0'
      : 'bg-gradient-to-r from-white via-gray-50 to-white border-t border-gray-200 md:border-b md:border-t-0'
      } bottom-0 md:bottom-auto md:top-0`}>
      <div className="admin_navbarw-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/dashboard"
              className="w-10 h-10 lg:w-16 lg:h-16 flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
              title="Go to Dashboard"
            >
              <img src="/logo.png" alt="AajExam Logo" className="w-full h-full object-contain" />
            </Link>
          </div>



          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications Link */}
            <Link
              href="/admin/notifications"
              className={`p-2 rounded-lg transition-all duration-300 ${darkMode
                ? 'bg-secondary-700 text-secondary-200 hover:bg-secondary-600'
                : 'bg-secondary-100 text-primary-600 hover:bg-secondary-200'
                } relative`}
              title="Notifications"
            >
              <FaBell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-primary-500 text-black' : 'bg-black text-white'}`}>
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${darkMode
                ? 'bg-secondary-700 text-primary-400 hover:bg-secondary-600'
                : 'bg-secondary-100 text-primary-600 hover:bg-secondary-200'
                }`}
            >
              {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {/* Dashboard Link */}
            <Link
              href="/admin/dashboard"
              className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${darkMode
                ? 'bg-secondary-700 text-secondary-200 hover:bg-secondary-600'
                : 'bg-secondary-100 text-primary-600 hover:bg-secondary-200'
                }`}
              title="Dashboard"
            >
              <MdDashboard className="w-5 h-5" />
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-all duration-300 ${darkMode
                ? 'bg-secondary-700 text-secondary-200 hover:bg-secondary-600'
                : 'bg-secondary-100 text-primary-600 hover:bg-secondary-200'
                }`}
              title="Logout"
            >
              <FaSignOutAlt className="w-5 h-5" />
            </button>

            {/* Sidebar Toggle Button */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className={`p-2 rounded-lg transition-all duration-300 ${darkMode
                ? 'bg-secondary-700 text-secondary-200 hover:bg-secondary-600'
                : 'bg-secondary-100 text-primary-600 hover:bg-secondary-200'
                }`}
              title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              {!isOpen ? <FaBars className="w-5 h-5" /> : <FaTimes className="w-5 h-5" />}
            </button>


          </div>
        </div>
      </div>


    </header>
  );
};

export default AdminNavbar;
