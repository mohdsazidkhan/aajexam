'use client';

import Select from '../../common/ui/Select';
import { useState, useEffect, useCallback } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, Filter, LayoutGrid, List, Table as TableIcon,
  Shield, Zap, Award, Mail, Calendar, MoreVertical, Trash2, Edit3,
  CheckCircle2, XCircle, Info, ExternalLink, CreditCard, Wallet, Crown,
  TrendingUp, Settings, ArrowRight, Download, MapPin,
  MailWarning, UserCheck, UserMinus, RefreshCcw, Plus, X, Eye
} from "lucide-react";

import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { safeLocalStorage } from '../../../lib/utils/storage';
import { toast } from 'react-hot-toast';
import ResponsiveTable from '../../common/ResponsiveTable';
import SearchableDropdown from '../../common/SearchableDropdown';
import Pagination from '../../common/Pagination';
import ViewToggle from '../../common/ViewToggle';
import SearchFilter from '../../common/SearchFilter';
import { isMobile } from 'react-device-detect';
import useDebounce from "../../../hooks/useDebounce";
import { AdminTableSkeleton } from '../Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../Sidebar";
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

  // Edit City State
  const [cityEditStudent, setCityEditStudent] = useState(null);
  const [cityDraft, setCityDraft] = useState('');
  const [cityLoading, setCityLoading] = useState(false);

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

  const openCityEditor = (student) => {
    setCityEditStudent(student);
    setCityDraft(student.city || '');
  };

  const handleSaveCity = async () => {
    if (!cityEditStudent) return;
    try {
      setCityLoading(true);
      await API.updateStudent(cityEditStudent._id, { city: cityDraft.trim() });
      toast.success('City updated successfully!');
      setCityEditStudent(null);
      fetchStudents(currentPage, searchTerm, filters);
    } catch (error) {
      console.error('Error updating city:', error);
      toast.error('Unable to update city. Please try again.');
    } finally {
      setCityLoading(false);
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

  const handlePromoteToAdmin = async (student) => {
    if (!window.confirm(`Grant admin access to ${student.name || student.email}? They will get full access to the admin panel.`)) return;
    try {
      const res = await API.request(`/api/admin/users/${student._id}/role`, { method: 'PUT', body: JSON.stringify({ role: 'admin' }) });
      if (res?.success) {
        toast.success(res.message || 'Promoted to admin');
        fetchStudents(currentPage, searchTerm, filters);
      } else {
        toast.error(res?.message || 'Failed to promote');
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to promote');
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
      FREE: 'bg-background-surface-secondary text-content-primary',
      PRO: 'text-primary-600 dark:bg-primary-600 dark:text-primary-600'
    };
    return statusConfig[status] || 'bg-background-surface-secondary text-content-primary';
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
          <div className="text-sm text-content-secondary">
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
            <div className="text-sm font-medium text-content-primary">
              {student.name}
            </div>
            {student.username && (
              <div className="text-xs text-content-secondary">
                @{student.username}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'walletBalance',
      header: 'Referral Rewards',
      render: (_, student) => (
        <div className="text-sm font-semibold text-primary-600">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(student.walletBalance || 0)}
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (_, student) => (
        <div>
          <div className="text-sm text-content-primary">{student.email}</div>
          <div className="text-sm text-content-secondary">{student.phone || 'Not provided'}</div>
        </div>
      )
    },
    {
      key: 'city',
      header: 'City',
      render: (_, student) => (
        <button
          onClick={(e) => { e.stopPropagation(); openCityEditor(student); }}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:hover:text-primary-600 transition-colors"
          title="Set city"
        >
          <MapPin className="w-3.5 h-3.5 text-primary-600" />
          {student.city || 'Add city'}
        </button>
      )
    },
    {
      key: 'level',
      header: 'Status',
      render: (_, student) => (
        <div>
          <div className="text-sm text-content-primary">
            Student
          </div>
          <div className="text-sm text-content-secondary">
            {'Active'}
          </div>
        </div>
      )
    },
    {
      key: 'referralCode',
      header: 'Referral Code',
      render: (_, student) => (
        <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-primary-600 dark:bg-primary-600 dark:text-primary-600">
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
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-primary-600 dark:bg-primary-600 dark:text-primary-600">
              {student.status || 'N/A'}
            </div>
          )
        } else if (student.status === 'suspended') {
          return (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-background-surface-secondary text-content-primary">
              {student.status || 'N/A'}
            </div>
          )
        } else if (student.status === 'banned') {
          return (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-background-surface-secondary text-content-primary">
              {student.status || 'N/A'}
            </div>
          )
        }
        else if (student.status === 'inactive') {
          return (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-primary-600 dark:bg-primary-600 dark:text-primary-600">
              {student.status || 'N/A'}
            </div>
          )
        }
        return (
          <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-background-surface-secondary text-content-primary">
            {student.status || 'N/A'}
          </div>
        );
      }

    },
    {
      key: 'referralCount',
      header: 'Referrals',
      render: (_, student) => (
        <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-background-surface-secondary text-content-primary">
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
        <div className="text-sm text-content-secondary">
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
      <Select
        value={student.subscriptionStatus || 'FREE'}
        onChange={(e) => handleStatusChange(student._id, { subscriptionStatus: e.target.value })}
        className="text-xs border border-border-primary rounded px-2 py-1 bg-background-surface text-content-primary hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        title="Change subscription plan"
      >
        <option value="FREE">FREE</option>
        <option value="PRO">PRO</option>
      </Select>

      {/* Edit City Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          openCityEditor(student);
        }}
        className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-600 p-1.5 sm:p-2 rounded-md transition-colors"
        title={student.city ? `City: ${student.city}` : 'Set city'}
      >
        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* View details (eye) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/admin/user-details/${student.username || student._id}`);
        }}
        className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-600 p-1.5 sm:p-2 rounded-md transition-colors"
        title="View student details"
      >
        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Edit all student info */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/admin/students/${student._id}`);
        }}
        className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-600 p-1.5 sm:p-2 rounded-md transition-colors"
        title="Edit student"
      >
        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Promote to Admin */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePromoteToAdmin(student);
        }}
        className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-600 p-1.5 sm:p-2 rounded-md transition-colors"
        title="Promote to admin"
      >
        <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(student._id);
        }}
        className="text-content-primary hover:text-content-primary dark:hover:text-white p-1.5 sm:p-2 rounded-md hover:bg-background-surface-secondary transition-colors"
        title="Remove student"
      >
        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );



  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search students by name or email..."
        className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm"
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
          className={`border border-primary-600 flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
          title={mode.label}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const newProButton = (
    <button
      onClick={() => setShowCreateModal(true)}
      className="w-full col-span-2 xl:col-span-1 flex items-center justify-center gap-2 text-on-primary px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:brightness-110 bg-primary-600"
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
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-background-surface-secondary rounded-md flex items-center justify-center mx-auto mb-4 border border-primary-600">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-content-muted">No Students Found</h3>
              <p className="text-sm text-content-muted mt-2">No students have registered yet.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-auto">
                {/* View Render Logic */}
                {viewMode === "table" && (
                  <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
                    <ResponsiveTable data={students} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} onRowClick={(student) => router.push(`/admin/user-details/${student.username || student._id}`)} fillHeight />
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
                        onClick={() => router.push(`/admin/user-details/${student.username || student._id}`)}
                        className="group relative bg-background-surface rounded-xl border border-border-primary p-4 hover:border-primary-500/30 transition-all flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-3 cursor-pointer"
                      >
                        <div className="relative w-20 h-20 bg-primary-600 rounded-lg xl:rounded-3xl flex items-center justify-center text-on-primary text-xl xl:text-3xl font-bold group-hover:scale-110 transition-transform shrink-0">
                          {student.name?.charAt(0).toUpperCase()}
                          <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full text-on-primary text-[10px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{(currentPage - 1) * itemsPerPage + i + 1}</span>
                        </div>

                        <div className="flex-1 space-y-2 xl:space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <Link href={`/@${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="text-md md:text-xl xl:text-2xl font-bold text-content-primary italic tracking-tight leading-none hover:text-primary-600 transition-colors">{student.name}</Link>
                            {student.username && <Link href={`/@${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="text-[10px] font-bold text-content-muted hover:text-primary-600 transition-colors">@{student.username}</Link>}
                            <div className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-[0.08em] border border-primary-500/20 text-primary-600 ${student.subscriptionStatus === 'PRO' ? 'border-border-primary bg-black/10 dark:bg-white/10 text-content-primary' : ''}`}>
                              {student.subscriptionStatus || 'FREE'}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-black/50 dark:text-white/50" />
                              <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-primary-500/50" />
                              <span className="text-[10px] font-bold text-primary-600 tabular-nums uppercase tracking-[0.08em]">₹{new Intl.NumberFormat('en-IN').format(student.walletBalance || 0)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-black/50 dark:text-white/50" />
                              <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">Student</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary-500/50" />
                              <span className="text-[10px] font-bold text-content-muted">{formatDate(student.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-0 xl:pl-10 xl:border-l-2 border-border-primary">
                          {renderStudentActions(student)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="h-auto overflow-auto grid content-start items-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 gap-3 xl:gap-4">
                    {students.map((student, i) => (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/admin/user-details/${student.username || student._id}`)}
                        className="group relative bg-[#0D1225]/5 rounded-2xl xl:rounded-3xl border border-border-primary p-3 xl:p-5 hover:border-primary-500/30 transition-all flex flex-col items-center text-center cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary-600" />

                        <div className="mt-4 mb-4 relative">
                          <div className="w-24 h-24 bg-primary-600 rounded-lg xl:rounded-xl xl:rounded-3xl flex items-center justify-center text-on-primary text-4xl font-bold group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full text-on-primary text-[10px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#0D1225] bg-primary-600">{(currentPage - 1) * itemsPerPage + i + 1}</span>
                          <div className="absolute -bottom-2 -right-2 p-2 bg-background-surface dark:bg-black rounded-lg xl:rounded-xl border border-border-primary">
                            <Crown className={`w-4 h-4 ${student.subscriptionStatus === 'PRO' ? 'text-content-primary' : 'text-slate-300'}`} />
                          </div>
                        </div>

                        <Link href={`/@${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="text-sm xl:text-xl font-bold text-content-primary italic tracking-tight leading-none mb-2 limit-text-1 hover:text-primary-600 transition-colors block">{student.name}</Link>
                        <Link href={`/@${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-4 hover:text-primary-600 transition-colors block">{student.username ? `@${student.username}` : 'No username set'}</Link>

                        <div className="grid grid-cols-2 gap-3 w-full mb-4 xl:mb-4">
                          <div className="p-4 rounded-2xl border border-border-primary">
                            <div className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1">Level</div>
                            <div className="text-sm font-bold text-primary-600 tabular-nums tracking-tight">{0}</div>
                          </div>
                          <div className="p-4 rounded-2xl border border-border-primary">
                            <div className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1">Balance</div>
                            <div className="text-sm font-bold text-primary-600 tabular-nums tracking-tight">₹{student.walletBalance || 0}</div>
                          </div>
                        </div>
                        <div className="w-full p-3 rounded-2xl border border-border-primary mb-4 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-primary-500/50 shrink-0" />
                          <div className="text-[8px] font-bold text-content-muted">{formatDate(student.createdAt)}</div>
                        </div>

                        <div className="w-full flex items-center gap-3">
                          <Link href={`/@${student.username}`} target="_blank" onClick={e => e.stopPropagation()} className="flex-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="w-full py-2.5 text-on-primary rounded-lg xl:rounded-2xl text-[9px] font-bold uppercase tracking-[0.08em] bg-primary-600"
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
            <div className="fixed inset-0 z-[999]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="absolute inset-0 bg-[#0A0F1E]/90"
              />

              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-y-0 right-0 left-0 w-full bg-background-surface dark:bg-black xl:rounded-l-2xl border-l-2 border-border-primary overflow-hidden flex flex-col font-sans"
              >
                <section className="px-4 py-2.5 border-b-2 border-border-primary flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-3 xl:gap-3">
                    <div className="p-4 text-primary-600 rounded-lg xl:rounded-2xl">
                      <Zap className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em]">Subscription</span>
                      </div>
                      <h2 className="text-base xl:text-base font-bold text-content-primary uppercase italic tracking-tight leading-none">
                        CREATE <span className="text-primary-600">SUBSCRIPTION</span>
                      </h2>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateModal(false)}
                    className="p-4 bg-background-surface-secondary text-content-muted hover:text-content-primary dark:hover:text-white rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </section>

                <div className="flex-1 p-4 xl:p-10 overflow-y-auto">
                  <form onSubmit={handleCreateSubscription} className="space-y-2 xl:space-y-3 xl:space-y-4">
                    <div className="space-y-2 xl:space-y-3">
                      <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4 italic">Student Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within:text-primary-600 transition-colors" />
                        <input
                          type="email"
                          required
                          value={createFormData.email}
                          onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                          className="w-full pl-16 pr-8 py-2 xl:py-3 bg-background-surface border focus:border-primary-500/50 rounded-3xl text-sm font-bold uppercase tracking-[0.08em] outline-none transition-all border-border-primary"
                          placeholder="ENTER STUDENT EMAIL ADDRESS..."
                        />
                      </div>
                    </div>

                    <div className="space-y-3 xl:space-y-3">
                      <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4 italic">Choose a Plan</label>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { id: 'PRO', label: 'Pro Plan', price: '₹99', icon: Crown, color: 'primary' }
                        ].map((tier) => (
                          <motion.div
                            key={tier.id}
                            whileHover={{ x: 10 }}
                            onClick={() => setCreateFormData({ ...createFormData, planId: tier.id })}
                            className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between group ${createFormData.planId === tier.id ? 'border-primary-500/30' : 'bg-background-surface-secondary border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-lg xl:rounded-xl bg-${tier.color}-500/10 text-${tier.color}-500`}>
                                <tier.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-xs font-bold uppercase italic tracking-tight">{tier.label}</div>
                                <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">{tier.price}/month</div>
                              </div>
                            </div>
                            <div className="text-sm xl:text-xl font-bold text-content-primary tabular-nums tracking-tight">{tier.price}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted italic">
                      <Info className="w-4 h-4" />
                      The subscription will be active for 30 days from the date of creation.
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 py-3 bg-background-surface-secondary text-content-muted hover:text-content-primary dark:hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.08em] transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={createLoading}
                        className="flex-1 py-3 hover:brightness-110 text-on-primary rounded-2xl text-[10px] font-bold uppercase tracking-[0.08em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 bg-primary-600"
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

        {/* Edit City Modal */}
        <AnimatePresence>
          {cityEditStudent && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCityEditStudent(null)}
                className="absolute inset-0 bg-[#0A0F1E]/90"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'tween', duration: 0.2 }}
                className="relative w-full max-w-md bg-background-surface dark:bg-black rounded-3xl border border-border-primary overflow-hidden"
              >
                <section className="p-4 border-b-2 border-border-primary flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 text-on-primary rounded-xl bg-primary-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em] mb-1">City</div>
                      <h2 className="text-lg font-bold text-content-primary italic tracking-tight leading-none">
                        {cityEditStudent.name || cityEditStudent.email}
                      </h2>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCityEditStudent(null)}
                    className="p-3 bg-background-surface-secondary text-content-muted hover:text-content-primary dark:hover:text-white rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </section>

                <div className="p-4 space-y-3">
                  <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-1 italic">Set City</label>
                  <SearchableDropdown
                    type="city"
                    value={cityDraft}
                    onChange={setCityDraft}
                    placeholder="Search for a city..."
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCityEditStudent(null)}
                      className="flex-1 py-2.5 bg-background-surface-secondary text-content-muted hover:text-content-primary dark:hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.08em] transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={cityLoading}
                      onClick={handleSaveCity}
                      className="flex-1 py-2.5 hover:brightness-110 text-on-primary rounded-2xl text-[10px] font-bold uppercase tracking-[0.08em] transition-all flex items-center justify-center gap-2 disabled:opacity-50 bg-primary-600"
                    >
                      {cityLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Save'}
                    </motion.button>
                  </div>
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






