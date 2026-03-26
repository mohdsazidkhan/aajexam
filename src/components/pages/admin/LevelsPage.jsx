'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdCancel, MdSearch, MdRefresh } from 'react-icons/md';
import { FaTh, FaList, FaTable } from 'react-icons/fa';
import { isMobile } from 'react-device-detect';

const LevelsPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const isOpen = useSelector((state) => state.sidebar?.isOpen);
  const user = useSelector((state) => state.auth?.user);

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    levelNumber: '',
    name: '',
    description: '',
    quizzesRequired: '',
    emoji: '🎯',
    requiredSubscription: 'free',
    color: '#3B82F6',
    icon: '',
    isActive: true
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // View mode - default table for web, list/grid for mobile
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
    }
    return 'table';
  });

  const isAdminRoute = router?.pathname?.startsWith('/admin');

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.getAdminLevels({
        limit: 100,
        isActive: filterActive === 'all' ? undefined : filterActive === 'active'
      });

      if (response.success) {
        setLevels(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch levels');
      console.error('Error fetching levels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      levelNumber: '',
      name: '',
      description: '',
      quizzesRequired: '',
      emoji: '🎯',
      requiredSubscription: 'free',
      color: '#3B82F6',
      icon: '',
      isActive: true
    });
    setEditingLevel(null);
  };

  const handleCreateLevel = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await API.createAdminLevel({
        ...formData,
        levelNumber: parseInt(formData.levelNumber),
        quizzesRequired: parseInt(formData.quizzesRequired)
      });

      if (response.success) {
        setSuccess('Level created successfully!');
        fetchLevels();
        setShowModal(false);
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create level');
    }
  };

  const handleUpdateLevel = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await API.updateAdminLevel(editingLevel._id, {
        ...formData,
        levelNumber: parseInt(formData.levelNumber),
        quizzesRequired: parseInt(formData.quizzesRequired)
      });

      if (response.success) {
        setSuccess('Level updated successfully!');
        fetchLevels();
        setShowModal(false);
        resetForm();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update level');
    }
  };

  const handleDeleteLevel = async (levelId) => {
    try {
      setError(null);
      const response = await API.deleteAdminLevel(levelId);

      if (response.success) {
        setSuccess('Level deleted successfully!');
        fetchLevels();
        setShowDeleteConfirm(null);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete level');
      setShowDeleteConfirm(null);
    }
  };

  const openEditModal = (level) => {
    setEditingLevel(level);
    setFormData({
      levelNumber: level.levelNumber,
      name: level.name,
      description: level.description,
      quizzesRequired: level.quizzesRequired,
      emoji: level.emoji || '🎯',
      requiredSubscription: level.requiredSubscription || 'free',
      color: level.color || '#3B82F6',
      icon: level.icon || '',
      isActive: level.isActive
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const filteredLevels = levels.filter(level => {
    const matchesSearch =
      level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.levelNumber.toString().includes(searchTerm);

    return matchesSearch;
  });

  if (!isMounted || !isRouterReady) {
    return (
      <AdminMobileAppWrapper title="Levels ">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && isAdminRoute && <Sidebar />}
          <div className="adminContent p-4 w-full">
            <div className="flex items-center justify-center h-64">
              <div className="text-2xl text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Levels">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions Bar */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

            {/* Heading */}
            <div>
              <h1 className="text-2xl md:text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🎯 Levels
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage user levels
              </p>
            </div>
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-sm">
              <input
                type="text"
                placeholder="Search levels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                fetchLevels();
              }}
              className="w-full lg:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500"
            >
              <option value="all">All Levels</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {/* View Toggle and Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              {/* View Toggle Buttons */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center ${viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-secondary-600 dark:text-secondary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  title="Table View"
                >
                  <FaTable className="text-lg" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-secondary-600 dark:text-secondary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  title="Grid View"
                >
                  <FaTh className="text-lg" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-secondary-600 dark:text-secondary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  title="List View"
                >
                  <FaList className="text-lg" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Create Button */}
              <Button
                variant="admin"
                onClick={openCreateModal}
                icon={<MdAdd />}
              >
                Create Level
              </Button>
            </div>


          </div>

          {/* Levels Display - Table/Grid/List Views */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loading size="lg" color="yellow" message="Loading levels..." />
            </div>
          ) : filteredLevels.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No levels found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first level to get started.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quizzes Required
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Subscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLevels.map((level) => (
                        <tr key={level._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{level.emoji}</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {level.levelNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {level.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                              {level.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {level.quizzesRequired}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${level.requiredSubscription === 'free' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
                              ${level.requiredSubscription === 'pro' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : ''}
                            `}>
                              {level.requiredSubscription}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${level.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                              {level.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openEditModal(level)}
                              className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-300 mr-4"
                            >
                              <MdEdit className="inline text-xl" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(level)}
                              className="text-primary-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <MdDelete className="inline text-xl" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredLevels.map((level) => (
                    <div
                      key={level._id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: level.color || '#3B82F6'
                      }}
                    >
                      {/* Header */}
                      <div
                        className="p-4 text-white"
                        style={{
                          background: `linear-gradient(135deg, ${level.color || '#3B82F6'} 0%, ${level.color || '#3B82F6'}dd 100%)`
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{level.emoji}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${level.isActive
                            ? 'bg-green-500/30 text-white'
                            : 'bg-red-500/30 text-white'
                            }`}>
                            {level.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-lg font-bold">Level {level.levelNumber}</div>
                        <div className="text-sm opacity-90">{level.name}</div>
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {level.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Quizzes</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {level.quizzesRequired}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Subscription</div>
                            <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full 
                              ${level.requiredSubscription === 'free' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
                              ${level.requiredSubscription === 'pro' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : ''}
                            `}>
                              {level.requiredSubscription}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => openEditModal(level)}
                            className="flex-1 px-3 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <MdEdit className="text-lg" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(level)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredLevels.map((level) => (
                    <div
                      key={level._id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Left Section */}
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className="flex-shrink-0 w-8 lg:w-16 h-8 lg:h-16 rounded-lg flex items-center justify-center text-xl lg:text-3xl"
                              style={{ backgroundColor: `${level.color || '#3B82F6'}20` }}
                            >
                              {level.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  Level {level.levelNumber}: {level.name}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${level.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                  {level.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {level.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 dark:text-gray-400">Quizzes Required:</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{level.quizzesRequired}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 dark:text-gray-400">Subscription:</span>
                                  <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full 
                                    ${level.requiredSubscription === 'free' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
                                    ${level.requiredSubscription === 'pro' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : ''}
                                  `}>
                                    {level.requiredSubscription}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0 w-full lg:w-auto justify-end lg:justify-start">
                            <button
                              onClick={() => openEditModal(level)}
                              className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <MdEdit className="text-lg" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(level)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <MdDelete className="text-lg" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingLevel ? 'Edit Level' : 'Create New Level'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <MdClose className="text-2xl" />
                    </button>
                  </div>

                  <form onSubmit={editingLevel ? handleUpdateLevel : handleCreateLevel} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Level Number *
                        </label>
                        <input
                          type="number"
                          name="levelNumber"
                          value={formData.levelNumber}
                          onChange={handleInputChange}
                          required
                          min="0"
                          max="100"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Emoji
                        </label>
                        <input
                          type="text"
                          name="emoji"
                          value={formData.emoji}
                          onChange={handleInputChange}
                          placeholder="🎯"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Starter, Rookie, Legend"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        placeholder="Describe this level..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quizzes Required *
                        </label>
                        <input
                          type="number"
                          name="quizzesRequired"
                          value={formData.quizzesRequired}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Required Subscription
                        </label>
                        <select
                          name="requiredSubscription"
                          value={formData.requiredSubscription}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500"
                        >
                          <option value="free">Free</option>
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="pro">Pro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Color
                        </label>
                        <input
                          type="color"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="w-full h-10 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-secondary-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                        className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MdCancel /> Cancel
                      </button>
                      <Button
                        type="submit"
                        variant="admin"
                        icon={<MdSave />}
                      >
                        {editingLevel ? 'Update' : 'Create'} Level
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h2 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Confirm Delete
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong> (Level {showDeleteConfirm.levelNumber})?
                  This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteLevel(showDeleteConfirm._id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default LevelsPage;

