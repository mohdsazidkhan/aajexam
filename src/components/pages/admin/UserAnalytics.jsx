'use client';

import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

import {
  FaFilter, FaDownload, FaChartBar, FaChartLine, FaChartPie
} from 'react-icons/fa';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { useSSR } from '../../../hooks/useSSR';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement
);

function exportCSV(data, filename) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));
  for (const row of data) {
    csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  }
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const UserAnalytics = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ period: 'month', level: '', subscription: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    API.getUserAnalytics(filters)
      .then(res => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load user analytics');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Failed to load user analytics');
        setLoading(false);
      });
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = () => {
    if (!data?.topPerformers?.length) return;
    const rows = data.topPerformers.map(u => ({
      Name: u.name || 'Unknown',
      Level: u.level?.currentLevel || 0,
      'High Score Quizzes': u.level?.highScoreQuizzes || 0,
      Subscription: u.subscriptionStatus || 'free'
    }));
    exportCSV(rows, 'top_performers.csv');
  };

  const chartColor = {
    text: {
      light: '#000000',
      dark: '#ffffff'
    },
    grid: {
      light: 'rgba(0, 0, 0, 0.1)',
      dark: 'rgba(255, 255, 255, 0.1)'
    }
  };

  const levelLabels = data?.levelDistribution?.map(l => `Level ${l._id}`) || [];
  const levelCounts = data?.levelDistribution?.map(l => l.count) || [];
  const subscriptionLabels = data?.subscriptionStats?.map(s => s._id) || [];
  const subscriptionCounts = data?.subscriptionStats?.map(s => s.count) || [];
  const userGrowthLabels = data?.userGrowth?.map(g => `${g._id.year}-${g._id.month}-${g._id.day}`) || [];
  const userGrowthCounts = data?.userGrowth?.map(g => g.count) || [];

  const levelBarData = {
    labels: levelLabels,
    datasets: [{
      label: 'Users',
      data: levelCounts,
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const subscriptionPieData = {
    labels: subscriptionLabels,
    datasets: [{
      label: 'Users',
      data: subscriptionCounts,
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(251, 191, 36, 0.7)'
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  const userGrowthLineData = {
    labels: userGrowthLabels,
    datasets: [{
      label: 'New Users',
      data: userGrowthCounts,
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const baseOptions = (mode) => ({
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: chartColor.text[mode]
        }
      }
    },
    scales: {
      x: {
        ticks: { color: chartColor.text[mode] },
        grid: { color: chartColor.grid[mode] }
      },
      y: {
        ticks: { color: chartColor.text[mode] },
        grid: { color: chartColor.grid[mode] }
      }
    }
  });

  const pieOptions = (mode) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartColor.text[mode],
          padding: 20,
          usePointStyle: true
        }
      }
    }
  });

  const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  if (loading) return <Loading fullScreen={true} size="lg" color="yellow" message="Loading..." />;
  if (error) return <div className="min-h-screen p-3 lg:p-6 bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-400">{error}</div>;
  if (!data) return <div className="min-h-screen p-3 lg:p-6 text-center text-gray-400 dark:text-gray-500">No data available</div>;

  return (
    <AdminMobileAppWrapper title="User Analytics">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full">
          <h1 className="text-3xl font-bold mb-2">User Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Detailed insights into user behavior, growth, and performance</p>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-3 lg:p-6 border border-gray-200 dark:border-gray-700 rounded-xl shadow mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-500 dark:text-gray-300" />
                <span className="font-medium text-sm">Filters:</span>
              </div>
              <select name="period" value={filters.period} onChange={handleFilterChange}
                className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 3 months</option>
                <option value="year">Last 12 months</option>
              </select>
              <input name="level" value={filters.level} onChange={handleFilterChange} placeholder="Level"
                className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              <input name="subscription" value={filters.subscription} onChange={handleFilterChange} placeholder="Subscription"
                className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              <button onClick={handleExport}
                className="ml-auto flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <FaDownload /> Export CSV
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-3 lg:p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <FaChartBar className="mr-2 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-lg">Level Distribution</h3>
              </div>
              {levelLabels.length > 0 ? <Bar data={levelBarData} options={baseOptions(mode)} /> : <p className="text-center text-gray-500">No data</p>}
            </div>

            <div className="bg-white dark:bg-gray-800 p-3 lg:p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <FaChartPie className="mr-2 text-orange-700 dark:text-yellow-400" />
                <h3 className="font-semibold text-lg">Subscription Stats</h3>
              </div>
              {subscriptionLabels.length > 0 ? <Pie data={subscriptionPieData} options={pieOptions(mode)} /> : <p className="text-center text-gray-500">No data</p>}
            </div>
          </div>

          {/* Line chart */}
          <div className="bg-white dark:bg-gray-800 p-3 lg:p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-center mb-4">
              <FaChartLine className="mr-2 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-lg">User Growth</h3>
            </div>
            {userGrowthLabels.length > 0 ? <Line data={userGrowthLineData} options={baseOptions(mode)} /> : <p className="text-center text-gray-500">No data</p>}
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default UserAnalytics;




