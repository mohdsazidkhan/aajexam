'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Filter, LayoutGrid, List, Table as TableIcon,
  Shield, Zap, Award, Mail, Phone, Calendar, MoreVertical, Trash2, Edit3,
  CheckCircle2, XCircle, Info, ExternalLink, CreditCard, Wallet, Crown, Star,
  TrendingUp, Activity, Box, Settings, ArrowRight, ChevronRight, Download,
  MailWarning, UserCheck, UserMinus, RefreshCcw, Plus, X
} from "lucide-react";

import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import { safeLocalStorage } from '../../../lib/utils/storage';
import { toast } from 'react-toastify';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import SearchFilter from '../../SearchFilter';
import { isMobile } from 'react-device-detect';
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';

const StudentsPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
  const [filters, setFilters] = useState({
    level: ''
  });

  // Create Subscription State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    planId: 'pro',
    duration: '1 month'
  });
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!createFormData.email) {
      toast.error('Please enter a student email address.');
      return;
    }

    try {
      setCreateLoading(true);
      await API.adminCreateSubscription(createFormData);
      toast.success(`Subscription successfully created for ${createFormData.email}`);
      setShowCreateModal(false);
      setCreateFormData({ email: '', planId: 'pro', duration: '1 month' });
      fetchStudents(currentPage, searchTerm, filters);
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error(error.response?.data?.message || 'Unable to create subscription. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const user = (() => {
    const raw = safeLocalStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
  })();
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year} at ${time}`;
  };
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchStudents = useCallback(async (page = 1, search = '', filterParams = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: itemsPerPage,
        ...(search && { search }),
        ...filterParams
      };
      const response = await API.getAdminStudents(params);
      setStudents(response.students || response);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Unable to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchStudents(currentPage, debouncedSearch, filters);
  }, [debouncedSearch, filters, fetchStudents, currentPage]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ level: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleStatusChange = async (studentId, updateData) => {
    try {
      await API.updateStudent(studentId, updateData);
      toast.success('Student details updated successfully!');
      fetchStudents(currentPage, searchTerm, filters);
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Unable to update student. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('This will permanently remove this student account. Are you sure you want to continue?')) {
      try {
        await API.deleteStudent(id);
        toast.success('Student account has been removed.');
        fetchStudents(currentPage, searchTerm, filters);
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Unable to delete student. Please try again.');
      }
    }
  };

  const getLevelName = (level) => {
    const levelNames = {
      1: 'Rookie', 2: 'Explorer', 3: 'Thinker', 4: 'Strategist', 5: 'Achiever',
      6: 'Mastermind', 7: 'Champion', 8: 'Prodigy', 9: 'Wizard', 10: 'Legend'
    };
    return levelNames[level] || 'Unknown';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      free: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      pro: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
    };
    return statusConfig[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const filterOptions = {
    level: {
      label: 'Level',
      options: Array.from({ length: 10 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Level ${i + 1} - ${getLevelName(i + 1)}`
      }))
    }
  };

  // Define table columns for ResponsiveTable
  const columns = [
    {
      key: 'sno',
      header: '#',
      render: (_, student) => {
        // Calculate serial number based on student's position in the array
        const studentIndex = students?.findIndex(s => s?._id === student?._id);
        const serialNumber = studentIndex >= 0 ? ((currentPage - 1) * itemsPerPage) + studentIndex + 1 : 1;
        return (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {serialNumber}
          </div>
        );
      }
    },
    {
      key: 'student',
      header: 'Student',
      render: (_, student) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-red-500 to-primary-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm sm:text-base">
                {student.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3 sm:ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {student.name}
            </div>
            {student.username && (
              <div className="text-xs text-slate-700 dark:text-gray-400">
                @{student.username}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'walletBalance',
      header: 'Wallet Balance',
      render: (_, student) => (
        <div className="text-sm font-semibold text-green-700 dark:text-green-400">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(student.walletBalance || 0)}
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (_, student) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">{student.email}</div>
          <div className="text-sm text-slate-700 dark:text-gray-400 dark:text-gray-300">{student.phone || 'Not provided'}</div>
        </div>
      )
    },
    {
      key: 'level',
      header: 'Level',
      render: (_, student) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            Level 0
          </div>
          <div className="text-sm text-slate-700 dark:text-gray-400 dark:text-gray-300">
            {'Student'}
          </div>
        </div>
      )
    },
    {
      key: 'referralCode',
      header: 'Referral Code',
      render: (_, student) => (
        <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {student.referralCode || 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, student) => {
        if (student.status === 'active') {
          return (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {student.status || 'N/A'}
            </div>
          )
        } else if (student.status === 'suspended') {
          return (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              {student.status || 'N/A'}
            </div>
          )
        } else if (student.status === 'banned') {
          return (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {student.status || 'N/A'}
            </div>
          )
        }
        else if (student.status === 'inactive') {
          return (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              {student.status || 'N/A'}
            </div>
          )
        }
        return (
          <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {student.status || 'N/A'}
          </div>
        );
      }

    },
    {
      key: 'referralCount',
      header: 'Referrals',
      render: (_, student) => (
        <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-white">
          {student.referralCount || 0}
        </div>
      )
    },
    {
      key: 'subscriptionStatus',
      header: 'Subscription',
      render: (_, student) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(student.subscriptionStatus)}`}>
          {student.subscriptionStatus || 'free'}
        </span>
      )
    },
    {
      key: 'joined',
      header: 'Date Joined',
      render: (_, student) => (
        <div className="text-sm text-slate-700 dark:text-gray-400 dark:text-gray-300">
          {formatDate(student.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, student) => renderStudentActions(student)
    }
  ];

  // Custom render function for student actions that includes status dropdown
  const renderStudentActions = (student) => (
    <div className="flex items-center space-x-2">
      {/* Subscription Status Dropdown */}
      <select
        value={student.subscriptionStatus || 'free'}
        onChange={(e) => handleStatusChange(student._id, { subscriptionStatus: e.target.value })}
        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        title="Change subscription plan"
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>

      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Handle edit functionality
          // Edit student: navigate to details page
          router.push(`/admin/students/${student._id}`);
        }}
        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-1.5 sm:p-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
        title="View student details"
      >
        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(student._id);
        }}
        className="text-red-500 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 sm:p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Remove student"
      >
        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );



  return (
     <AdminMobileAppWrapper title="User Directory">
       <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-sans text-slate-900 dark:text-white pb-20">
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}

         <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-0' : 'lg:pl-16'} p-4 lg:p-10`}>
            {/* Student Directory Overview */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
             <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4">
               <div className="space-y-4">
       
                  <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                    STUDENT <span className="text-indigo-600">DIRECTORY</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">
                    Browse and manage all registered student accounts.
                  </p>
               </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-3 w-full lg:w-auto">
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    icon={UserPlus}
                    className="w-full lg:w-auto px-4 lg:px-8 py-4 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-duo-primary"
                  >
                    CREATE SUBSCRIPTION
                  </Button>
              </div>
            </div>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
               {[
                 { label: 'Total Students', value: pagination?.total || 0, icon: Users, color: 'blue' },
                 { label: 'Active Students', value: students.filter(s => s.status === 'active').length || 0, icon: Activity, color: 'emerald' },
                 { label: 'Pro Subscribers', value: students.filter(s => s.subscriptionStatus === 'pro').length || 0, icon: Crown, color: 'amber' },
                 { label: 'New Signups', value: students.length || 0, icon: Star, color: 'indigo' }
               ].map((stat, i) => (
                 <div
                   key={stat.label}
                   className="p-3 lg:p-8 bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-xl transition-all hover:scale-[1.02]"
                 >
                   <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 w-fit mb-6 shadow-sm`}>
                     <stat.icon className="w-5 h-5" />
                   </div>
                   <div className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tabular-nums mb-2 tracking-tighter italic leading-none">{stat.value}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                 </div>
               ))}
             </div>
          </motion.div>

           {/* Search & Filter Controls */}
           <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-4 shadow-2xl">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
               <div className="flex-1 relative group w-full lg:max-w-2xl">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input
                   type="text"
                   value={searchTerm}
                   onChange={(e) => handleSearch(e.target.value)}
                   placeholder="Search students by name or email..."
                   className="w-full pl-14 pr-8 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                 />
               </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner w-full lg:w-auto justify-center lg:justify-start">
                  {[
                    { icon: TableIcon, id: 'table', label: 'Table' },
                    { icon: List, id: 'list', label: 'List' },
                    { icon: LayoutGrid, id: 'grid', label: 'Grid' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`p-4 rounded-full transition-all flex items-center gap-2 ${viewMode === mode.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                      title={mode.label}
                    >
                      <mode.icon className="w-5 h-5" />
                      {viewMode === mode.id && <span className="text-[10px] font-black uppercase tracking-widest pr-2">{mode.label}</span>}
                    </button>
                  ))}
                </div>

                 <div className="relative group w-full lg:w-auto">
                   <Box className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <select
                     value={itemsPerPage}
                     onChange={handleItemsPerPageChange}
                     className="w-full lg:w-auto pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-indigo-500/30 transition-all"
                   >
                     {[10, 20, 50, 100, 500].map(n => <option key={n} value={n}>{n} per page</option>)}
                   </select>
                   <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                 </div>
              </div>
            </div>
          </div>

           {/* Data Grid Interface */}
           <AnimatePresence mode="wait">
             {loading ? (
               <motion.div
                 key="loading"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex flex-col items-center justify-center py-32 space-y-4 lg:space-y-8"
               >
                 <div className="relative">
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                     className="w-28 h-28 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full shadow-2xl"
                   />
                   <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-500" />
                 </div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Loading student accounts...</div>
               </motion.div>
             ) : students.length === 0 ? (
               <motion.div
                 key="empty"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-10 lg:py-20  text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
               >
                 <div className="p-4 lg:p-10 bg-slate-100/50 dark:bg-white/5 rounded-xl lg:rounded-[3rem] mb-4 lg:mb-8 shadow-xl">
                   <Users className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                 </div>
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">No Students Found</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No students have registered yet.</p>
               </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 lg:space-y-12"
              >
                {/* View Render Logic */}
                {viewMode === "table" && (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left">
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Balance</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {students.map((student, i) => (
                          <motion.tr
                            key={student._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(`/admin/students/${student._id}`)}
                            className="group hover:bg-slate-50/80 dark:hover:bg-white/5 transition-all cursor-pointer"
                          >
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-xs font-bold text-slate-400 tabular-nums">{((currentPage - 1) * itemsPerPage) + i + 1}</td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-tr from-primary-500 to-primary-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">
                                  {student.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 group-hover:text-primary-500 transition-colors">{student.name}</div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">#{student._id.slice(-6).toUpperCase()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                              <div className="text-sm font-black text-emerald-500 tabular-nums">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(student.walletBalance || 0)}
                              </div>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                              <div className="space-y-1">
                                 <div className="text-[10px] font-black text-slate-700 dark:text-white flex items-center gap-2 leading-none mb-1"><Mail className="w-3 h-3 text-blue-500/50" /> {student.email}</div>
                                 <div className="text-[9px] font-bold text-slate-400 flex items-center gap-2 italic leading-none"><Phone className="w-3 h-3 text-primary-500/50" /> {student.phone || 'Not provided'}</div>
                              </div>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                               <div className="flex flex-col">
                                 <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Level 0</div>
                                 <div className="text-[8px] font-bold text-indigo-500 uppercase tracking-[0.2em]">{'Student'}</div>
                               </div>
                             </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                              <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit border ${student.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                student.status === 'suspended' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                  'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                }`}>
                                 {student.status || 'Inactive'}
                               </div>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                              {renderStudentActions(student)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                  <div className="grid grid-cols-1 gap-3 lg:gap-6">
                    {students.map((student, i) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/admin/students/${student._id}`)}
                        className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 hover:border-primary-500/30 transition-all shadow-xl flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-8 cursor-pointer"
                      >
                        <div className="w-20 h-20 bg-gradient-to-tr from-primary-500 to-primary-500 rounded-lg lg:rounded-[2rem] flex items-center justify-center text-white text-xl lg:text-3xl font-black shadow-lg group-hover:scale-110 transition-transform shrink-0">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-4">
                            <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-primary-500 transition-colors">{student.name}</h3>
                             <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 ${student.subscriptionStatus === 'pro' ? 'border-amber-500/20 bg-amber-500/10 text-amber-500' : ''}`}>
                               {student.subscriptionStatus || 'free'}
                             </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-500/50" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-emerald-500/50" />
                              <span className="text-[10px] font-black text-emerald-500 tabular-nums uppercase tracking-widest">₹{new Intl.NumberFormat('en-IN').format(student.walletBalance || 0)}</span>
                            </div>
                             <div className="flex items-center gap-2">
                               <Crown className="w-4 h-4 text-amber-500/50" />
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</span>
                             </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pl-0 lg:pl-10 lg:border-l-2 border-slate-100 dark:border-white/5">
                          {renderStudentActions(student)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                    {students.map((student, i) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/admin/students/${student._id}`)}
                        className="group relative bg-[#0D1225]/5 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 hover:border-primary-500/30 transition-all shadow-2xl flex flex-col items-center text-center cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-500" />

                        <div className="mt-4 mb-6 relative">
                          <div className="w-24 h-24 bg-gradient-to-tr from-primary-500 to-primary-500 rounded-xl lg:rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-[#0D1225] rounded-xl border-2 border-slate-100 dark:border-white/10 shadow-lg">
                            <Crown className={`w-4 h-4 ${student.subscriptionStatus === 'pro' ? 'text-amber-500' : 'text-slate-300'}`} />
                          </div>
                        </div>

                         <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2 limit-text-1">{student.name}</h3>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{student.username ? `@${student.username}` : 'No username set'}</div>

                        <div className="grid grid-cols-2 gap-4 w-full mb-4 lg:mb-8">
                           <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</div>
                             <div className="text-sm font-black text-indigo-500 tabular-nums tracking-tighter">{0}</div>
                           </div>
                           <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</div>
                             <div className="text-sm font-black text-emerald-500 tabular-nums tracking-tighter">₹{student.walletBalance || 0}</div>
                           </div>
                        </div>

                        <div className="w-full flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                             className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest shadow-xl"
                           >
                             VIEW PROFILE
                           </motion.button>
                          <div className="p-1">
                            {renderStudentActions(student)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* External Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      totalItems={pagination.total}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

         {/* Create Subscription Modal */}
         <AnimatePresence>
           {showCreateModal && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowCreateModal(false)}
                 className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-3xl"
               />
 
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 40 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 40 }}
                 className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1E] rounded-2xl lg:rounded-[4rem] border-4 border-slate-100 dark:border-white/10 shadow-3xl overflow-hidden flex flex-col font-sans"
               >
                 <div className="p-4 lg:p-14 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                   <div className="flex items-center gap-3 lg:gap-6">
                     <div className="p-5 bg-indigo-500/10 text-indigo-500 rounded-lg lg:rounded-[1.5rem] shadow-xl">
                       <Zap className="w-8 h-8 fill-current" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Subscription</span>
                        </div>
                         <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                           CREATE <span className="text-indigo-600">SUBSCRIPTION</span>
                         </h2>
                      </div>
                   </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateModal(false)}
                    className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="p-4 lg:p-10">
                  <form onSubmit={handleCreateSubscription} className="space-y-4 lg:space-y-8">
                     <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Student Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="email"
                            required
                            value={createFormData.email}
                            onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                            className="w-full pl-16 pr-8 py-3 lg:py-6 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/50 rounded-3xl text-sm font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                            placeholder="ENTER STUDENT EMAIL ADDRESS..."
                          />
                        </div>
                      </div>
 
                     <div className="space-y-3 lg:space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Choose a Plan</label>
                      <div className="grid grid-cols-1 gap-4">
                         {[
                           { id: 'basic', label: 'Basic Plan', price: '₹9', icon: Shield, color: 'blue' },
                           { id: 'premium', label: 'Premium Plan', price: '₹49', icon: Star, color: 'emerald' },
                           { id: 'pro', label: 'Pro Plan', price: '₹99', icon: Crown, color: 'amber' }
                         ].map((tier) => (
                          <motion.div
                            key={tier.id}
                            whileHover={{ x: 10 }}
                            onClick={() => setCreateFormData({ ...createFormData, planId: tier.id })}
                            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group ${createFormData.planId === tier.id ? 'bg-primary-500/10 border-primary-500/30 shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl bg-${tier.color}-500/10 text-${tier.color}-500`}>
                                <tier.icon className="w-5 h-5" />
                              </div>
                              <div>
                                 <div className="text-xs font-black uppercase italic tracking-tighter">{tier.label}</div>
                                 <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tier.price}/month</div>
                               </div>
                            </div>
                            <div className="text-sm lg:text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{tier.price}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                     <div className="flex items-center gap-4 pt-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                       <Info className="w-4 h-4" />
                       The subscription will be active for 30 days from the date of creation.
                     </div>

                    <div className="flex items-center gap-4 pt-4">
                      <motion.button
                         type="button"
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => setShowCreateModal(false)}
                         className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                       >
                         Cancel
                       </motion.button>
                      <motion.button
                         type="submit"
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         disabled={createLoading}
                         className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                       >
                         {createLoading ? (
                           <RefreshCcw className="w-4 h-4 animate-spin" />
                         ) : (
                           <>
                             <Zap className="w-4 h-4" /> Create Subscription
                           </>
                         )}
                       </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default StudentsPage;






