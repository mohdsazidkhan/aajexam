'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Filter, LayoutGrid, List, Table as TableIcon,
  Shield, Zap, Award, Mail, Calendar, MoreVertical, Trash2, Edit3,
  CheckCircle2, XCircle, Info, ExternalLink, CreditCard, Wallet, Crown,
  TrendingUp, Settings, ArrowRight, Download,
  MailWarning, UserCheck, UserMinus, RefreshCcw, Plus, X
} from "lucide-react";

import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { safeLocalStorage } from '../../../lib/utils/storage';
import { toast } from 'react-toastify';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import SearchFilter from '../../SearchFilter';
import { isMobile } from 'react-device-detect';
import useDebounce from "../../../hooks/useDebounce";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../../Sidebar";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


const StudentsPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
  const [filters, setFilters] = useState({
    level: ''
  });

  // Create Subscription State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    planId: 'PRO',
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
      setCreateFormData({ email: '', planId: 'PRO', duration: '1 month' });
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
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day}-${month}-${year} at ${time}`;
  };
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

  const handleItemsPerPageChange = (newItemsPerPage) => {
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
      FREE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      PRO: 'bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200'
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
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-600 flex items-center justify-center">
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
        <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
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
      header: 'Status',
      render: (_, student) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            Student
          </div>
          <div className="text-sm text-slate-700 dark:text-gray-400 dark:text-gray-300">
            {'Active'}
          </div>
        </div>
      )
    },
    {
      key: 'referralCode',
      header: 'Referral Code',
      render: (_, student) => (
        <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200">
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
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200">
              {student.status || 'N/A'}
            </div>
          )
        } else if (student.status === 'suspended') {
          return (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white">
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
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200">
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
          {student.subscriptionStatus || 'FREE'}
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
        value={student.subscriptionStatus || 'FREE'}
        onChange={(e) => handleStatusChange(student._id, { subscriptionStatus: e.target.value })}
        className="text-xs border border-slate-300 dark:border-slate-700 rounded px-2 py-1 bg-slate-50 dark:bg-black text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        title="Change subscription plan"
      >
        <option value="FREE">FREE</option>
        <option value="PRO">PRO</option>
      </select>

      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Handle edit functionality
          // Edit student: navigate to details page
          router.push(`/admin/students/${student._id}`);
        }}
        className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-300 p-1.5 sm:p-2 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
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
        className="text-black dark:text-white hover:text-black dark:hover:text-white p-1.5 sm:p-2 rounded-md hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/20 transition-colors"
        title="Remove student"
      >
        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );



  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search students by name or email..."
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: List, id: 'list', label: 'List View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
      ].map((mode) => (
        <button
          key={mode.id}
          onClick={() => setViewMode(mode.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          title={mode.label}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const newProButton = (
    <button
      onClick={() => setShowCreateModal(true)}
      className="w-full col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700"
    >
      <UserPlus className="w-4 h-4" /> New PRO
    </button>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={currentPage}
      totalPages={pagination.totalPages || 1}
      onPageChange={handlePageChange}
      totalItems={pagination.total || 0}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );

  useAdminMobileHeader({
    title: 'Students',
    count: pagination?.total || 0,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {newProButton}
        {paginationControl}
      </>
    )
  });

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">

        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <div className="flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">
          {loading ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-500 uppercase">No Students Found</h3>
              <p className="text-sm text-slate-400 mt-2">No students have registered yet.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-auto">
                {/* View Render Logic */}
                {viewMode === "table" && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
                    <ResponsiveTable data={students} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} onRowClick={(student) => router.push(`/admin/students/${student._id}`)} fillHeight />
                  </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                  <div className="h-auto overflow-auto grid content-start items-start grid-cols-1 gap-3">
                    {students.map((student, i) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/admin/students/${student._id}`)}
                        className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-500/30 transition-all flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 cursor-pointer"
                      >
                        <div className="relative w-20 h-20 bg-primary-600 rounded-lg lg:rounded-[2rem] flex items-center justify-center text-white text-xl lg:text-3xl font-black shadow-sm group-hover:scale-110 transition-transform shrink-0">
                          {student.name?.charAt(0).toUpperCase()}
                          <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(currentPage - 1) * itemsPerPage + i + 1}</span>
                        </div>

                        <div className="flex-1 space-y-2 lg:space-y-4">
                          <div className="flex flex-wrap items-center gap-4">
                            <Link href={`/u/${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none hover:text-primary-600 transition-colors">{student.name}</Link>
                            {student.username && <Link href={`/u/${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="text-[10px] font-bold text-slate-400 hover:text-primary-600 transition-colors">@{student.username}</Link>}
                            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-primary-500/20 bg-primary-500/10 text-primary-600 ${student.subscriptionStatus === 'PRO' ? 'border-black/20 dark:border-white/20 bg-black/10 dark:bg-white/10 text-black dark:text-white' : ''}`}>
                              {student.subscriptionStatus || 'FREE'}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-black/50 dark:text-white/50" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-primary-500/50" />
                              <span className="text-[10px] font-black text-primary-600 tabular-nums uppercase tracking-widest">₹{new Intl.NumberFormat('en-IN').format(student.walletBalance || 0)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-black/50 dark:text-white/50" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary-500/50" />
                              <span className="text-[10px] font-black text-slate-400">{formatDate(student.createdAt)}</span>
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
                  <div className="h-auto overflow-auto grid content-start items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                    {students.map((student, i) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/admin/students/${student._id}`)}
                        className="group relative bg-[#0D1225]/5 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 hover:border-primary-500/30 transition-all shadow-sm flex flex-col items-center text-center cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary-600" />

                        <div className="mt-4 mb-6 relative">
                          <div className="w-24 h-24 bg-primary-600 rounded-lg lg:rounded-xl xl:rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{(currentPage - 1) * itemsPerPage + i + 1}</span>
                          <div className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-[#0D1225] rounded-lg lg:rounded-xl border-2 border-slate-100 dark:border-white/10 shadow-sm">
                            <Crown className={`w-4 h-4 ${student.subscriptionStatus === 'PRO' ? 'text-black dark:text-white' : 'text-slate-300'}`} />
                          </div>
                        </div>

                        <Link href={`/u/${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2 limit-text-1 hover:text-primary-600 transition-colors block">{student.name}</Link>
                        <Link href={`/u/${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-primary-600 transition-colors block">{student.username ? `@${student.username}` : 'No username set'}</Link>

                        <div className="grid grid-cols-2 gap-4 w-full mb-4 lg:mb-8">
                          <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</div>
                            <div className="text-sm font-black text-primary-600 tabular-nums tracking-tighter">{0}</div>
                          </div>
                          <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</div>
                            <div className="text-sm font-black text-primary-600 tabular-nums tracking-tighter">₹{student.walletBalance || 0}</div>
                          </div>
                        </div>
                        <div className="w-full p-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 mb-4 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-primary-500/50 shrink-0" />
                          <div className="text-[8px] font-black text-slate-400">{formatDate(student.createdAt)}</div>
                        </div>

                        <div className="w-full flex items-center gap-3">
                          <Link href={`/u/${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="flex-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest shadow-sm"
                          >
                            VIEW PROFILE
                          </motion.button>
                          </Link>
                          <div className="p-1">
                            {renderStudentActions(student)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

              </div>
            </>
          )}
        </div>

        {/* Create Subscription Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-[100]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-3xl"
              />

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                className="absolute top-16 right-0 bottom-0 left-0 lg:left-64 bg-white dark:bg-[#0A0F1E] lg:rounded-l-[3rem] border-l-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col font-sans"
              >
                <div className="p-4 lg:p-14 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                  <div className="flex items-center gap-3 lg:gap-6">
                    <div className="p-5 bg-primary-500/10 text-primary-600 rounded-lg lg:rounded-[1.5rem] shadow-sm">
                      <Zap className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Subscription</span>
                      </div>
                      <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                        CREATE <span className="text-primary-600">SUBSCRIPTION</span>
                      </h2>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateModal(false)}
                    className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-black dark:hover:text-white rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
                  <form onSubmit={handleCreateSubscription} className="space-y-2 lg:space-y-4 lg:space-y-8">
                    <div className="space-y-2 lg:space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Student Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                        <input
                          type="email"
                          required
                          value={createFormData.email}
                          onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                          className="w-full pl-16 pr-8 py-3 lg:py-6 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/50 rounded-3xl text-sm font-black uppercase tracking-widest outline-none transition-all shadow-sm"
                          placeholder="ENTER STUDENT EMAIL ADDRESS..."
                        />
                      </div>
                    </div>

                    <div className="space-y-3 lg:space-y-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Choose a Plan</label>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { id: 'PRO', label: 'Pro Plan', price: '₹99', icon: Crown, color: 'primary' }
                        ].map((tier) => (
                          <motion.div
                            key={tier.id}
                            whileHover={{ x: 10 }}
                            onClick={() => setCreateFormData({ ...createFormData, planId: tier.id })}
                            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group ${createFormData.planId === tier.id ? 'bg-primary-500/10 border-primary-500/30 shadow-sm' : 'bg-slate-50 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg lg:rounded-xl bg-${tier.color}-500/10 text-${tier.color}-500`}>
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
                        className="flex-1 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
    </div>
  );
};

export default StudentsPage;






