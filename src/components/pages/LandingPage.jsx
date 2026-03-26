'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import config from '../../lib/config/appConfig';

import {
  FaTrophy,
  FaCrown,
  FaStar,
  FaMedal,
  FaRocket,
  FaBrain,
  FaChartLine,
  FaAward,
  FaGem,
  FaBook,
  FaFlask,
  FaLaptopCode,
  FaGlobe,
  FaCalculator,
  FaPalette,
  FaUserGraduate,
  FaArrowRight,
  FaPlay,
  FaUsers,
  FaGift,
  FaRupeeSign,
  FaCheckCircle,
  FaShieldAlt,
  FaHeadset,
  FaDownload,
  FaGoogle,
  FaMobileAlt,
  FaDesktop,
  FaTabletAlt,
  FaMagic,
  FaQuestionCircle,
  FaNewspaper,
  FaHistory,
  FaFutbol,
  FaFilm,
  FaLanguage,
  FaGraduationCap,
  FaDollarSign,
  FaCalendarDay,
  FaLevelUpAlt,
  FaPlane,
  FaComments,
  FaTh,
  FaGamepad,
  FaBriefcase,
} from "react-icons/fa";

import UnifiedNavbar from "../UnifiedNavbar";
import UnifiedFooter from "../UnifiedFooter";
import MonthlyWinnersDisplay from "../MonthlyWinnersDisplay";
import PublicTopPerformers from "../PublicTopPerformers";
import MobileAppWrapper from "../MobileAppWrapper";
import LandingPageSkeleton from "../LandingPageSkeleton";

import API from '../../lib/api';


const LandingPage = () => {
  const [levels, setLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [stats, setStats] = useState({
    activeStudents: "10K+",
    levels: "10",
    quizCategories: "15+",
    subcategories: "100+",
    totalQuizzes: "2,000+",
    totalQuestions: "12,000+",
    quizzesTaken: "5K+",
    monthlyPrizePool: 0,
    paidSubscriptions: "99+",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/home");
      return;
    }

    // Set default view mode based on screen size
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      } else {
        setViewMode('list');
      }
    };

    // Set initial view mode
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    fetchData();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel using centralized API service
      const [levelsRes, categoriesRes, topPerformersRes, statsRes] =
        await Promise.all([
          API.getAllLevels(),
          API.getPublicCategoriesEnhanced(),
          API.getPublicLandingTopPerformers(config.QUIZ_CONFIG.TOP_PERFORMERS_USERS),
          API.getPublicLandingStats(),
        ]);

      // Set data if successful
      if (levelsRes.success) {
        // Filter out Starter level (Level 0)
        const filteredLevels = levelsRes.data.filter(
          (level) => level.level !== 0
        );
        setLevels(filteredLevels);
        setStats((prevStats) => ({
          ...prevStats,
          levels: filteredLevels.length,
        }));
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }

      if (topPerformersRes.success) {
        // Sort the top performers using the same logic as Performance Analytics
        const sortedTopPerformers = topPerformersRes.data.sort((a, b) => {
          // First priority: High Score Wins (descending) - same as Performance Analytics
          const aHighScore = a.highQuizzes || 0;
          const bHighScore = b.highQuizzes || 0;
          if (aHighScore !== bHighScore) {
            return bHighScore - aHighScore;
          }

          // Second priority: Accuracy (descending) - same as Performance Analytics
          const aAccuracy = a.accuracy || 0;
          const bAccuracy = b.accuracy || 0;
          if (aAccuracy !== bAccuracy) {
            return bAccuracy - aAccuracy;
          }

          // Third priority: Total quizzes played (descending) - same as Performance Analytics
          const aTotalQuizzes = a.totalQuizzes || 0;
          const bTotalQuizzes = b.totalQuizzes || 0;
          return bTotalQuizzes - aTotalQuizzes;
        });

        setTopPerformers(sortedTopPerformers);
      }

      if (statsRes.success) {
        // Format large numbers for display
        const formatNumber = (num) => {
          if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K+`;
          }
          return num.toString();
        };

        setStats({
          activeStudents: formatNumber(statsRes.data.activeStudents),
          quizCategories: formatNumber(statsRes.data.quizCategories),
          subcategories: formatNumber(statsRes.data.subcategories),
          totalQuizzes: formatNumber(statsRes.data.totalQuizzes),
          totalQuestions: formatNumber(statsRes.data.totalQuestions),
          quizzesTaken: formatNumber(statsRes.data.quizzesTaken),
          totalExams: formatNumber(statsRes.data.totalExams),
          monthlyPrizePool: statsRes.data.activeProUsers * config.QUIZ_CONFIG.PRIZE_PER_PRO,
          paidSubscriptions: statsRes.data.paidSubscriptions,
        });
      }
    } catch (error) {
      console.error("Error fetching landing page data:", error);
      setError("Failed to load data. Please try again later.");
      // Set fallback data if APIs fail
      setLevels([
        { level: 1, name: "Rookie", description: "Build your foundation", quizCount: 5, quizzesRequired: 5 },
        { level: 2, name: "Explorer", description: "Discover new knowledge", quizCount: 10, quizzesRequired: 10 },
        { level: 3, name: "Thinker", description: "Develop critical thinking", quizCount: 15, quizzesRequired: 15 },
        { level: 4, name: "Strategist", description: "Master strategic learning", quizCount: 20, quizzesRequired: 20 },
        { level: 5, name: "Achiever", description: "Achieve excellence", quizCount: 25, quizzesRequired: 25 },
        { level: 6, name: "Mastermind", description: "Become a master", quizCount: 30, quizzesRequired: 30 },
        { level: 7, name: "Champion", description: "Champion level", quizCount: 35, quizzesRequired: 35 },
        { level: 8, name: "Prodigy", description: "Prodigy level", quizCount: 40, quizzesRequired: 40 },
        { level: 9, name: "Wizard", description: "Wizard level", quizCount: 45, quizzesRequired: 45 },
        { level: 10, name: "Legend", description: "Legendary status", quizCount: 50, quizzesRequired: config.QUIZ_CONFIG.LEVEL_10_QUIZ_REQUIREMENT || 50 },
      ]);

      setCategories([
        {
          _id: "1",
          name: "Science",
          description: "Explore scientific concepts",
          quizCount: 50,
        },
        {
          _id: "2",
          name: "Technology",
          description: "Learn about modern tech",
          quizCount: 45,
        },
        {
          _id: "3",
          name: "Mathematics",
          description: "Master mathematical skills",
          quizCount: 40,
        },
        {
          _id: "4",
          name: "Geography",
          description: "Discover the world",
          quizCount: 35,
        },
        {
          _id: "5",
          name: "History",
          description: "Learn from the past",
          quizCount: 30,
        },
        {
          _id: "6",
          name: "Literature",
          description: "Explore great works",
          quizCount: 25,
        },
      ]);

      setTopPerformers([
        { _id: "1", name: "Quiz Master", level: 10, score: 95, quizCount: 150 },
        {
          _id: "2",
          name: "Knowledge Seeker",
          level: 10,
          score: 92,
          quizCount: 145,
        },
        {
          _id: "3",
          name: "Brain Champion",
          level: 10,
          score: 90,
          quizCount: 140,
        },
        { _id: "4", name: "Learning Pro", level: 9, score: 88, quizCount: 135 },
        { _id: "5", name: "Quiz Wizard", level: 9, score: 85, quizCount: 130 },
        {
          _id: "6",
          name: "Smart Student",
          level: 8,
          score: 82,
          quizCount: 125,
        },
        {
          _id: "7",
          name: "Knowledge Hunter",
          level: 8,
          score: 80,
          quizCount: 120,
        },
        {
          _id: "8",
          name: "Quiz Explorer",
          level: 7,
          score: 78,
          quizCount: 115,
        },
        {
          _id: "9",
          name: "Learning Star",
          level: 7,
          score: 75,
          quizCount: 110,
        },
        {
          _id: "10",
          name: "Quiz Enthusiast",
          level: 6,
          score: 72,
          quizCount: 105,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return <LandingPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <MobileAppWrapper title="AajExam" showHeader={false}>
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark text-gray-900 dark:text-white transition-colors duration-300 pt-12 sm:pt-0">
        {/* Unified Header */}
        <UnifiedNavbar isLandingPage={true} scrollToSection={scrollToSection} />

        {/* Hero Section */}
        <section id="hero" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-secondary-600/10 to-primary-600/10 pointer-events-none" />

          {/* Floating Background Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Books */}
            <div className="absolute top-20 left-10 animate-float-slow hero-float-icon">
              <FaBook className="w-8 h-8 text-primary-500/30 animate-pulse" />
            </div>
            <div className="absolute top-32 right-20 animate-float-medium hero-float-icon">
              <FaBook className="w-6 h-6 text-primary-500/25 animate-pulse" />
            </div>
            <div className="absolute top-40 left-1/4 animate-float-fast hero-float-icon">
              <FaBook className="w-5 h-5 text-red-500/20 animate-pulse" />
            </div>

            {/* Question Marks */}
            <div className="absolute top-16 right-1/3 animate-float-medium hero-float-icon">
              <FaQuestionCircle className="w-7 h-7 text-primary-400/30 animate-bounce" />
            </div>
            <div className="absolute top-24 left-1/3 animate-float-slow hero-float-icon">
              <FaQuestionCircle className="w-5 h-5 text-secondary-400/25 animate-bounce" />
            </div>
            <div className="absolute top-36 right-16 animate-float-fast hero-float-icon">
              <FaQuestionCircle className="w-6 h-6 text-red-400/20 animate-bounce" />
            </div>

            {/* Quiz Icons */}
            <div className="absolute top-28 left-16 animate-float-medium hero-float-icon">
              <FaBrain className="w-6 h-6 text-primary-500/25 animate-pulse" />
            </div>
            <div className="absolute top-44 right-1/4 animate-float-slow hero-float-icon">
              <FaBrain className="w-7 h-7 text-primary-500/30 animate-pulse" />
            </div>

            {/* Categories */}
            <div className="absolute top-20 right-10 animate-float-fast hero-float-icon">
              <FaFlask className="w-5 h-5 text-primary-400/20 animate-pulse" />
            </div>
            <div className="absolute top-48 left-20 animate-float-medium hero-float-icon">
              <FaCalculator className="w-6 h-6 text-secondary-400/25 animate-pulse" />
            </div>
            <div className="absolute top-32 left-1/2 animate-float-slow hero-float-icon">
              <FaPalette className="w-5 h-5 text-red-400/20 animate-pulse" />
            </div>

            {/* Students */}
            <div className="absolute top-16 left-1/2 animate-float-medium hero-float-icon">
              <FaUserGraduate className="w-6 h-6 text-primary-500/25 animate-pulse" />
            </div>
            <div className="absolute top-40 right-32 animate-float-slow hero-float-icon">
              <FaUsers className="w-5 h-5 text-primary-500/20 animate-pulse" />
            </div>
            <div className="absolute top-52 left-1/3 animate-float-fast hero-float-icon">
              <FaUserGraduate className="w-7 h-7 text-red-500/30 animate-pulse" />
            </div>

            {/* Additional floating elements */}
            <div className="absolute top-24 right-40 animate-float-slow hero-float-icon">
              <FaTrophy className="w-4 h-4 text-primary-400/15 animate-pulse" />
            </div>
            <div className="absolute top-36 left-40 animate-float-medium hero-float-icon">
              <FaStar className="w-5 h-5 text-secondary-400/20 animate-pulse" />
            </div>
            <div className="absolute top-48 right-1/2 animate-float-fast hero-float-icon">
              <FaMedal className="w-6 h-6 text-red-400/25 animate-pulse" />
            </div>
          </div>

          <div className="relative container mx-auto px-4 lg:px-8 py-10 lg:py-20 mt-0 md:mt-8">
            <div className="text-center">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 text-secondary-500 to-secondary-500 dark:text-white">
                  Battle of Brains. <br /> <i>Only Legends Can Survive!</i>
                </span>
              </h1>
              <p className="text-sm md:text-xl mb-8 max-w-3xl mx-auto text-gray-600 dark:text-gray-300 font-semibold">
                Ready to prove your knowledge? Play level based quizzes across categories, compete on the leaderboard, and win monthly rewards. <br /> <strong className="text-primary-500">A new challenge begins every month!</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="group px-4 md:px-8 py-1 md:py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold text-md lg:text-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Start Learning Now</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                {/* <button
                onClick={() => scrollToSection("levels")}
                className="px-4 md:px-8 py-2 md:py-4 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-xl font-semibold text-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-all duration-300 flex items-center space-x-2"
              >
                <FaPlay className="w-4 h-4" />
                <span>Explore Levels</span>
              </button> */}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-2 md:mt-10 lg:mt-20 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 lg:gap-6 p-4 relative">
              {[
                {
                  icon: FaUsers,
                  number: stats?.activeStudents || "N/A",
                  label: "Active Students",
                  gradient: "from-secondary-500/20 to-cyan-500/20",
                  iconBg: "from-secondary-500 to-cyan-500",
                  textColor: "text-secondary-600",
                },
                {
                  icon: FaLevelUpAlt,
                  number: levels.length || "N/A",
                  label: "Levels",
                  gradient: "from-secondary-500/20 to-cyan-500/20",
                  iconBg: "from-secondary-500 to-cyan-500",
                  textColor: "text-secondary-600",
                },
                {
                  icon: FaBook,
                  number: stats?.quizCategories || "N/A",
                  label: "Categories",
                  gradient: "from-green-500/20 to-emerald-500/20",
                  iconBg: "from-green-500 to-emerald-500",
                  textColor: "text-green-600",
                },
                {
                  icon: FaFlask,
                  number: stats.subcategories || "N/A",
                  label: "Subcategories",
                  gradient: "from-purple-500/20 to-pink-500/20",
                  iconBg: "from-purple-500 to-pink-500",
                  textColor: "text-primary-600",
                },
                {
                  icon: FaQuestionCircle,
                  number: stats.totalQuestions || "N/A",
                  label: "Questions",
                  gradient: "from-primary-500/20 to-secondary-500/20",
                  iconBg: "from-primary-500 to-secondary-500",
                  textColor: "text-primary-600",
                },
                {
                  icon: FaLaptopCode,
                  number: stats.totalQuizzes || "N/A",
                  label: "Quizzes",
                  gradient: "from-primary-500/20 to-secondary-500/20",
                  iconBg: "from-primary-500 to-secondary-500",
                  textColor: "text-primary-600",
                },
                {
                  icon: FaTrophy,
                  number: stats?.quizzesTaken || "N/A",
                  label: "Quizzes Taken",
                  gradient: "from-primary-500/20 to-primary-500/20",
                  iconBg: "from-primary-500 to-primary-500",
                  textColor: "text-primary-600",
                },
                {
                  icon: FaGraduationCap,
                  number: stats?.totalExams || "N/A",
                  label: "Govt. Exams",
                  gradient: "from-cyan-500/20 to-secondary-500/20",
                  iconBg: "from-cyan-500 to-secondary-500",
                  textColor: "text-cyan-600",
                },
                {
                  icon: FaRupeeSign,
                  number: stats?.monthlyPrizePool || "N/A",
                  label: "Monthly Prize",
                  gradient: "from-pink-500/20 to-rose-500/20",
                  iconBg: "from-pink-500 to-rose-500",
                  textColor: "text-pink-600",
                },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-gradient-to-br ${stat?.iconBg} shadow-lg transform group-hover:scale-110 transition-all duration-300`}>
                    <stat.icon className="w-4 lg:w-7 h-4 lg:h-7 text-white" />
                  </div>
                  <div className={`text-md lg:text-2xl font-bold ${stat?.textColor} mb-1 group-hover:scale-105 transition-transform duration-300`}>
                    {stat.number}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                  {/* Gradient background overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat?.gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-red-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary-400/20 to-primary-400/20 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Explore Content Section - Quick Access Links */}
        <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-secondary-500 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400">
                  Explore Our Content
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Browse thousands of quizzes, exams, and articles to boost your knowledge
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {/* Categories Card */}
              <Link href="/categories">
                <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-500 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 from-secondary-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <FaBook className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center group-hover:text-primary-600 dark:group-hover:text-red-400 transition-colors">
                    Categories
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                    Browse by subject and topic
                  </p>
                  <div className="flex items-center justify-center text-primary-600 dark:text-red-400 font-semibold group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <FaArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Levels Card */}
              <Link href="/levels">
                <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary-500 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <FaTrophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Levels
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                    10-level progression system
                  </p>
                  <div className="flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <FaArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Quizzes Card - Coming Soon */}
              <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-secondary-500 cursor-not-allowed opacity-75">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <FaQuestionCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">
                  Quizzes
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  Browse all quizzes directly
                </p>
                <div className="flex items-center justify-center text-secondary-600 dark:text-secondary-400 font-semibold">
                  <span className="text-sm">Coming Soon</span>
                </div>
              </div>

              {/* Exams Card */}
              <Link href="/exams">
                <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-500 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <FaGraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Govt. Exams
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                    Practice for real exams
                  </p>
                  <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-semibold group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <FaArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Articles Card */}
              <Link href="/articles">
                <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-pink-500 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <FaNewspaper className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    Articles
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                    Read educational blogs
                  </p>
                  <div className="flex items-center justify-center text-pink-600 dark:text-pink-400 font-semibold group-hover:gap-2 transition-all">
                    <span>Explore</span>
                    <FaArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Referral System Section - Visible to all users */}
        <section id="referrals" className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12 z-10">
            <div className="rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4   xl:p-12 border-2 border-purple-300/30">
              <div className="text-center mb-6 sm:mb-8 md:mb-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 md:w-24 md:h-24 bg-gradient-to-tr from-primary-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl sm:shadow-2xl animate-float">
                  <FaStar className="text-white text-2xl sm:text-3xl md:text-4xl drop-shadow-lg" />
                </div>
                <h2 className="text-md sm:text-lg md:text-lg lg:text-xl xl:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-800 dark:text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
                  🎉 Invite Friends & Earn Rewards! 🎉
                </h2>
                <p className="text-center mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-primary-200 font-medium max-w-2xl sm:max-w-3xl lg:p-4 px-4 sm:px-0">
                  Invite your friends to AajExam and earn wallet rewards.
                </p>
              </div>

              {/* Your Rewards Grid - New Design */}
              <div className="mb-8">
                <h3 className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
                  Your Rewards:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Friend Buys Pro Plan - Purple Gradient */}
                  <div className="bg-gradient-to-br from-purple-700 to-violet-600 dark:from-purple-800 dark:to-violet-700 rounded-xl sm:rounded-2xl p-4 lg:p-6 text-center hover:scale-105 transition-transform duration-300 shadow-lg mx-auto max-w-sm">
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
                      👑
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2">
                      Friend Buys ₹{config.SUBSCRIPTION_PLANS.PRO.price} Plan
                    </h3>
                    <div className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-primary-300 mb-1 sm:mb-2">
                      ₹{config.QUIZ_CONFIG.REFERRAL_REWARD_PRO}
                    </div>
                    <p className="text-primary-100 text-xs sm:text-lg">
                      First-time purchase
                    </p>
                  </div>
                </div>
              </div>

              {/* Withdrawal Rules */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl sm:rounded-2xl p-4 lg:p-6 mb-6 sm:mb-8 border-2 border-primary-200 dark:border-primary-700">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 text-center">
                  Withdrawal Rules:
                </h3>
                <div className="space-y-2 text-center">
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    • Minimum withdrawal: ₹{process.env.NEXT_PUBLIC_MIN_WITHDRAW_AMOUNT || '1000'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    • You must be a "Top Performer in the previous month"
                  </p>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gray-100 dark:bg-white/10 rounded-xl sm:rounded-2xl p-4 lg:p-6 mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 text-center">
                  How It Works
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-white dark:text-black font-bold text-sm sm:text-base md:text-lg">
                        1
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                      Get your unique referral code
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-white dark:text-black font-bold text-sm sm:text-base md:text-lg">
                        2
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                      Share it with friends & family
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-white dark:text-black font-bold text-sm sm:text-base md:text-lg">
                        3
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                      Friends join and buy a plan
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                        4
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                      Earn instant wallet money!
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-700 dark:text-primary-200 text-sm sm:text-base md:text-lg font-medium">
                    Ready to start earning rewards?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Link
                      href="/register"
                      className="inline-block bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
                    >
                      🚀 Join Now & Get Referral Code
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App Section */}
        <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-indigo-50 from-red-50 dark:from-gray-900 dark:via-secondary-900/20 dark:from-red-900/20"></div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-secondary-400/20 from-red-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-secondary-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Inner Gradient Border Effect */}
              <div className="relative p-1 bg-gradient-to-r from-secondary-500 via-purple-500 to-pink-500 rounded-3xl">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 md:p-4 lg:p-8 xl:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 xl:gap-12 items-center">
                    {/* Left Side - Content */}
                    <div className="text-center lg:text-left">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-600 text-white rounded-full text-sm font-semibold mb-6 animate-bounce">
                        <FaMobileAlt className="w-4 h-4" />
                        <span>Now Available on Play Store!</span>
                      </div>

                      <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-extrabold mb-4 text-black dark:text-white">
                        Download AajExam App
                      </h2>

                      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        Take your learning on the go! Play quizzes anytime, anywhere with our beautiful mobile app. Compete with friends, track your progress, and win rewards.
                      </p>

                      {/* Features List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {[
                          { icon: FaBrain, text: "Level-based Quizzes" },
                          { icon: FaTrophy, text: "Win Rewards" },
                          { icon: FaChartLine, text: "Track Progress" },
                          { icon: FaUsers, text: "Compete Globally" },
                        ].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                              <feature.icon className="w-5 h-5" />
                            </div>
                            <span className="font-medium">{feature.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Play Store Button */}
                      <a
                        href="https://play.google.com/store/apps/details?id=com.subgapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-600 to-black hover:from-gray-600 hover:to-black text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <svg className="playStoreIcon" aria-hidden="true" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h40v40H0V0z"></path><g><path d="M19.7,19.2L4.3,35.3c0,0,0,0,0,0c0.5,1.7,2.1,3,4,3c0.8,0,1.5-0.2,2.1-0.6l0,0l17.4-9.9L19.7,19.2z" fill="#EA4335"></path><path d="M35.3,16.4L35.3,16.4l-7.5-4.3l-8.4,7.4l8.5,8.3l7.5-4.2c1.3-0.7,2.2-2.1,2.2-3.6C37.5,18.5,36.6,17.1,35.3,16.4z" fill="#FBBC04"></path><path d="M4.3,4.7C4.2,5,4.2,5.4,4.2,5.8v28.5c0,0.4,0,0.7,0.1,1.1l16-15.7L4.3,4.7z" fill="#4285F4"></path><path d="M19.8,20l8-7.9L10.5,2.3C9.9,1.9,9.1,1.7,8.3,1.7c-1.9,0-3.6,1.3-4,3c0,0,0,0,0,0L19.8,20z" fill="#34A853"></path></g></svg>
                        <div className="text-left">
                          <div className="text-xs opacity-90">GET IT ON</div>
                          <div className="text-lg leading-tight">Google Play</div>
                        </div>
                        <FaDownload className="w-5 h-5 ml-2" />
                      </a>

                      {/* Additional Info */}
                      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-primary-600 dark:text-primary-400">Free Download</span> •
                        <span className="mx-2">5+ Rating</span> •
                        <span className="mx-2">100+ Downloads</span>
                      </p>
                    </div>

                    {/* Right Side - Phone Mockup/Illustration */}
                    <div className="relative flex justify-center lg:justify-end">
                      <div className="relative w-64 h-96 md:w-72 md:h-[28rem] lg:w-80 lg:h-[32rem]">
                        {/* Phone Frame */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-500">
                          <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
                            {/* Phone Screen Content */}
                            <div className="absolute inset-0 bg-gradient-to-br from-secondary-600 via-secondary-500 to-pink-600 p-6 flex flex-col items-center justify-center text-white">
                              {/* App Logo/Icon */}
                              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl animate-bounce">
                                <FaBrain className="w-12 h-12 text-secondary-600 dark:text-primary-500" />
                              </div>

                              {/* App Name */}
                              <h3 className="text-2xl font-bold mb-2">AajExam</h3>
                              <p className="text-sm opacity-90 mb-8 text-center">Learn & Play Quiz</p>

                              {/* Features Icons */}
                              <div className="grid grid-cols-2 gap-4 w-full">
                                {[FaBrain, FaTrophy, FaChartLine, FaUsers].map((Icon, idx) => (
                                  <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center">
                                    <Icon className="w-8 h-8" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Floating Icons Around Phone */}
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                          <FaStar className="w-8 h-8" />
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-red-400 to-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                          <FaTrophy className="w-8 h-8 lg:w-10 lg:h-10" />
                        </div>
                        <div className="absolute top-1/2 -left-8 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse delay-500">
                          <FaRocket className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prize & Rewards Section */}
        <section id="prizes" className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tl from-amber-50 via-primary-50 to-primary-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-primary-900/20 pointer-events-none" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-4 lg:mb-16">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                  Live Prize Pool
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Compete and earn rewards based on your performance.
                Top players share Daily, Weekly & Monthly prize pools.
              </p>
            </div>

            {/* Full Width Prize Pool Display */}
            <div className="container mx-auto">
              <div className="rounded-3xl p-2 md:p-4 lg:p-8 xl:p-12 bg-gradient-to-br from-white via-primary-50 to-primary-50 dark:from-gray-800 dark:via-primary-900/20 dark:to-primary-900/20 border-2 border-primary-200 dark:border-primary-700 shadow-2xl">
                {/* Header Section */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl lg:text-4xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600">
                      Monthly Prize Pool
                    </span>
                  </h3>
                  <div className="text-3xl md:text-3xl lg:text-5xl font-bold text-primary-500 mb-4">
                    {stats.monthlyPrizePool > 0 ? `₹${stats.monthlyPrizePool.toLocaleString('en-IN')}` : `₹${config.QUIZ_CONFIG.PRIZE_PER_PRO}+`}
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} PRO users at Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with {config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes share the prize pool every month (active PRO users × ₹{config.QUIZ_CONFIG.PRIZE_PER_PRO})
                  </p>
                </div>

                {/* Prize Distribution Grid */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-10 gap-4">
                    {/* Prize distribution — percentages of dynamic pool */}
                    {[
                      { rank: 1, pct: '25%', color: 'from-primary-400 to-primary-600', badge: 'bg-primary-300', text: 'text-primary-800' },
                      { rank: 2, pct: '20%', color: 'from-gray-300 to-gray-500', badge: 'bg-gray-200', text: 'text-gray-700' },
                      { rank: 3, pct: '15%', color: 'from-primary-400 to-primary-600', badge: 'bg-primary-300', text: 'text-primary-800' },
                      { rank: 4, pct: '12%', color: 'from-secondary-400 to-secondary-600', badge: 'bg-secondary-300', text: 'text-secondary-800' },
                      { rank: 5, pct: '8%', color: 'from-green-400 to-green-600', badge: 'bg-green-300', text: 'text-green-800' },
                      { rank: 6, pct: '6%', color: 'from-purple-400 to-violet-600', badge: 'bg-purple-300', text: 'text-purple-800' },
                      { rank: 7, pct: '5%', color: 'from-pink-400 to-pink-600', badge: 'bg-pink-300', text: 'text-pink-800' },
                      { rank: 8, pct: '4%', color: 'from-indigo-400 to-indigo-600', badge: 'bg-indigo-300', text: 'text-indigo-800' },
                      { rank: 9, pct: '3.5%', color: 'from-teal-400 to-teal-600', badge: 'bg-teal-300', text: 'text-teal-800' },
                      { rank: 10, pct: '1.5%', color: 'from-red-400 to-secondary-600', badge: 'bg-red-300', text: 'text-red-800' },
                    ].map(({ rank, pct, color, badge, text }) => (
                      <div key={rank} className={`group relative text-center p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}>
                        <div className={`absolute -top-2 -right-2 w-6 h-6 ${badge} rounded-full flex items-center justify-center`}>
                          <span className={`${text} text-xs font-bold`}>{rank}</span>
                        </div>
                        <div className="text-xl font-bold mb-1">{pct}</div>
                        <div className="text-xs opacity-90">of pool</div>
                      </div>
                    ))}
                  </div>

                  {/* Eligibility Info */}
                  <div className="text-center p-2 lg:p-6 bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <FaTrophy className="text-primary-500 text-xl" />
                      <h4 className="text-md lg:text-lg font-bold text-secondary-800 dark:text-secondary-300">Eligibility Requirements</h4>
                    </div>
                    <p className="text-sm lg:text-base text-secondary-700 dark:text-secondary-300">
                      <strong>Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD}</strong> + <strong>{config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes</strong> (≥{config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% accuracy)
                    </p>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="mt-10 text-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center space-x-3 px-4 md:px-8 py-2 md:py-4 bg-gradient-to-r from-primary-500 text-secondary-500 to-secondary-500 text-white rounded-2xl font-bold text-lg hover:from-primary-600 hover:via-primary-500 hover:to-secondary-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <FaRocket className="w-5 h-5" />
                    <span>Start Winning Today</span>
                    <FaArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Monthly Winners Section */}
        <section className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <MonthlyWinnersDisplay
              title="🏆 Previous Month Legends"
              showTitle={false}
              className="bg-white dark:bg-gray-800 shadow-xl"
            />
          </div>
        </section>

        {/* Top Performers Section */}
        <section id="performers" className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-teal-900/20 pointer-events-none" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-4 md:mb-8 lg:mb-16">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                  Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} Performers{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Meet the legends who are dominating the monthly leaderboard. Top
                10 at Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with {config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes win from a dynamic prize pool every month!
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl border-2 border-secondary-300 dark:border-indigo-500">
              <PublicTopPerformers />
            </div>

            <div className="text-center mt-12">
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300"
              >
                <span>Join the Competition</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Govt. Exam Section - Premium Redesign */}
        <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950 dark:from-red-950">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-purple-100 to-pink-100 dark:from-primary-900 dark:via-purple-900 dark:to-pink-900">
            {/* Animated Blob Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-20 left-10 w-96 h-96 bg-secondary-400 dark:bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob"></div>
              <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
              <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-400 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>
            </div>
            {/* Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-20 dark:opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
          </div>

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10 z-10">
            {/* Header Section */}
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-400 text-secondary-500 to-secondary-500 text-white rounded-full text-sm font-bold mb-6 shadow-2xl animate-pulse hover:animate-none transition-all">
                <FaGraduationCap className="w-5 h-5" />
                <span>🚀 Your Dream Job Awaits</span>
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-extrabold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-pink-600 to-cyan-600 dark:from-primary-300 dark:via-pink-300 dark:to-cyan-300 bg-[length:200%_auto] animate-gradient-shift">
                  Master Government Exams
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Comprehensive practice tests, real exam patterns, and detailed analytics to help you crack your dream government job exam.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 mb-4">
              {/* Feature Card 1 */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-4 lg:p-8 border border-gray-200 dark:border-white/20 hover:border-secondary-500 dark:hover:border-white/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary-500/20 dark:hover:shadow-secondary-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/10 to-cyan-500/10 dark:from-secondary-500/20 dark:to-cyan-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                    <FaBook className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-secondary-600 dark:group-hover:text-primary-300 transition-colors">Real Exam Patterns</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Practice with actual exam patterns and question formats from previous years to boost your confidence.
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-4 lg:p-8 border border-gray-200 dark:border-white/20 hover:border-purple-500 dark:hover:border-white/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/50">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                    <FaChartLine className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">Track Progress</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Monitor your performance with detailed analytics and identify areas for improvement with real-time insights.
                  </p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-4 lg:p-8 border border-gray-200 dark:border-white/20 hover:border-primary-500 dark:hover:border-white/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20 dark:hover:shadow-primary-500/50 md:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-500/10 dark:from-primary-500/20 dark:to-primary-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-500 to-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                    <FaAward className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <h3 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">Detailed Solutions</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Get step-by-step solutions and explanations for every question to understand concepts better and learn effectively.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-4 mb-4">
              {[
                { icon: FaGraduationCap, label: "Exam Categories", value: "100+", color: "from-secondary-500 to-cyan-500", hoverColor: "hover:shadow-secondary-500/50" },
                { icon: FaBook, label: "Practice Tests", value: "100+", color: "from-purple-500 to-pink-500", hoverColor: "hover:shadow-purple-500/50" },
                { icon: FaUsers, label: "Active Learners", value: "1000+", color: "from-green-600 to-secondary-600", hoverColor: "hover:shadow-green-600/50" },
                { icon: FaTrophy, label: "Success Rate", value: "85%", color: "from-green-500 to-emerald-500", hoverColor: "hover:shadow-green-500/50" },
              ].map((stat, idx) => (
                <div key={idx} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-3 lg:p-6 border border-gray-200 dark:border-white/20 text-center transform hover:scale-110 transition-all duration-300 ${stat.hoverColor} hover:shadow-2xl`}>
                  <div className={`w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-4 lg:w-7 h-4 lg:h-7 text-white" />
                  </div>
                  <div className="text-md md:text-xl lg:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mt-8">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 lg:gap-4 px-5 lg:px-10 py-2 lg:py-4 bg-gradient-to-r from-primary-400 text-secondary-500 to-pink-500 hover:from-primary-500 hover:via-primary-500 hover:to-pink-600 text-white rounded-2xl font-bold text-md lg:text-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-primary-500/50"
              >
                <FaGraduationCap className="w-4 lg:w-7 h-4 lg:h-7 group-hover:rotate-12 transition-transform duration-300" />
                <span>Login to Access Exams</span>
                <FaArrowRight className="w-4 lg:w-7 h-4 lg:h-7 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                <span className="font-semibold text-primary-600 dark:text-primary-400">100% Free</span> •
                <span className="mx-2">Login Required</span> •
                <span className="mx-2">Access After Login</span>
              </p>
            </div>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-20 left-5 w-24 h-24 bg-primary-400/20 dark:bg-primary-400/30 rounded-full blur-2xl animate-bounce pointer-events-none"></div>
          <div className="absolute bottom-20 right-5 w-40 h-40 bg-pink-400/20 dark:bg-pink-400/30 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
          <div className="absolute top-1/2 right-10 w-12 h-12 lg:w-16 lg:h-16 bg-cyan-400/20 dark:bg-cyan-400/30 rounded-full blur-xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
        </section>

        {/* Profile Completion Reward Section */}
        <section id="profile-completion" className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 pointer-events-none" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-4 md:mb-8 lg:mb-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-tr from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-6 shadow-xl animate-float">
                <FaUserGraduate className="text-white text-2xl sm:text-3xl md:text-4xl drop-shadow-lg" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 dark:text-white">
                  Complete Your Profile & Unlock Your Full Potential!
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Complete <strong className="text-green-600 dark:text-green-400">100% of your profile</strong> to instantly unlock a personalized quiz experience and track your progress effectively!
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    ✅ What You Need to Complete:
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaStar className="text-white text-xs sm:text-lg" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Full Name</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaStar className="text-white text-xs sm:text-lg" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Valid Email Address</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaStar className="text-white text-xs sm:text-lg" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">10-digit Phone No.</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaStar className="text-white text-xs sm:text-lg" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">One Social Media Link</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    🚀 What You Get:
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaStar className="text-white text-xs sm:text-lg" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Full Access to Free Plan (Levels 0-9)</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaStar className="text-white text-xs sm:text-lg" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Personalized Quiz Recommendations</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaStar className="text-white text-xs sm:text-lg" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Detailed Performance Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Pro User Wallet Section */}
        <section className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 pointer-events-none" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-4 md:mb-8 lg:mb-16">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 dark:text-white">
                  Add Questions
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                All users can create and contribute quality questions to help the community learn.
              </p>
            </div>

            <div className="container mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-3 lg:p-8 border border-green-200 dark:border-green-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">

                  {/* Left Side - Earning Process */}
                  <div className="space-y-6">
                    <div className="text-center lg:text-left">
                      <div className="w-12 lg:w-20 h-12 lg:h-20 mx-auto lg:mx-0 mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                        <span className="text-xl lg:text-3xl">💰</span>
                      </div>
                      <h3 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2 lg:mb-4">
                        Contribute Questions
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Create high-quality questions and contribute to the community.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          step: "1",
                          title: "Create Questions",
                          description: "Submit quiz questions through the plus Icon"
                        },
                        {
                          step: "2",
                          title: "Admin Review",
                          description: "Our team reviews and approves quality questions"
                        },
                        {
                          step: "3",
                          title: "Contribute",
                          description: "Contribute quality questions and help others learn"
                        }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {item.step}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - Stats & Info */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-2 lg:p-6 border border-green-200 dark:border-green-700">
                      <h4 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                        💡 How It Works
                      </h4>
                      <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Daily Question Limit</span>
                          <span className="font-bold text-green-600">Up to 5 Questions</span>
                        </div>
                        <div className="flex flex-col lg:flex-row items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Monthly Question Limit</span>
                          <span className="font-bold text-green-600">Up to 100 Questions</span>
                        </div>
                        <div className="flex flex-col lg:flex-row items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Question Contribution</span>
                          <span className="font-bold text-green-600">Contribute & Grow</span>
                        </div>

                      </div>

                    </div>

                    <div className="bg-gradient-to-br from-secondary-50 to-indigo-50 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-2xl p-2 lg:p-6 border border-secondary-200 dark:border-secondary-700">
                      <h4 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                        Extra Benefits
                      </h4>
                      <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                        <li className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>Create quality content</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>Help build the quiz community</span>
                        </li>

                        <li className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>Admin-reviewed quality standards</span>
                        </li>
                      </ul>
                    </div>

                    <div className="text-center">
                      <Link
                        href="/login"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <span className="mr-2">🚀</span>
                        Start Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>




        {/* Levels Section */}
        <section id="levels" className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-primary-50 to-red-50 dark:from-gray-900 dark:via-primary-900/20 dark:to-red-900/20 pointer-events-none" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-4 md:mb-8 lg:mb-16">
              <h2 className="text-xl -md:text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                  Progressive Learning Levels
                </span>
              </h2>
              <p className="text-md md:text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Start from Level 1 (Rookie) and progress through 10 levels. Reach Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} ({config.QUIZ_CONFIG.LEVEL_10_QUIZ_REQUIREMENT} total quiz attempts) and have {config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes to qualify for monthly rewards!
              </p>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
              {levels?.length > 0 ? levels.map((level, index) => {
                const levelColors = getLevelColors(level?.name);
                const levelInfo = levelsInfo?.find(
                  (info) => info?.level === level?.level
                );
                const playCount = levelInfo ? levelInfo?.quizzes : 0;
                return (
                  <div
                    key={level?._id || `level-${index}`}
                    className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 border shadow-lg hover:shadow-xl ${levelColors?.background} ${levelColors?.border} hover:border-primary-500`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 ${levelColors?.accent} rounded-full -translate-y-16 translate-x-16`}></div>

                    <div className="relative z-10 text-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${levelColors?.iconBg}`}>
                        {React.createElement(
                          levelBadgeIcons[level?.name] || levelBadgeIcons.Default,
                          {
                            className: `w-8 h-8 ${levelColors?.iconColor}`,
                          }
                        )}
                      </div>

                      <h3 className={`text-xl font-bold mb-2 ${levelColors?.titleColor} text-center`}>
                        Level {level?.level || 0} - {level?.name || "Unknown"}
                      </h3>
                      <p className={`text-sm mb-4 ${levelColors?.descriptionColor} text-center`}>
                        {level?.description ||
                          `Level ${level?.level || 0} challenges`}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">
                          <div className="text-lg font-bold text-primary-600">
                            {level?.quizCount || "N/A"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Total Quizzes
                          </div>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">
                          <div className="text-lg font-bold text-green-600">
                            {levelInfo?.plan || "-"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Plan
                          </div>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">
                          <div className="text-lg font-bold text-primary-600">
                            ₹{levelInfo?.amount || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Amount
                          </div>
                        </div>
                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">
                          <div className="text-lg font-bold text-primary-600">
                            ₹{levelInfo?.prize || 0}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Prize
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">

                        <div className="text-md text-gray-900 dark:text-white text-center mb-2 drop-shadow-sm">
                          <strong>{playCount} wins to level up!</strong>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg">
                    No levels data available
                  </div>
                </div>
              )}

              <div className="text-center mt-12">
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-2 px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300"
                >
                  <span>Start Your Journey</span>
                  <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-secondary-50 via-indigo-50 from-red-50 dark:from-gray-900 dark:via-secondary-900/20 dark:from-red-900/20 pointer-events-none" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-4 md:mb-8 lg:mb-16">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                  Explore Diverse Categories
                </span>
              </h2>
              <p className="text-md md:text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                From science to arts, technology to nature - discover quizzes that
                match your interests and expand your knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
              {categories?.length > 0 ? categories.map((category) => {
                const categoryColors = getCategoryColors(category?.name);
                return (
                  <div
                    key={category?._id || `category-${Math.random()}`}
                    className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 border shadow-lg hover:shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${categoryColors?.border} hover:border-primary-500`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 ${categoryColors?.accent} rounded-full -translate-y-16 translate-x-16 opacity-60`}></div>

                    <div className="relative z-10 text-center">
                      {/* Category Color Overlay */}
                      <div className={`absolute inset-0 ${categoryColors?.background} opacity-20 rounded-2xl pointer-events-none`}></div>

                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${categoryColors?.iconBg}`}>
                        {React.createElement(
                          categoryIcons[category.name] || categoryIcons.Default,
                          {
                            className: `w-8 h-8 ${categoryColors?.iconColor}`,
                          }
                        )}
                      </div>

                      <h3 className={`text-xl font-bold mb-2 ${categoryColors?.titleColor} text-center`}>{category?.name || "Unknown Category"}</h3>
                      <p className={`text-sm mb-4 ${categoryColors?.descriptionColor} text-center`}>
                        {category?.description ||
                          `Explore ${category?.name || "this"} knowledge`}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className={categoryColors?.labelColor}>
                          Quizzes:
                        </span>
                        <span className={`font-semibold ${categoryColors?.valueColor}`}>
                          {category?.quizCount || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg">
                    No categories data available
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Subscription Plans Section */}
        <section id="subscription" className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-violet-900/20 dark:to-indigo-900/20 pointer-events-none" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-4 md:mb-8 lg:mb-16">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                  Choose Your Perfect Plan
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                Unlock unlimited potential with our flexible subscription plans.
                All users start at Level 0 monthly and compete fairly!
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="relative rounded-md lg:rounded-2xl p-2 lg:p-4 xl:p-6 xxl:p-8 transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="text-center mb-8">
                  <h3 className="text-md lg:text-2xl font-bold mb-2">Free</h3>
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    ₹0
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Forever</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "Access to levels 0-3",
                    "Basic quiz categories",
                    "Monthly leaderboard access",
                    "Standard support",
                    "Basic analytics",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="block w-full text-center py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Get Started Free
                </Link>
              </div>



              {/* Pro Plan */}
              <div className="relative rounded-2xl p-2 lg:p-4 xl:p-6 xxl:p-8 transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-800 border-2 border-primary-500 shadow-xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </span>
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-md lg:text-2xl font-bold mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    ₹{config.SUBSCRIPTION_PLANS.PRO.price}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">per month</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "Access to all levels 0-10",
                    "Everything in Premium",
                    "AI-powered recommendations",
                    "24/7 priority support",
                    "Advanced analytics",
                    "Personal mentor access",
                    "Custom quiz creation",
                    "Exclusive monthly rewards",
                    "Early access features",
                    "Data export & API access",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="block w-full text-center py-3 px-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300"
                >
                  Start Pro Plan
                </Link>
              </div>
            </div>

            {/* Plan Comparison */}
            <div className="rounded-2xl p-2 md:-p-6 lg:p-6 xl:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
              <h3 className="text-md lg:text-2xl font-bold text-center mb-8">
                Plan Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-6 text-gray-700 dark:text-gray-300">
                        Features
                      </th>
                      <th className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">
                        Free
                      </th>
                      <th className="text-center py-4 px-6 text-gray-700 dark:text-gray-300">
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        feature: "Level Access",
                        free: "0-9",
                        pro: "0-10",
                      },
                      {
                        feature: "Categories Access",
                        free: "Free",
                        pro: "All",
                      },
                      {
                        feature: "Support",
                        free: "Basic",
                        pro: "24/7",
                      },
                      {
                        feature: "Analytics",
                        free: "Basic",
                        pro: "Advanced + Detailed",
                      },
                      {
                        feature: "Monthly Rewards",
                        free: "Not Eligible",
                        pro: "Eligible",
                      },
                    ].map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="py-4 px-6 font-medium text-gray-700 dark:text-gray-300">
                          {row.feature}
                        </td>
                        <td className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">
                          {row.free}
                        </td>
                        <td className="text-center py-4 px-6 text-gray-600 dark:text-gray-400">
                          {row.pro}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tl from-cyan-50 via-secondary-50 to-sky-50 dark:from-gray-900 dark:via-cyan-900/20 dark:to-sky-900/20 pointer-events-none" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-4 md:mb-8 lg:mb-16">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                  Why Choose AajExam?
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Experience the best quiz platform with monthly reset system, fair
                competition, and cutting-edge features designed for modern
                learners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
              {[
                {
                  icon: FaMobileAlt,
                  title: "Mobile First",
                  description:
                    "Optimized for all devices - learn anywhere, anytime",
                },
                {
                  icon: FaShieldAlt,
                  title: "Secure Platform",
                  description: "Your data and progress are completely secure",
                },
                {
                  icon: FaHeadset,
                  title: "24/7 Support",
                  description: "Get help whenever you need it",
                },
                {
                  icon: FaDesktop,
                  title: "Cross Platform",
                  description: "Seamless experience across all devices",
                },
                {
                  icon: FaTabletAlt,
                  title: "Responsive Design",
                  description: "Perfect experience on any screen size",
                },
                {
                  icon: FaGift,
                  title: "Monthly Rewards",
                  description: `Compete monthly for a dynamic prize pool (active PRO users × ₹${process.env.NEXT_PUBLIC_PRIZE_PER_PRO || 90})`,
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 shadow-lg hover:shadow-xl"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-primary-100 dark:bg-gray-700">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-100 via-primary-100 to-red-100 dark:from-gray-800 dark:via-primary-800/30 dark:to-red-800/30 pointer-events-none" />
          <div className="relative p-4 px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                Ready to Start Your Learning Journey?
              </span>
            </h2>
            <p className="text-md md:text-xl mb-8 text-gray-600 dark:text-gray-300">
              Join thousands of students who are already improving their knowledge
              monthly and competing for a dynamic prize pool every month!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-4 md:px-8 py-2 md:py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                href="/how-it-works"
                className="px-4 md:px-8 py-2 md:py-4 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-xl font-semibold text-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-all duration-300"
              >
                Learn More
              </Link>
              <Link
                href="/articles"
                className="px-4 md:px-8 py-2 md:py-4 border-2 border-secondary-600 text-secondary-600 dark:text-secondary-400 rounded-xl font-semibold text-lg hover:bg-secondary-600 hover:text-white dark:hover:bg-secondary-600 dark:hover:text-white transition-all duration-300"
              >
                📝 Articles
              </Link>
            </div>
          </div>
        </section>

        {/* Unified Footer */}
        <UnifiedFooter isLandingPage={true} />
      </div>
    </MobileAppWrapper>
  );
};

// Level color mappings for both light and dark modes
const getLevelColors = (levelName) => {
  const colors = {
    Starter: {
      background: 'bg-gradient-to-br from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20',
      border: 'border-secondary-200 dark:border-secondary-700',
      accent: 'bg-gradient-to-br from-secondary-500/20 to-indigo-500/20',
      iconBg: 'bg-secondary-100 dark:bg-secondary-800',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      titleColor: 'text-secondary-800 dark:text-secondary-200',
      descriptionColor: 'text-secondary-700 dark:text-secondary-300',
      labelColor: 'text-secondary-600 dark:text-secondary-400',
      valueColor: 'text-secondary-800 dark:text-secondary-200'
    },
    Rookie: {
      background: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-700',
      accent: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      iconBg: 'bg-green-100 dark:bg-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-200',
      descriptionColor: 'text-green-700 dark:text-green-300',
      labelColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-800 dark:text-green-200'
    },
    Explorer: {
      background: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      accent: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
      iconBg: 'bg-purple-100 dark:bg-purple-800',
      iconColor: 'text-primary-600 dark:text-primary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-700 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-primary-400',
      valueColor: 'text-primary-800 dark:text-primary-200'
    },
    Thinker: {
      background: 'bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20',
      border: 'border-primary-200 dark:border-primary-700',
      accent: 'bg-gradient-to-br from-primary-500/20 to-amber-500/20',
      iconBg: 'bg-primary-100 dark:bg-primary-800',
      iconColor: 'text-primary-600 dark:text-secondary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-600 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-secondary-400',
      valueColor: 'text-primary-800 dark:text-primary-200'
    },
    Strategist: {
      background: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
      border: 'border-teal-200 dark:border-teal-700',
      accent: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20',
      iconBg: 'bg-teal-100 dark:bg-teal-800',
      iconColor: 'text-teal-600 dark:text-teal-400',
      titleColor: 'text-teal-800 dark:text-teal-200',
      descriptionColor: 'text-teal-700 dark:text-teal-300',
      labelColor: 'text-teal-600 dark:text-teal-400',
      valueColor: 'text-teal-800 dark:text-teal-200'
    },
    Achiever: {
      background: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      border: 'border-red-200 dark:border-red-700',
      accent: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
      iconBg: 'bg-red-100 dark:bg-red-800',
      iconColor: 'text-primary-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      descriptionColor: 'text-red-700 dark:text-red-300',
      labelColor: 'text-primary-600 dark:text-red-400',
      valueColor: 'text-red-800 dark:text-red-200'
    },
    Mastermind: {
      background: 'bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20',
      border: 'border-indigo-200 dark:border-indigo-700',
      accent: 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-800',
      iconColor: 'text-primary-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      descriptionColor: 'text-red-700 dark:text-red-300',
      labelColor: 'text-primary-600 dark:text-red-400',
      valueColor: 'text-red-800 dark:text-red-200'
    },
    Champion: {
      background: 'bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20',
      border: 'border-primary-200 dark:border-primary-700',
      accent: 'bg-gradient-to-br from-primary-500/20 to-primary-500/20',
      iconBg: 'bg-primary-100 dark:bg-primary-800',
      iconColor: 'text-primary-600 dark:text-primary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-700 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-primary-400',
      valueColor: 'text-primary-800 dark:text-primary-200'
    },
    Prodigy: {
      background: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      accent: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-800 dark:text-emerald-200',
      descriptionColor: 'text-emerald-700 dark:text-emerald-300',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-800 dark:text-emerald-200'
    },
    Wizard: {
      background: 'bg-gradient-to-br from-violet-50 from-red-50 dark:from-violet-900/20 dark:from-red-900/20',
      border: 'border-violet-200 dark:border-violet-700',
      accent: 'bg-gradient-to-br from-violet-500/20 from-red-500/20',
      iconBg: 'bg-violet-100 dark:bg-violet-800',
      iconColor: 'text-violet-600 dark:text-violet-400',
      titleColor: 'text-violet-800 dark:text-violet-200',
      descriptionColor: 'text-violet-700 dark:text-violet-300',
      labelColor: 'text-violet-600 dark:text-violet-400',
      valueColor: 'text-violet-800 dark:text-violet-200'
    },
    Legend: {
      background: 'bg-gradient-to-br from-amber-50 to-primary-50 dark:from-amber-900/20 dark:to-primary-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      accent: 'bg-gradient-to-br from-amber-500/20 to-primary-500/20',
      iconBg: 'bg-amber-100 dark:bg-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-800 dark:text-amber-200',
      descriptionColor: 'text-amber-700 dark:text-amber-300',
      labelColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-800 dark:text-amber-200'
    }
  };

  return colors[levelName] || colors.Starter; // Default to Starter colors if level not found
};

// Category color mappings for both light and dark modes
const getCategoryColors = (categoryName) => {
  const colors = {
    "General Knowledge": {
      background: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      border: 'border-gray-200 dark:border-gray-700',
      accent: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      titleColor: 'text-gray-800 dark:text-gray-200',
      descriptionColor: 'text-gray-700 dark:text-gray-300',
      labelColor: 'text-gray-600 dark:text-gray-400',
      valueColor: 'text-gray-800 dark:text-gray-200'
    },
    "Current Affairs": {
      background: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      border: 'border-red-200 dark:border-red-700',
      accent: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
      iconBg: 'bg-red-100 dark:bg-red-800',
      iconColor: 'text-primary-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      descriptionColor: 'text-red-700 dark:text-red-300',
      labelColor: 'text-primary-600 dark:text-red-400',
      valueColor: 'text-red-800 dark:text-red-200'
    },
    "Science": {
      background: 'bg-gradient-to-br from-secondary-50 to-cyan-50 dark:from-secondary-900/20 dark:to-cyan-900/20',
      border: 'border-secondary-200 dark:border-secondary-700',
      accent: 'bg-gradient-to-br from-secondary-500/20 to-cyan-500/20',
      iconBg: 'bg-secondary-100 dark:bg-secondary-800',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      titleColor: 'text-secondary-800 dark:text-secondary-200',
      descriptionColor: 'text-secondary-700 dark:text-secondary-300',
      labelColor: 'text-secondary-600 dark:text-secondary-400',
      valueColor: 'text-secondary-800 dark:text-secondary-200'
    },
    "Mathematics": {
      background: 'bg-gradient-to-br from-primary-50 to-red-50 dark:from-primary-900/20 dark:to-red-900/20',
      border: 'border-primary-200 dark:border-primary-700',
      accent: 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20',
      iconBg: 'bg-primary-100 dark:bg-primary-800',
      iconColor: 'text-primary-600 dark:text-secondary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-600 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-secondary-400',
      valueColor: 'text-primary-800 dark:text-primary-200'
    },
    "History": {
      background: 'bg-gradient-to-br from-amber-50 to-primary-50 dark:from-amber-900/20 dark:to-primary-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      accent: 'bg-gradient-to-br from-amber-500/20 to-primary-500/20',
      iconBg: 'bg-amber-100 dark:bg-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-800 dark:text-amber-200',
      descriptionColor: 'text-amber-700 dark:text-amber-300',
      labelColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-800 dark:text-amber-200'
    },
    "Geography": {
      background: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-700',
      accent: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      iconBg: 'bg-green-100 dark:bg-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-200',
      descriptionColor: 'text-green-700 dark:text-green-300',
      labelColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-800 dark:text-green-200'
    },
    "Sports": {
      background: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      accent: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-800 dark:text-emerald-200',
      descriptionColor: 'text-emerald-700 dark:text-emerald-300',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-800 dark:text-emerald-200'
    },
    "Entertainment": {
      background: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      border: 'border-pink-200 dark:border-pink-700',
      accent: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
      iconBg: 'bg-pink-100 dark:bg-pink-800',
      iconColor: 'text-pink-600 dark:text-pink-400',
      titleColor: 'text-pink-800 dark:text-pink-200',
      descriptionColor: 'text-pink-700 dark:text-pink-300',
      labelColor: 'text-pink-600 dark:text-pink-400',
      valueColor: 'text-pink-800 dark:text-pink-200'
    },
    "Technology": {
      background: 'bg-gradient-to-br from-primary-50 from-red-50 dark:from-primary-900/20 dark:from-red-900/20',
      border: 'border-indigo-200 dark:border-indigo-700',
      accent: 'bg-gradient-to-br from-primary-500/20 from-red-500/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-800',
      iconColor: 'text-primary-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      descriptionColor: 'text-red-700 dark:text-red-300',
      labelColor: 'text-primary-600 dark:text-red-400',
      valueColor: 'text-red-800 dark:text-red-200'
    },
    "Literature & Language": {
      background: 'bg-gradient-to-br from-violet-50 from-red-50 dark:from-violet-900/20 dark:from-red-900/20',
      border: 'border-violet-200 dark:border-violet-700',
      accent: 'bg-gradient-to-br from-violet-500/20 from-red-500/20',
      iconBg: 'bg-violet-100 dark:bg-violet-800',
      iconColor: 'text-violet-600 dark:text-violet-400',
      titleColor: 'text-violet-800 dark:text-violet-200',
      descriptionColor: 'text-violet-700 dark:text-violet-300',
      labelColor: 'text-violet-600 dark:text-violet-400',
      valueColor: 'text-violet-800 dark:text-violet-200'
    },
    "Competitive Exams": {
      background: 'bg-gradient-to-br from-sky-50 to-secondary-50 dark:from-sky-900/20 dark:to-secondary-900/20',
      border: 'border-sky-200 dark:border-sky-700',
      accent: 'bg-gradient-to-br from-sky-500/20 to-secondary-500/20',
      iconBg: 'bg-sky-100 dark:bg-sky-800',
      iconColor: 'text-sky-600 dark:text-sky-400',
      titleColor: 'text-sky-800 dark:text-sky-200',
      descriptionColor: 'text-sky-700 dark:text-sky-300',
      labelColor: 'text-sky-600 dark:text-sky-400',
      valueColor: 'text-sky-800 dark:text-sky-200'
    },
    "Economics": {
      background: 'bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20',
      border: 'border-primary-200 dark:border-primary-700',
      accent: 'bg-gradient-to-br from-primary-500/20 to-amber-500/20',
      iconBg: 'bg-primary-100 dark:bg-primary-800',
      iconColor: 'text-primary-600 dark:text-primary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-700 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-primary-400',
      valueColor: 'text-primary-800 dark:text-primary-200'
    },
    "Travel": {
      background: 'bg-gradient-to-br from-cyan-50 to-secondary-50 dark:from-cyan-900/20 dark:to-secondary-900/20',
      border: 'border-cyan-200 dark:border-cyan-700',
      accent: 'bg-gradient-to-br from-cyan-500/20 to-secondary-500/20',
      iconBg: 'bg-cyan-100 dark:bg-cyan-800',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      titleColor: 'text-cyan-800 dark:text-cyan-200',
      descriptionColor: 'text-cyan-700 dark:text-cyan-300',
      labelColor: 'text-cyan-600 dark:text-cyan-400',
      valueColor: 'text-cyan-800 dark:text-cyan-200'
    },
    "Social": {
      background: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      accent: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20',
      iconBg: 'bg-purple-100 dark:bg-purple-800',
      iconColor: 'text-primary-600 dark:text-primary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-700 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-primary-400',
      valueColor: 'text-primary-800 dark:text-primary-200'
    },
    "News": {
      background: 'bg-gradient-to-br from-red-50 to-primary-50 dark:from-red-900/20 dark:to-primary-900/20',
      border: 'border-red-200 dark:border-red-700',
      accent: 'bg-gradient-to-br from-red-500/20 to-primary-500/20',
      iconBg: 'bg-red-100 dark:bg-red-800',
      iconColor: 'text-primary-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      descriptionColor: 'text-red-700 dark:text-red-300',
      labelColor: 'text-primary-600 dark:text-red-400',
      valueColor: 'text-red-800 dark:text-red-200'
    },
    "Miscellaneous": {
      background: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20',
      border: 'border-slate-200 dark:border-slate-700',
      accent: 'bg-gradient-to-br from-slate-500/20 to-gray-500/20',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      titleColor: 'text-slate-800 dark:text-slate-200',
      descriptionColor: 'text-slate-700 dark:text-slate-300',
      labelColor: 'text-slate-600 dark:text-slate-400',
      valueColor: 'text-slate-800 dark:text-slate-200'
    },
    "Gaming": {
      background: 'bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20',
      border: 'border-fuchsia-200 dark:border-fuchsia-700',
      accent: 'bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20',
      iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-800',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      titleColor: 'text-fuchsia-800 dark:text-fuchsia-200',
      descriptionColor: 'text-fuchsia-700 dark:text-fuchsia-300',
      labelColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      valueColor: 'text-fuchsia-800 dark:text-fuchsia-200'
    }
  };
  return colors[categoryName] || colors["General Knowledge"]; // Default to General Knowledge colors if category not found
};

// Icon mappings
const categoryIcons = {
  "General Knowledge": FaBook,
  "Current Affairs": FaNewspaper,
  "Science": FaFlask,
  "Mathematics": FaCalculator,
  "History": FaHistory,
  "Geography": FaGlobe,
  "Sports": FaFutbol,
  "Entertainment": FaFilm,
  "Technology": FaLaptopCode,
  "Literature & Language": FaLanguage,
  "Competitive Exams": FaGraduationCap,
  "Economics": FaBriefcase,
  "Travel": FaPlane,
  "Social": FaComments,
  "News": FaNewspaper,
  "Miscellaneous": FaTh,
  "Gaming": FaGamepad,
  Default: FaBook,
};

const levelBadgeIcons = {
  Starter: FaUserGraduate,
  Rookie: FaStar,
  Explorer: FaRocket,
  Thinker: FaBrain,
  Strategist: FaChartLine,
  Achiever: FaAward,
  Mastermind: FaGem,
  Champion: FaTrophy,
  Prodigy: FaMedal,
  Wizard: FaMagic,
  Legend: FaCrown,
  Default: FaStar,
};

// Level play count info for display (cumulative quiz attempts, monthly pricing)
const levelsInfo = [
  { level: 1, quizzes: 4, plan: "Free", amount: 0, prize: 0 },
  { level: 2, quizzes: 12, plan: "Free", amount: 0, prize: 0 },
  { level: 3, quizzes: 24, plan: "Free", amount: 0, prize: 0 },
  { level: 4, quizzes: 40, plan: "Free", amount: 0, prize: 0 },
  { level: 5, quizzes: 60, plan: "Free", amount: 0, prize: 0 },
  { level: 6, quizzes: 84, plan: "Free", amount: 0, prize: 0 },
  { level: 7, quizzes: 112, plan: "Free", amount: 0, prize: 0 },
  { level: 8, quizzes: 144, plan: "Free", amount: 0, prize: 0 },
  { level: 9, quizzes: 180, plan: "Free", amount: 0, prize: 0 },
  { level: 10, quizzes: config.QUIZ_CONFIG.LEVEL_10_QUIZ_REQUIREMENT, plan: "Pro", amount: 99, prize: 'Dynamic' },
];

export default LandingPage;









