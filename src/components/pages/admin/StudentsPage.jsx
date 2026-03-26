'use client';

import { useState, useEffect, useCallback } from 'react';

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
import { FaTrash, FaEdit } from 'react-icons/fa';
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
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');
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
      toast.error('Please enter an email');
      return;
    }

    try {
      setCreateLoading(true);
      await API.adminCreateSubscription(createFormData);
      toast.success(`Subscription created for ${createFormData.email}`);
      setShowCreateModal(false);
      setCreateFormData({ email: '', planId: 'pro', duration: '1 month' });
      fetchStudents(currentPage, searchTerm, filters);
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to create subscription');
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
      toast.error('Failed to fetch students');
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
      toast.success('Student updated successfully!');
      fetchStudents(currentPage, searchTerm, filters);
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await API.deleteStudent(id);
        toast.success('Student deleted successfully!');
        fetchStudents(currentPage, searchTerm, filters);
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
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
      pro: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
      header: 'S.No.',
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
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center">
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
              <div className="text-xs text-gray-500 dark:text-gray-400">
                @{student.username}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'walletBalance',
      header: 'Balance',
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
          <div className="text-sm text-gray-500 dark:text-gray-300">{student.phone || 'No phone'}</div>
        </div>
      )
    },
    {
      key: 'level',
      header: 'Level',
      render: (_, student) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            Level {student.level?.currentLevel || 1}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {getLevelName(student.level?.currentLevel || 1)}
          </div>
        </div>
      )
    },
    {
      key: 'referralCode',
      header: 'Ref. Code',
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
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              {student.status || 'N/A'}
            </div>
          )
        }

      }

    },
    {
      key: 'referralCount',
      header: 'Ref Count',
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
      header: 'Joined',
      render: (_, student) => (
        <div className="text-sm text-gray-500 dark:text-gray-300">
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
        title="Change Subscription Status"
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>

      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Handle edit functionality
          console.log('Edit student:', student);
        }}
        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 sm:p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        title="Edit Student"
      >
        <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(student._id);
        }}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 sm:p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Delete Student"
      >
        <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );



  return (
    <AdminMobileAppWrapper title="Students">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                Students ({pagination?.total || students?.length})
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Create, edit or delete students
              </p>
            </div>
            {/* Search and Filters */}
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              placeholder="Search students by name, email, or phone..."
            />
            {/* Create Subscription Button */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="admin"
                size="small"
                onClick={() => setShowCreateModal(true)}
                icon={<span>+</span>}
              >
                Create Subscription
              </Button>
            </div>

            <ViewToggle
              currentView={viewMode}
              onViewChange={setViewMode}
              views={['table', 'list', 'grid']}
            />
            <div className="flex items-center space-x-2 flex-shrink-0">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="w-full lg:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>
          </div>


          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="gray" message="" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No students found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'No students have registered yet.'}
              </p>
            </div>
          ) : (
            <>
              <ResponsiveTable
                data={students}
                columns={columns}
                viewModes={['table', 'list', 'grid']}
                defaultView={viewMode}
                currentView={viewMode}
                showPagination={false}
                showViewToggle={false}
                loading={loading}
                emptyMessage="No students found"
                onViewChange={setViewMode}
                onRowClick={(student) => {
                  // Handle row click if needed
                  console.log('Student clicked:', student);
                }}
              />

              {/* External Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </>
          )}
        </div>

        {/* Create Subscription Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowCreateModal(false)}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                        Create Subscription
                      </h3>
                      <div className="mt-2">
                        <form onSubmit={handleCreateSubscription} className="space-y-4">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              User Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              required
                              value={createFormData.email}
                              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-lg"
                              placeholder="support@mohdsazidkhan.com"
                            />
                          </div>
                          <div>
                            <label htmlFor="planId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Plan
                            </label>
                            <select
                              id="planId"
                              name="planId"
                              value={createFormData.planId}
                              onChange={(e) => setCreateFormData({ ...createFormData, planId: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-lg"
                            >
                              <option value="basic">Basic (₹9)</option>
                              <option value="premium">Premium (₹49)</option>
                              <option value="pro">Pro (₹99)</option>
                            </select>
                          </div>

                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <Button
                              type="submit"
                              variant="admin"
                              loading={createLoading}
                              className="sm:ml-3"
                              fullWidth={!isMobile}
                            >
                              Create Subscription
                            </Button>
                            <button
                              type="button"
                              onClick={() => setShowCreateModal(false)}
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminMobileAppWrapper>
  );
};

export default StudentsPage;




