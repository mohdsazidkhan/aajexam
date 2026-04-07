'use client';

import { useEffect, useState } from 'react';
import API from '../../../lib/api';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  RotateCcw,
  Search,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
  ChevronRight,
  Layers,
  Activity,
  Target,
  Trophy,
  Zap,
  Clock,
  Shield,
  Star,
  Settings,
  Lock,
  Unlock,
  Hash,
  Info,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import { useDarkMode } from '../../../hooks/useDarkMode';

const LevelsPage = () => {
  const { darkMode } = useDarkMode();
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
    emoji: 'Ã°Å¸Å½Â¯',
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
      emoji: 'Ã°Å¸Å½Â¯',
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
      emoji: level.emoji || 'Ã°Å¸Å½Â¯',
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
          <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">
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
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">

          {/* Status Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 lg:mb-8 p-6 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg lg:rounded-[2rem] flex items-center gap-4 backdrop-blur-xl"
              >
                <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">SUCCESS</p>
                  <p className="text-sm font-bold">{success}</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 lg:mb-8 p-6 bg-primary-500/10 border-2 border-primary-500/20 text-primary-600 dark:text-primary-400 rounded-lg lg:rounded-[2rem] flex items-center gap-4 backdrop-blur-xl"
              >
                <div className="p-3 rounded-2xl bg-primary-500 text-white shadow-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-500/80">ERROR</p>
                  <p className="text-sm font-bold">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4 lg:mb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-1 bg-amber-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80">USER PROGRESSION</span>
                </div>
                <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none font-outfit uppercase">
                  MANAGE <span className="text-amber-500">LEVELS</span>
                </h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-xl leading-relaxed">
                  Set up progression levels and quiz requirements for student advancement.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="px-3 lg:px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-100 dark:border-white/5 flex items-center gap-5 shadow-sm">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL LEVELS</p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">{levels.length}</p>
                  </div>
                </div>

                <div className="px-3 lg:px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-100 dark:border-white/5 flex items-center gap-5 shadow-sm">
                  <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ACTIVE LEVELS</p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">
                      {levels.filter(l => l.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6 p-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-slate-100 dark:border-white/5 rounded-xl lg:rounded-[2.5rem] shadow-sm">
              <div className="flex-1 w-full lg:w-auto relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search levels..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-sm font-bold placeholder:text-slate-400 transition-all outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border-2 border-transparent">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <TableIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ListIcon className="w-5 h-5" />
                  </button>
                </div>

                <select
                  value={filterActive}
                  onChange={(e) => {
                    setFilterActive(e.target.value);
                    fetchLevels();
                  }}
                  className="px-5 py-4 bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer focus:border-amber-500/30 transition-all"
                >
                  <option value="all">ALL LEVELS</option>
                  <option value="active">ACTIVE</option>
                  <option value="inactive">INACTIVE</option>
                </select>

                <Button
                  variant="admin"
                  onClick={openCreateModal}
                  className="!px-3 lg:px-6 !py-4 rounded-2xl !bg-amber-600 hover:!bg-amber-700 shadow-lg shadow-amber-500/20 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5 mr-3" /> Add Level
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Levels Display - Table/Grid/List Views */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loading size="lg" color="yellow" message="Loading levels..." />
            </div>
          ) : filteredLevels.length === 0 ? (
            <div className="text-center py-12 text-slate-700 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-2xl lg:text-6xl mb-4">ðŸŽ¯</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No levels found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first level to get started.'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'table' && (
                <div className="overflow-x-auto rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse bg-white dark:bg-[#0A0F1E]/60 backdrop-blur-3xl">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b-2 border-slate-100 dark:border-white/5">
                      <tr>
                        {[
                          { label: 'Level #', icon: Hash },
                          { label: 'Name', icon: Fingerprint },
                          { label: 'Description', icon: Info },
                          { label: 'Requirement', icon: Target },
                          { label: 'Access', icon: Lock },
                          { label: 'Status', icon: Activity },
                          { label: 'Actions', icon: Zap }
                        ].map((head, i) => (
                          <th key={i} className="px-3 lg:px-6 py-5 text-left">
                            <div className="flex items-center gap-2">
                              {head.icon && <head.icon className="w-3 h-3 text-amber-500" />}
                              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{head.label}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-50 dark:divide-white/5">
                      {filteredLevels.map((level, index) => (
                        <motion.tr
                          key={level._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors group"
                        >
                          <td className="px-3 lg:px-6 py-5">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl drop-shadow-md group-hover:scale-125 transition-transform">{level.emoji || 'ðŸŽ¯'}</span>
                              <span className="text-sm lg:text-xl font-black text-slate-900 dark:text-white">L{level.levelNumber}</span>
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-5">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{level.name}</span>
                          </td>
                          <td className="px-3 lg:px-6 py-5">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-[200px] truncate uppercase tracking-wide">
                              {level.description || 'NO_DESCRIPTION'}
                            </p>
                          </td>
                          <td className="px-3 lg:px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                              <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                                {level.quizzesRequired} QUIZZES
                              </span>
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-5">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${level.requiredSubscription === 'free'
                              ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                              : 'bg-primary-500/10 text-primary-500 border-primary-500/20'
                              }`}>
                              {level.requiredSubscription === 'free' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              {level.requiredSubscription}
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-5">
                            <div className={`flex items-center gap-1.5 ${level.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                              <div className={`w-2 h-2 rounded-full ${level.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{level.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                            </div>
                          </td>
                          <td className="px-3 lg:px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openEditModal(level)}
                                className="p-2 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                              >
                                <Edit3 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowDeleteConfirm(level)}
                                className="p-2 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                  {filteredLevels.map((level, index) => (
                    <motion.div
                      key={level._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -8 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all group overflow-hidden"
                    >
                      {/* Gradient Header */}
                      <div className="relative h-32 overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ background: `linear-gradient(135deg, ${level.color || '#F59E0B'} 0%, ${level.color ? level.color + 'dd' : '#D97706'} 100%)` }}
                        />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cyber-network.png')] opacity-20" />

                        <div className="relative z-10 p-6 flex justify-between items-start text-white">
                          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-lg">
                            {level.emoji || 'ðŸŽ¯'}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-2 ${level.isActive ? 'bg-emerald-500 border-white/20' : 'bg-slate-500 border-white/20'
                            }`}>
                            {level.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 lg:p-8 space-y-3 lg:space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-[0.2em] border border-amber-500/10">
                              LEVEL {level.levelNumber}
                            </div>
                          </div>
                          <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors">
                            {level.name}
                          </h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 line-clamp-2 leading-relaxed">
                            {level.description || 'No description available'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-6 border-b-2 border-slate-50 dark:border-white/5">
                          <div className="space-y-1">
                              <span className="text-sm font-black text-slate-900 dark:text-white">{level.quizzesRequired}</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Access Type</p>
                            <div className="flex items-center gap-2">
                              {level.requiredSubscription === 'free' ? <Unlock className="w-4 h-4 text-slate-400" /> : <Lock className="w-4 h-4 text-primary-500" />}
                              <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{level.requiredSubscription}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openEditModal(level)}
                            className="flex-1 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> EDIT
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowDeleteConfirm(level)}
                            className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl hover:bg-primary-500 hover:text-white transition-all border-2 border-primary-500/10 hover:border-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-3 lg:space-y-6">
                  {filteredLevels.map((level, index) => (
                    <motion.div
                      key={level._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 p-3 lg:p-8 hover:shadow-xl transition-all group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
                        <div className="flex items-center gap-3 lg:gap-8">
                          <div
                            className="w-20 h-20 rounded-lg lg:rounded-[2rem] flex items-center justify-center text-4xl shadow-xl group-hover:rotate-6 transition-transform relative overflow-hidden"
                            style={{ backgroundColor: `${level.color || '#F59E0B'}15`, border: `2px solid ${level.color || '#F59E0B'}30` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            {level.emoji || 'ðŸŽ¯'}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                L{level.levelNumber} <span className="text-slate-300 dark:text-slate-700 mx-2">/</span> {level.name}
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 ${level.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${level.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                  <span className="text-[8px] font-black tracking-widest">{level.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                                </div>
                              </h3>
                            </div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-2xl leading-relaxed">
                              {level.description || 'No description available'}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 lg:gap-6 pt-2">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement:</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{level.quizzesRequired} QUIZZES</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Type:</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{level.requiredSubscription}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 lg:pl-8 lg:border-l-2 border-slate-50 dark:border-white/5">
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(level)}
                            className="px-4 lg:px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all border-2 border-transparent"
                          >
                            <Edit3 className="w-4 h-4 inline mr-2" /> EDIT LEVEL
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowDeleteConfirm(level)}
                            className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create/Edit Modal */}
          <AnimatePresence>
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 lg:p-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-[#0A0F1E] rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/5 w-full max-w-3xl shadow-2xl overflow-hidden relative z-[101]"
                >
                  <div className="p-4 md:p-8 lg:p-12">
                    <div className="flex justify-between items-start mb-4 lg:mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Settings className="w-5 h-5 text-amber-500 animate-spin-slow" />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80">LEVEL CONFIGURATION</span>
                        </div>
                        <h2 className="text-2xl lg:text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                          {editingLevel ? 'Edit' : 'Create'} <span className="text-amber-500">Level</span>
                        </h2>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setShowModal(false); resetForm(); }}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary-500 transition-colors shadow-sm"
                      >
                        <X className="w-6 h-6" />
                      </motion.button>
                    </div>

                    <form onSubmit={editingLevel ? handleUpdateLevel : handleCreateLevel} className="space-y-4 lg:space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                        {/* Level Number & Emoji */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Level # & Emoji</label>
                          <div className="flex gap-4">
                            <div className="flex-1 relative group">
                              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                                <Hash className="w-5 h-5" />
                              </div>
                              <input
                                type="number"
                                name="levelNumber"
                                value={formData.levelNumber}
                                onChange={handleInputChange}
                                placeholder="ID"
                                className="w-full pl-14 pr-6 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-amber-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                                required
                              />
                            </div>
                            <div className="w-24 relative group">
                              <input
                                type="text"
                                name="emoji"
                                value={formData.emoji}
                                onChange={handleInputChange}
                                placeholder="ðŸŽ¯"
                                className="w-full px-3 lg:px-6 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-amber-500/30 rounded-2xl text-center text-2xl transition-all outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Level Name</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                              <Fingerprint className="w-5 h-5" />
                            </div>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="LEVEL NAME"
                              className="w-full pl-14 pr-6 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-amber-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Level Description</label>
                        <div className="relative group">
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter level description..."
                            rows="3"
                            className="w-full px-3 lg:px-6 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-amber-500/30 rounded-lg lg:rounded-[2rem] text-sm font-bold transition-all outline-none resize-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                        {/* Requirement */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Required Quizzes</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                              <Zap className="w-5 h-5" />
                            </div>
                            <input
                              type="number"
                              name="quizzesRequired"
                              value={formData.quizzesRequired}
                              onChange={handleInputChange}
                              placeholder="REQUIRED QUIZZES"
                              className="w-full pl-14 pr-6 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-amber-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                              required
                            />
                          </div>
                        </div>

                        {/* Access Control */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Access Type</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                              <Lock className="w-5 h-5" />
                            </div>
                            <select
                              name="requiredSubscription"
                              value={formData.requiredSubscription}
                              onChange={handleInputChange}
                              className="w-full pl-14 pr-10 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-amber-500/30 rounded-2xl text-sm font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="free">FREE ACCESS</option>
                              <option value="basic">BASIC</option>
                              <option value="premium">PREMIUM</option>
                              <option value="pro">PRO User</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Color & Status */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8 pt-6 border-t-2 border-slate-50 dark:border-white/5">
                        <div className="flex items-center gap-3 lg:gap-6">
                          <div className="space-y-2">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Level Color</p>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                              <input
                                type="color"
                                name="color"
                                value={formData.color}
                                onChange={handleInputChange}
                                className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer bg-transparent border-none p-0 scale-125"
                              />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formData.color}</span>
                            </div>
                          </div>

                          <motion.label
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <Activity className={`w-4 h-4 ${formData.isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Active</span>
                            </div>
                            <input
                              type="checkbox"
                              name="isActive"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                              className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500 transition-colors"
                            />
                          </motion.label>
                        </div>

                        <div className="flex gap-4">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowModal(false); resetForm(); }}
                            className="flex-1 py-4 px-3 lg:px-6 rounded-2xl border-2 border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-primary-500 hover:text-white hover:border-transparent transition-all"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-[2] py-4 px-3 lg:px-6 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                          >
                            <Save className="w-4 h-4" /> {editingLevel ? 'Update' : 'Create'}
                          </motion.button>
                        </div>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-[#0A0F1E] rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/5 w-full max-w-md shadow-2xl overflow-hidden relative z-[111]"
                >
                  <div className="p-3 lg:p-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 mb-4 lg:mb-8 relative">
                      <div className="absolute inset-0 bg-primary-500 animate-ping opacity-20 rounded-full" />
                      <Trash2 className="w-10 h-10 relative z-10" />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-primary-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500/80">DELETE LEVEL</span>
                    </div>

                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 lg:mb-10 leading-relaxed italic">
                      Are you sure you want to delete level: <span className="text-slate-900 dark:text-white underline">{showDeleteConfirm.name}</span>?<br />
                      This action cannot be undone.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDeleteConfirm(null)}
                        className="py-4 px-3 lg:px-6 rounded-2xl border-2 border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteLevel(showDeleteConfirm._id)}
                        className="py-4 px-3 lg:px-6 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default LevelsPage;



