'use client';

import Select from '../../common/ui/Select';
import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from 'react-hot-toast';
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import Link from "next/link";
import {
  Edit3,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  X,
  Settings,
  Building2,
  Globe2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Table as TableIcon,
  Zap,
  Calendar,
  Eye
} from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { AdminTableSkeleton } from '../Skeletons';
import ResponsiveTable from '../../common/ResponsiveTable';
import Pagination from '../../common/Pagination';
import StyledSelect from '../../common/ui/StyledSelect';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminGovtExams = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    if (window.innerWidth < 768) setViewMode('grid');
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    code: "",
    description: "",
    logo: "",
    isActive: true
  });
  const user = getCurrentUser();

  useEffect(() => {
    fetchCategories();
    fetchAllExams();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.getRealExamCategories();
      if (response?.success) setCategories(response.data || []);
      else if (Array.isArray(response)) setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAllExams = async () => {
    setLoading(true);
    try {
      const response = await API.getAdminExams();
      if (response?.success) setExams(response.data || []);
      else if (Array.isArray(response)) setExams(response);
    } catch (error) {
      console.error("Error fetching all exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExam(null);
    setFormData({
      category: selectedCategory !== "all" ? selectedCategory : "",
      name: "",
      code: "",
      description: "",
      logo: "",
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      category: exam.category?._id || exam.category || "",
      name: exam.name || "",
      code: exam.code || "",
      description: exam.description || "",
      logo: exam.logo || "",
      isActive: exam.isActive !== undefined ? exam.isActive : true
    });
    setShowModal(true);
  };

  const handleDelete = async (examId) => {
    if (!confirm("Are you sure? This delete all patterns and tests associated with it.")) return;
    try {
      await API.deleteExam(examId);
      toast.success("Exam deleted");
      fetchAllExams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) await API.updateExam(editingExam._id, formData);
      else await API.createExam(formData);
      toast.success(`Exam ${editingExam ? 'updated' : 'created'}`);
      setShowModal(false);
      fetchAllExams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save");
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesCategory = selectedCategory === "all" || exam.category?._id === selectedCategory || exam.category === selectedCategory;
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) || exam.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const examTotalPages = Math.max(1, Math.ceil(filteredExams.length / itemsPerPage));
  const pagedExams = filteredExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, itemsPerPage]);

  const examColumns = [
    {
      key: 'code', header: 'Exam Code', render: (_, exam) => (
        <span className="px-3 py-1 text-on-primary rounded-lg text-[10px] font-bold bg-primary-600">{exam.code}</span>
      )
    },
    {
      key: 'name', header: 'Exam Name', render: (_, exam) => (
        <span className="font-bold text-content-primary uppercase italic tracking-tight">{exam.name}</span>
      )
    },
    {
      key: 'category', header: 'Category', render: (_, exam) => (
        <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">{exam.category?.name || 'Uncategorized'}</span>
      )
    },
    {
      key: 'isActive', header: 'Status', align: 'center', render: (_, exam) => (
        <div className="flex justify-center">
          <div className={`px-4 py-1.5 rounded-lg xl:rounded-xl border text-[9px] font-bold uppercase flex items-center gap-2 ${exam.isActive ? 'text-primary-600 border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-content-primary border-border-primary'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${exam.isActive ? 'bg-primary-600 animate-pulse' : 'bg-primary-600'}`} />
            {exam.isActive ? 'Online' : 'Offline'}
          </div>
        </div>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, exam) => (
        <div className="flex justify-end gap-3">
          <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`}>
            <motion.button whileHover={{ scale: 1.1 }} className="p-3 text-on-primary rounded-lg xl:rounded-xl border border-primary-500/20 bg-primary-600">
              <Zap className="w-4 h-4" />
            </motion.button>
          </Link>
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(exam)} className="p-3 text-on-primary rounded-lg xl:rounded-xl bg-primary-600">
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(exam._id)} className="p-3 bg-black/10 dark:bg-white/10 text-content-primary rounded-lg xl:rounded-xl border border-border-primary">
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative group w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within:text-primary-600 transition-colors" />
      <input
        type="text"
        placeholder="Search exam name or code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-background-surface-secondary border focus:border-primary-500/30 rounded-lg xl:rounded-xl text-[10px] font-bold uppercase tracking-[0.08em] outline-none transition-all border-border-primary"
      />
    </div>
  );

  const categoryFilterSelect = (
    <StyledSelect
      icon={Layers}
      value={selectedCategory}
      onChange={(val) => setSelectedCategory(val)}
      options={[{ value: 'all', label: 'ALL CATEGORIES' }, ...categories.map(cat => ({ value: cat._id, label: cat.name.toUpperCase() }))]}
      className="w-full xl:w-auto xl:min-w-[170px]"
    />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' },
        { icon: List, id: 'list', label: 'List View' }
      ].map((mode) => (
        <button
          key={mode.id}
          onClick={() => setViewMode(mode.id)}
          title={mode.label}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const addExamButton = (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={handleCreate}
      className="w-full xl:w-auto px-4 xl:px-4 py-2.5 hover:brightness-110 text-on-primary rounded-lg xl:rounded-xl text-[10px] font-bold uppercase tracking-[0.08em] flex items-center justify-center gap-2 bg-primary-600"
    >
      <Plus className="w-4 h-4" /> ADD EXAM
    </motion.button>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={currentPage}
      totalPages={examTotalPages}
      onPageChange={setCurrentPage}
      totalItems={filteredExams.length}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
    />
  );

  useAdminMobileHeader({
    title: 'Exams',
    count: exams.length,
    filters: (
      <>
        {searchInput}
        {categoryFilterSelect}
        {viewToggleButtons}
        {addExamButton}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return null;

  return (<div className="py-4 w-full mx-auto text-content-primary font-outfit">

    {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

    {/* Content */}
    <AnimatePresence mode="wait">
      {loading ? (
        <AdminTableSkeleton showHeader={false} showFilters={false} />
      ) : filteredExams.length === 0 ? (
        <section className="rounded-lg xl:rounded-xl xl:rounded-3xl border border-dashed border-border-primary p-20 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4 xl:mb-4 opacity-20" />
          <h3 className="text-xl xl:text-3xl font-bold text-content-primary tracking-tight mb-4 font-outfit">No Records Found</h3>
          <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em]">No exams match your filters. Try adjusting your search or category.</p>
        </section>
      ) : (
        <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {viewMode === 'table' && (
            <div className="rounded-lg xl:rounded-xl xl:rounded-3xl border border-border-primary overflow-hidden">
              <ResponsiveTable data={pagedExams} columns={examColumns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} />
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-4">
              {filteredExams.map((exam, idx) => {
                const serialNumber = idx + 1;
                return (
                <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-lg xl:rounded-xl xl:rounded-3xl border border-border-primary p-3 xl:p-5 relative font-outfit">
                  <div className="absolute top-6 right-6">
                    <div className={`px-4 py-1.5 rounded-lg xl:rounded-xl border text-[8px] font-bold uppercase tracking-[0.08em] ${exam.isActive ? 'text-primary-600 border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-content-primary border-border-primary'}`}>
                      {exam.isActive ? 'LIVE' : 'INACTIVE'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 xl:gap-3 mb-4 xl:mb-4 group">
                    <div className="relative p-3 xl:p-4 text-on-primary rounded-lg xl:rounded-2xl transition-transform group-hover:rotate-6 shrink-0 bg-primary-600">
                      <Building2 className="w-4 h-4 xl:w-8 xl:h-8" />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#0A0F1E]">{serialNumber}</span>
                    </div>
                    <div className="min-w-0 pr-16 xl:pr-0">
                      <div className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em] mb-1">{exam.code}</div>
                      <h3 className="text-base xl:text-xl font-bold text-content-primary italic tracking-tight leading-tight">{exam.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 xl:space-y-3 mb-4 xl:mb-4">
                    <div className="p-4 bg-background-surface-secondary rounded-2xl border border-border-primary flex justify-between">
                      <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">Category</span>
                      <span className="text-xs font-bold text-content-primary uppercase tracking-tight">{exam.category?.name}</span>
                    </div>
                    <p className="text-[10px] font-bold text-content-muted line-clamp-2 uppercase tracking-[0.08em] leading-none mb-2">{exam.description || 'No description provided.'}</p>
                  </div>
                  <div className="flex gap-3 pt-3 xl:pt-6 border-t-2 border-border-primary">
                    <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`} className="flex-1">
                      <motion.button whileHover={{ scale: 1.02 }} className="w-full py-2.5 text-on-primary rounded-2xl text-[10px] font-bold uppercase tracking-[0.08em] bg-primary-600">Patterns</motion.button>
                    </Link>
                    <motion.button onClick={() => handleEdit(exam)} className="p-4 bg-background-surface-secondary text-content-muted rounded-lg xl:rounded-xl hover:text-primary-600 transition-colors"><Edit3 className="w-5 h-5" /></motion.button>
                    <motion.button onClick={() => handleDelete(exam._id)} className="p-4 bg-background-surface-secondary text-content-muted rounded-lg xl:rounded-xl hover:text-content-primary dark:hover:text-white transition-colors"><Trash2 className="w-5 h-5" /></motion.button>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-3 xl:space-y-3">
              {filteredExams.map((exam, idx) => {
                const serialNumber = idx + 1;
                return (
                <motion.div key={exam._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-lg xl:rounded-xl xl:rounded-3xl border border-border-primary p-3 xl:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 xl:gap-3 hover:border-primary-500/30 transition-all font-outfit">
                  <div className="flex items-center gap-3 xl:gap-3">
                    <div className="relative min-w-[4.5rem] h-16 px-2 shrink-0 text-on-primary rounded-2xl flex items-center justify-center text-center font-bold italic transition-transform text-[10px] leading-tight break-words bg-primary-600">
                      {exam.code}
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#0A0F1E]">{serialNumber}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-content-primary italic tracking-tight leading-none mb-1">{exam.name}</h3>
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em]">{exam.category?.name}</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${exam.isActive ?'bg-primary-600 animate-pulse':'bg-primary-600'}`} />
                          <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">{exam.isActive ? 'Active' : 'Offline'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`}>
                      <motion.button whileHover={{ scale: 1.05 }} className="px-4 xl:px-5 py-2 text-on-primary rounded-lg xl:rounded-xl font-bold text-[10px] uppercase tracking-[0.08em] bg-primary-600">Manage Patterns</motion.button>
                    </Link>
                    <div className="w-px h-10 bg-background-surface-secondary mx-2" />
                    <motion.button onClick={() => handleEdit(exam)} className="p-3 bg-background-surface-secondary text-content-muted rounded-lg xl:rounded-xl hover:text-primary-600"><Edit3 className="w-5 h-5" /></motion.button>
                    <motion.button onClick={() => handleDelete(exam._id)} className="p-3 bg-background-surface-secondary text-content-muted rounded-lg xl:rounded-xl hover:text-content-primary dark:hover:text-white"><Trash2 className="w-5 h-5" /></motion.button>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>


    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[999]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/60" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-y-0 right-0 left-0 w-full bg-background-surface dark:bg-[#0A0F1E] xl:rounded-l-2xl border-l-2 border-border-primary overflow-hidden flex flex-col">
            <section className="px-4 py-2.5 border-b-2 border-border-primary flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 text-on-primary rounded-2xl bg-primary-600">
                  <Settings className="w-5 h-5" />
                </div>
                <section>
                  <h2 className="text-base xl:text-base font-bold text-content-primary uppercase italic tracking-tight">{editingExam ? 'Edit' : 'Add'} <span className="text-primary-600">Exam</span></h2>
                  <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">{editingExam ? `Editing: ${editingExam.name}` : 'Create a new exam'}</p>
                </section>
              </div>
              <button aria-label="Close" onClick={() => setShowModal(false)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg xl:rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </section>
            <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
<div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 xl:p-5 space-y-3">
              <div className="space-y-2 xl:space-y-3 xl:space-y-4">
                <div className="space-y-2 xl:space-y-3">
                  <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4 block border-l-4 border-primary-600 pl-3">Category</label>
                  <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-3 xl:px-4 py-3 bg-background-surface border focus:border-primary-500/30 rounded-2xl text-xs font-bold uppercase tracking-[0.08em] outline-none appearance-none cursor-pointer border-border-primary">
                    <option value="">Select Category...</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>)}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3 xl:gap-3">
                  <div className="space-y-2 xl:space-y-3">
                    <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4 block border-l-4 border-primary-600 pl-3">Exam Code</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="E.G. SSC" required className="w-full px-3 xl:px-4 py-3 bg-background-surface border focus:border-primary-500/30 rounded-2xl text-xs font-bold uppercase outline-none border-border-primary" />
                  </div>
                  <div className="space-y-2 xl:space-y-3">
                    <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4 block border-l-4 border-primary-600 pl-3">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Exam Name" required className="w-full px-3 xl:px-4 py-3 bg-background-surface border focus:border-primary-500/30 rounded-2xl text-xs font-bold uppercase outline-none border-border-primary" />
                  </div>
                </div>
                <div className="space-y-2 xl:space-y-3">
                  <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4 block border-l-4 border-primary-600 pl-3">Overview (Description)</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Exam Details" rows="4" className="w-full px-4 xl:px-5 py-2 xl:py-3 bg-background-surface border focus:border-primary-500/30 rounded-lg xl:rounded-3xl text-xs font-bold uppercase outline-none resize-none border-border-primary" />
                </div>
                <div className="space-y-2 xl:space-y-3">
                  <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] ml-4 block border-l-4 border-primary-600 pl-3">Logo URL</label>
                  <input type="text" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="https://..." className="w-full px-3 xl:px-4 py-3 bg-background-surface border focus:border-primary-500/30 rounded-2xl text-xs font-bold outline-none border-border-primary" />
                </div>
                <div className="p-4 bg-background-surface-secondary rounded-3xl flex items-center justify-between border border-border-primary">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg xl:rounded-xl ${formData.isActive ? 'text-on-primary bg-primary-600' : 'bg-background-surface-secondary'}`}><Zap className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-content-primary uppercase tracking-[0.08em]">Active Status</p>
                      <p className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em]">{formData.isActive ? 'Published & Active' : 'Hidden from Students'}</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-6 h-6 rounded-lg text-primary-600 border border-border-primary cursor-pointer" />
                </div>
              </div>
              </div>
<div className="flex gap-3 shrink-0 px-4 xl:px-5 py-2.5 border-t border-border-primary bg-background-surface justify-end items-center">
 <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-background-surface-secondary text-content-muted rounded-2xl font-bold text-[10px] uppercase tracking-[0.08em]">Cancel</button>
 <button type="submit" className="px-6 py-3 text-on-primary rounded-2xl font-bold text-[10px] uppercase tracking-[0.08em] flex items-center justify-center gap-3 bg-primary-600">
 <CheckCircle2 className="w-5 h-5" /> {editingExam ? 'Save Changes' : 'Register Exam'}
 </button>
 </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
};

export default AdminGovtExams;

