'use client';

import config from '../../../lib/config/appConfig';

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useGlobalError } from "../../../contexts/GlobalErrorContext";
import { useTokenValidation } from "../../../hooks/useTokenValidation";
import { useSSR } from '../../../hooks/useSSR';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import {
  FaDownload,
  FaFilter,
} from "react-icons/fa";
import Sidebar from "../../Sidebar";
import ViewToggle from "../../ViewToggle";

import { useSelector } from "react-redux";
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

function exportCSV(data, filename) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));
  for (const row of data) {
    csvRows.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  }
  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const PerformanceAnalytics = () => {
  // All hooks must be called at the top level
  const { isMounted, isRouterReady, router } = useSSR();
  // Set default view based on screen size: grid for mobile, table for desktop
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "grid" : "table";
    }
    return "table";
  });
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ period: "month" });
  const [activeTab, setActiveTab] = useState('monthly'); // Competition Type Tab
  const [topPerformers, setTopPerformers] = useState([]);
  const [topPerformersLoading, setTopPerformersLoading] = useState(false);

  const [darkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });

  // Global error context
  const { checkRateLimitError } = useGlobalError();

  // Token validation
  const { validateTokenBeforeRequest } = useTokenValidation();
  console.log(data, "data");

  // Handle window resize to update view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "table") {
        setViewMode("grid");
      } else if (window.innerWidth >= 768 && viewMode === "grid") {
        setViewMode("table");
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);
  useEffect(() => {
    // Validate token before making API call
    if (!validateTokenBeforeRequest()) {
      return;
    }

    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    API.getPerformanceAnalytics({ ...filters, limit: config.QUIZ_CONFIG.ADMIN_TOP_PERFORMERS_USERS })
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          // Check if it's a rate limit error first
          const errorMessage = res.message || "Failed to load performance analytics";

          if (checkRateLimitError(errorMessage)) {
            // Rate limit error is handled globally, just set local error
            setError("Rate limit reached. Please wait or login for higher limits.");
          } else {
            // Show other backend errors
            setError(errorMessage);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);

        // Check if it's a rate limit error first
        if (err.message && checkRateLimitError(err.message)) {
          // Rate limit error is handled globally, just set local error
          setError("Rate limit reached. Please wait or re login after some time for higher limits.");
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError("Network Error: Unable to connect to server. Please check if the backend is running.");
        } else if (err.message) {
          setError(`Error: ${err.message}`);
        } else {
          setError("Failed to load performance analytics. Please try again.");
        }
    setLoading(false);
      });
  }, [filters, checkRateLimitError, validateTokenBeforeRequest]);

  // Fetch Top Performers based on Active Tab
  useEffect(() => {
    if (!validateTokenBeforeRequest()) return;

    setTopPerformersLoading(true);
    API.getAdminTopPerformers({ type: activeTab, limit: config.QUIZ_CONFIG.ADMIN_TOP_PERFORMERS_USERS })
      .then((res) => {
        if (res.success) {
          setTopPerformers(res.data);
        }
        setTopPerformersLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching top performers:", err);
        setTopPerformersLoading(false);
      });
  }, [activeTab, validateTokenBeforeRequest]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getSortedTopPerformers = () => {
    const list = topPerformers || [];
    if (!list.length) return [];

    let sortedPerformers = [...list];
    switch (filters.sortBy) {
      case 'highScores':
        sortedPerformers = sortedPerformers.sort((a, b) => (b.level?.highScoreQuizzes || 0) - (a.level?.highScoreQuizzes || 0));
        break;
      case 'avgScore':
        sortedPerformers = sortedPerformers.sort((a, b) => (b.level?.accuracy || 0) - (a.level?.accuracy || 0));
        break;
      case 'quizzesPlayed':
        sortedPerformers = sortedPerformers.sort((a, b) => (b.level?.quizzesPlayed || 0) - (a.level?.quizzesPlayed || 0));
        break;
      default:
        // Already sorted by backend for the specific type
        break;
    }

    return sortedPerformers;
  };

  const handleExport = () => {
    if (!data?.topPerformers?.length) return;
    const rows = data.topPerformers.map((p) => ({
      Name: p.name || "Unknown",
      Level: p.level?.currentLevel || 0,
      "High Score Wins": p.monthlyProgress?.highScoreWins || 0,
      "Accuracy": p.monthlyProgress?.accuracy || 0,
      "Total Quizzes": p.monthlyProgress?.totalQuizAttempts || 0,
    }));
    exportCSV(rows, "top_performers.csv");
  };

  if (loading) return <Loading fullScreen={true} size="lg" color="yellow" message="" />;

  if (error)
    return (
      <div
        className={`min-h-screen p-6`}
      >
        <div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="text-red-800 dark:text-red-200 text-lg mb-4">
              ⚠️ {error}
            </div>
            <div className="text-sm text-red-600 dark:text-red-300 mb-4">
              This could be due to:
              <ul className="list-disc list-inside mt-2">
                <li>Backend server not running</li>
                <li>Network connectivity issues</li>
                <li>Rate limiting from backend</li>
                <li>Authentication issues</li>
                <li>Backend service errors</li>
              </ul>
            </div>
            <Button
              variant="admin"
              onClick={() => window.location.reload()}
            >
              🔄 Retry
            </Button>
          </div>
        </div>
      </div>
    );

  if (!data)
    return (
      <div
        className={`min-h-screenp-6`}
      >
        <div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10">
          <div className="text-center text-gray-500">No data available</div>
        </div>
      </div>
    );
  const isDark = document.documentElement.classList.contains("dark");

  const chartTextColor = isDark ? "#ffffff" : "#000000";
  // Chart data
  const levelLabels = data.levelPerformance?.map((l) => `Level ${l._id}`) || [];
  const levelScores = data.levelPerformance?.map((l) => l.avgScore) || [];
  const levelUsers = data.levelPerformance?.map((l) => l.userCount) || [];

  const levelScoreBarData = {
    labels: levelLabels,
    datasets: [
      {
        label: "Average Score",
        data: levelScores,
        backgroundColor: darkMode
          ? "rgba(59, 130, 246, 0.8)"
          : "rgba(59, 130, 246, 0.7)",
        borderColor: darkMode
          ? "rgba(59, 130, 246, 1)"
          : "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const levelUserBarData = {
    labels: levelLabels,
    datasets: [
      {
        label: "Users",
        data: levelUsers,
        backgroundColor: darkMode
          ? "rgba(139, 92, 246, 0.8)"
          : "rgba(139, 92, 246, 0.7)",
        borderColor: darkMode
          ? "rgba(139, 92, 246, 1)"
          : "rgba(139, 92, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: chartTextColor,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: chartTextColor,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const sortedCategory = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data.sort((a, b) => b.attemptCount - a.attemptCount);
  }

  return (
    <AdminMobileAppWrapper title="Performance Analytics">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="border p-3 lg:p-6 rounded-xl shadow-lg mb-8 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-3xl font-bold mb-2">Performance Analytics</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive analysis of user performance and learning progress
                </p>
              </div>

              {/* Filters and Export */}

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <FaFilter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <select
                  name="period"
                  value={filters.period}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="quarter">Last 3 months</option>
                  <option value="year">Last 12 months</option>
                </select>

                <select
                  name="sortBy"
                  value={filters.sortBy || 'highScores'}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="highScores">Sort by High Score Wins</option>
                  <option value="avgScore">Sort by Accuracy</option>
                  <option value="totalScore">Sort by Total Score</option>
                  <option value="quizzesPlayed">Sort by Monthly Quizzes Played</option>
                </select>
                <Button
                  variant="admin"
                  onClick={handleExport}
                  className="flex items-center gap-2 transition-colors duration-200"
                >
                  <FaDownload className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Level Performance */}
            <div className="rounded-xl border p-3 lg:p-6 shadow-lg bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Level Performance
              </h3>
              {levelLabels.length > 0 ? (
                <Bar data={levelScoreBarData} options={chartOptions} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>

            {/* Users per Level */}
            <div className="rounded-xl border p-3 lg:p-6 shadow-lg bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Users per Level
              </h3>
              {levelLabels.length > 0 ? (
                <Bar data={levelUserBarData} options={chartOptions} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="space-y-6">


            {/* High Scores Summary */}
            <div className="rounded-xl border p-3 lg:p-6 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                    High Scores Overview
                  </h3>
                </div>

                {/* Top High Score Achiever */}
                {getSortedTopPerformers().length > 0 && (
                  <div className="mt-4 md:mt-0 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-600">
                    <div className="text-center">
                      <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        🥇 Top Achiever
                      </div>
                      <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                        {getSortedTopPerformers()[0]?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-orange-700 dark:text-yellow-400">
                        {getSortedTopPerformers()[0]?.level?.highScoreQuizzes || 0} High Scores
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-2 lg:p-4 rounded-lg border border-green-200 dark:border-green-600">
                  <div className="text-center">
                    <div className="text-md lg:text-2xl font-bold text-green-600 dark:text-green-400">
                      {getSortedTopPerformers().reduce((sum, p) => sum + (p.level?.highScoreQuizzes || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-green-400 font-medium">
                      Total High Scores
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-2 lg:p-4 rounded-lg border border-green-200 dark:border-green-600">
                  <div className="text-center">
                    <div className="text-md lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {getSortedTopPerformers().filter(p => (p.level?.highScoreQuizzes || 0) > 0).length || 0}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Students with High Scores
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-2 lg:p-4 rounded-lg border border-green-200 dark:border-green-600">
                  <div className="text-center">
                    <div className="text-md lg:text-2xl font-bold text-orange-700 dark:text-yellow-400">
                      {getSortedTopPerformers().length > 0 ?
                        (getSortedTopPerformers().reduce((sum, p) => sum + (p.level?.highScoreQuizzes || 0), 0) / getSortedTopPerformers().length).toFixed(1) :
                        "0.0"
                      }
                    </div>
                    <div className="text-sm text-orange-700 dark:text-yellow-400 font-medium">
                      Avg High Scores per Student
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-2 lg:p-4 rounded-lg border border-green-200 dark:border-green-600">
                  <div className="text-center">
                    <div className="text-md lg:text-md lg:text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {getSortedTopPerformers().reduce((sum, p) => sum + (p.level?.quizzesPlayed || 0), 0)}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                      Total Quizzes Attempted
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers Tabs */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === 'daily'
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700"
                    }`}
                >
                  <span className="text-lg">📅</span> Daily
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === 'weekly'
                    ? "bg-purple-600 text-white shadow-lg scale-105"
                    : "text-gray-500 hover:text-purple-600 hover:bg-white dark:hover:bg-gray-700"
                    }`}
                >
                  <span className="text-lg">🗓️</span> Weekly
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === 'monthly'
                    ? "bg-amber-500 text-white shadow-lg scale-105"
                    : "text-gray-500 hover:text-amber-600 hover:bg-white dark:hover:bg-gray-700"
                    }`}
                >
                  <span className="text-lg">🏆</span> Monthly
                </button>
              </div>
            </div>


            {/* Top Performers */}
            <div className="rounded-xl border p-3 lg:p-6 shadow-lg bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden">
              {topPerformersLoading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row justify-between items-center mb-4">
                <div>
                  <h3 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                    🏆 Top {config.QUIZ_CONFIG.ADMIN_TOP_PERFORMERS_USERS} Performers {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {filters.sortBy ?
                      `Sorted by ${filters.sortBy === 'highScores' ? 'High Score Wins' :
                        filters.sortBy === 'avgScore' ? 'Accuracy' :
                          filters.sortBy === 'totalScore' ? 'Total Score' :
                            filters.sortBy === 'quizzesPlayed' ? 'Monthly Quizzes Played' : 'High Score Wins'}` :
                      'Ranked by High Score Wins (Primary), Accuracy (Secondary), Monthly Quizzes Played (Tertiary)'
                    }
                  </p>
                </div>
                {/* View Toggle */}
                <div className="flex justify-end mt-4 lg:mt-0 mb-0 lg:mb-4">
                  <ViewToggle
                    currentView={viewMode}
                    onViewChange={setViewMode}
                    views={['table', 'list', 'grid']}
                  />
                </div>
              </div>

              {viewMode === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <th className="py-4 px-4 text-left text-blue-800 dark:text-blue-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🏆</span>
                            Rank
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-blue-800 dark:text-blue-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">👤</span>
                            Student
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-blue-800 dark:text-blue-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📈</span>
                            Level
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-blue-800 dark:text-blue-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">💎</span>
                            Plan
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-blue-800 dark:text-blue-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📚</span>
                            Quizzes
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-blue-800 dark:text-blue-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⭐</span>
                            High Score
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-yellow-800 dark:text-yellow-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            Accuracy
                          </div>
                        </th>

                        <th className="py-4 px-4 text-left text-blue-800 dark:text-blue-200 font-bold text-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🏅</span>
                            Total Score
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedTopPerformers()?.map((p, i) => {

                        return (
                          <tr
                            key={i}
                            className={`border-b transition-all duration-200 border-gray-200 hover:shadow-lg group ${i === 0 ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10" :
                              i === 1 ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10" :
                                i === 2 ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10" :
                                  "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10"
                              }`}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full  flex items-center justify-center text-white font-bold text-lg shadow-lg ${i === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                                  i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500" :
                                    i === 2 ? "bg-gradient-to-r from-orange-400 to-amber-500" :
                                      "bg-gradient-to-r from-blue-400 to-indigo-500"
                                  }`}>
                                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                                </div>
                                {i < 3 && (
                                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {i === 0 ? "Champion" : i === 1 ? "Runner-up" : "3rd Place"}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                                  <span className="text-xl text-blue-600 dark:text-blue-400">
                                    {p.name?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-lg">
                                    {p.name || "Unknown"}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {p.email || "No email"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                                  <span className="text-green-600 dark:text-green-400 text-sm">📈</span>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">
                                    {p.level?.levelName || "No Level"}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Level {p.level?.currentLevel || 0}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`px-3 py-2 rounded-lg font-semibold text-sm ${p?.subscriptionStatus === 'pro' ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-600" :

                                  "bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                                  }`}>
                                  {p?.subscriptionStatus?.toUpperCase() === "PRO" ? "PRO" : "FREE"}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 dark:text-blue-400 text-sm">📚</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                  {p.level?.quizzesPlayed || 0}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                                  <span className="text-orange-700 dark:text-yellow-400 text-sm">⭐</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                                    {p.level?.highScoreQuizzes || 0}
                                  </span>
                                  {(p.level?.highScoreQuizzes || 0) > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                      🏆
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                                  <span className="text-orange-700 dark:text-yellow-400 text-sm">🎯</span>
                                </div>
                                <span className={`font-bold text-lg ${(p.level?.accuracy || 0) >= 80 ? 'text-green-600 dark:text-green-400' :
                                  (p.level?.accuracy || 0) >= 70 ? 'text-blue-600 dark:text-blue-400' :
                                    (p.level?.accuracy || 0) >= 60 ? 'text-orange-700 dark:text-yellow-400' :
                                      'text-red-600 dark:text-red-400'
                                  }`}>
                                  {p.level?.accuracy || 0}%
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg flex items-center justify-center">
                                  <span className="text-orange-700 dark:text-orange-400 text-sm">🏅</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                  {p.level?.totalScore?.toFixed(2) || "0.00"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {viewMode === "list" && (
                <div className="space-y-4">
                  {getSortedTopPerformers()?.map((p, i) => (
                    <div
                      key={i}
                      className={`flex flex-col md:flex-row justify-between p-2 lg:p-4 rounded-lg border dark:border-gray-600 transition-all duration-200 ${i === 0
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-600 shadow-lg"
                        : i === 1
                          ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-600 shadow-md"
                          : i === 2
                            ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-600 shadow-md"
                            : "bg-gray-50 dark:bg-gray-700"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-8 h-8 text-sm flex items-center justify-center rounded-full font-semibold ${i === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : i === 1
                              ? "bg-gray-100 text-gray-800"
                              : i === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                        >
                          {i === 0 ? "👑" : i + 1}
                        </span>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {p.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {p.level?.levelName || "No Level"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 mt-2 md:mt-0">
                        {/* High Score Highlight */}
                        <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-800 dark:text-green-200">
                              {p.level?.highScoreQuizzes || 0}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              High Scores
                            </div>
                          </div>
                        </div>

                        {/* Score Details */}
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Total Score:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                              {p.level?.totalScore?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Accuracy:</span>
                            <span className={`font-bold ${(p.level?.accuracy || 0) >= 80 ? 'text-green-600 dark:text-green-400' :
                              (p.level?.accuracy || 0) >= 70 ? 'text-blue-600 dark:text-blue-400' :
                                (p.level?.accuracy || 0) >= 60 ? 'text-orange-700 dark:text-yellow-400' :
                                  'text-red-600 dark:text-red-400'
                              }`}>
                              {p.level?.accuracy || 0}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Quizzes:</span>
                            <span className="text-orange-700 dark:text-orange-400 font-bold">
                              {p.level?.quizzesPlayed || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === "grid" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSortedTopPerformers()?.map((p, i) => (
                    <div
                      key={i}
                      className={`p-2 lg:p-4 rounded-lg border dark:border-gray-600 hover:shadow-lg transition-all duration-200 ${i === 0
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-600 shadow-lg"
                        : i === 1
                          ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-600 shadow-md"
                          : i === 2
                            ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-600 shadow-md"
                            : "bg-gray-50 dark:bg-gray-700"
                        }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <span
                          className={`w-8 h-8 text-sm flex items-center justify-center rounded-full font-semibold ${i === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : i === 1
                              ? "bg-gray-100 text-gray-800"
                              : i === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                        >
                          {i === 0 ? "👑" : i + 1}
                        </span>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{p.name || "Unknown"}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {p.level?.levelName || "No Level"}
                          </p>
                        </div>
                      </div>

                      {/* High Score Badge */}
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3 rounded-lg mb-3 border border-green-200 dark:border-green-700">
                        <div className="text-center">
                          <div className="text-md lg:text-2xl font-bold text-green-800 dark:text-green-200">
                            {p.level?.highScoreQuizzes || 0}
                          </div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            🏆 High Score Quizzes
                          </div>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Total Quizzes:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {p.level?.quizzesPlayed || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                          <span className={`font-semibold ${(p.level?.accuracy || 0) >= 80 ? 'text-green-600 dark:text-green-400' :
                            (p.level?.accuracy || 0) >= 70 ? 'text-blue-600 dark:text-blue-400' :
                              (p.level?.accuracy || 0) >= 60 ? 'text-orange-700 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                            }`}>
                            {p.level?.accuracy || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Total Score:</span>
                          <span className="font-semibold text-orange-700 dark:text-orange-400">
                            {p.level?.totalScore?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}


            </div>
          </div>
          <div className="rounded-xl border p-3 lg:p-6 shadow-lg bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <div className="flex mb-4 md:mb-0 items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                    Category Performance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Performance metrics across different quiz categories
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-600">
                  <span className="text-yellow-800 dark:text-yellow-200 font-semibold text-md">
                    Total Categories: {data?.categoryPerformance?.length || 0}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-600">
                  <span className="text-blue-800 dark:text-blue-200 font-semibold text-md">
                    Total Attempts: {data?.categoryPerformance?.reduce((sum, cat) => sum + (cat.attemptCount || 0), 0) || 0}
                  </span>
                </div>
              </div>
            </div>

            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-[1000px] md:w-full">
                  <thead>
                    <tr className="border-b-2 border-purple-200 dark:border-purple-700">
                      <th className="text-left py-4 px-4 font-bold text-yellow-800 dark:text-yellow-200 text-lg">
                        #
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-yellow-800 dark:text-yellow-200 text-lg">
                        Category
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-yellow-800 dark:text-yellow-200 text-lg">
                        Attempts
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-yellow-800 dark:text-yellow-200 text-lg">
                        Avg. Score
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-yellow-800 dark:text-yellow-200 text-lg">
                        Completion Rate
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-yellow-800 dark:text-yellow-200 text-lg">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCategory(data?.categoryPerformance)?.map((item, i) => {
                      const completionRate = (item.completionRate * 100);
                      const avgScore = item.avgScore;

                      // Performance rating based on score and completion
                      const getPerformanceRating = (score, completion) => {
                        if (score >= 80 && completion >= 80) return { level: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: '🌟' };
                        if (score >= 70 && completion >= 70) return { level: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: '👍' };
                        if (score >= 60 && completion >= 60) return { level: 'Average', color: 'text-orange-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: '⚡' };
                        return { level: 'Needs Improvement', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: '📈' };
                      };

                      const performance = getPerformanceRating(avgScore, completionRate);

                      return (
                        <tr
                          key={i}
                          className="border-b transition-all duration-200 border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:border-gray-700 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10 group"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 text-sm flex items-center justify-center rounded-full font-bold ${i === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" :
                                i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500 text-white" :
                                  i === 2 ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white" :
                                    "bg-gradient-to-r from-purple-400 to-pink-500 text-white"
                                }`}>
                                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-lg">📚</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {item.categoryName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Category #{i + 1}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 text-sm">📊</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white text-lg">
                                {item.attemptCount.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 text-sm">🎯</span>
                              </div>
                              <span className={`font-bold text-lg ${avgScore >= 80 ? 'text-green-600 dark:text-green-400' :
                                avgScore >= 70 ? 'text-blue-600 dark:text-blue-400' :
                                  avgScore >= 60 ? 'text-orange-700 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'
                                }`}>
                                {avgScore.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <span className="text-orange-700 dark:text-yellow-400 text-sm">✅</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {completionRate.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${completionRate >= 80 ? 'bg-green-500' :
                                      completionRate >= 70 ? 'bg-blue-500' :
                                        completionRate >= 60 ? 'bg-yellow-500' :
                                          'bg-red-500'
                                      }`}
                                    style={{ width: `${completionRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${performance.bg} border border-current`}>
                              <span className={performance.color}>{performance.icon}</span>
                              <span className={`font-semibold ${performance.color}`}>
                                {performance.level}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCategory(data?.categoryPerformance)?.map((item, i) => {
                  const completionRate = (item.completionRate * 100);
                  const avgScore = item.avgScore;

                  const getPerformanceRating = (score, completion) => {
                    if (score >= 80 && completion >= 80) return { level: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: '🌟' };
                    if (score >= 70 && completion >= 70) return { level: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: '👍' };
                    if (score >= 60 && completion >= 60) return { level: 'Average', color: 'text-orange-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: '⚡' };
                    return { level: 'Needs Improvement', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: '📈' };
                  };

                  const performance = getPerformanceRating(avgScore, completionRate);

                  return (
                    <div
                      key={i}
                      className={`p-6 border rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl ${i === 0 ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-600" :
                        i === 1 ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-600" :
                          i === 2 ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-600" :
                            "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        }`}
                    >
                      {/* Header with Rank */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                              {item?.categoryName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Category #{i + 1}
                            </p>
                          </div>
                        </div>

                        <span className={`w-10 h-10 text-lg flex items-center justify-center rounded-full font-bold ${i === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" :
                          i === 1 ? "bg-gradient-to-r from-gray-400 to-slate-500 text-white" :
                            i === 2 ? "bg-gradient-to-r from-orange-400 to-amber-500 text-white" :
                              "bg-gradient-to-r from-purple-400 to-pink-500 text-white"
                          }`}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </span>
                      </div>

                      {/* Performance Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${performance.bg} border border-current mb-4`}>
                        <span className={performance.color}>{performance.icon}</span>
                        <span className={`font-semibold ${performance.color}`}>
                          {performance.level}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-1 lg:p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-600 dark:text-blue-400">📊</span>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Attempts</span>
                          </div>
                          <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                            {item.attemptCount.toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-1 lg:p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-600 dark:text-green-400">🎯</span>
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">Avg Score</span>
                          </div>
                          <div className={`text-xl font-bold ${avgScore >= 80 ? 'text-green-600 dark:text-green-400' :
                            avgScore >= 70 ? 'text-blue-600 dark:text-blue-400' :
                              avgScore >= 60 ? 'text-orange-700 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                            }`}>
                            {avgScore.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Completion Rate */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {completionRate.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${completionRate >= 80 ? 'bg-green-500' :
                              completionRate >= 70 ? 'bg-blue-500' :
                                completionRate >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                              }`}
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default PerformanceAnalytics;




