'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, MapPin, Plus, Search, Edit3, Trash2, X, Table as TableIcon, LayoutGrid, List } from 'lucide-react';
import { isMobile } from 'react-device-detect';
import API from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { useSSR } from '../../../hooks/useSSR';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import StyledSelect from '../../ui/StyledSelect';
import Sidebar from '../../Sidebar';
import useDebounce from '../../../hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const StatusBadge = ({ isActive }) => (
  <span className={`text-xs font-bold px-2 py-1 rounded-full ${isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const LocationsPage = () => {
  const { isMounted } = useSSR();
  const [activeTab, setActiveTab] = useState('states');
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');

  // Paginated list for the States tab itself
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [stateSearch, setStateSearch] = useState('');
  const [statePage, setStatePage] = useState(1);
  const [stateItemsPerPage, setStateItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [statePagination, setStatePagination] = useState({});
  const [stateModal, setStateModal] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [stateForm, setStateForm] = useState({ name: '' });

  // Full, unpaginated state list — only for the city-state filter and the city form's state picker
  const [allStates, setAllStates] = useState([]);

  const debouncedStateSearch = useDebounce(stateSearch, 500);

  const fetchStates = useCallback(async (page, search) => {
    setStatesLoading(true);
    try {
      const res = await API.getAdminStates({ page, limit: stateItemsPerPage, search });
      if (res?.success) {
        setStates(res.data || []);
        setStatePagination(res.pagination || {});
      }
    } catch (e) {
      toast.error('Unable to load states.');
    } finally {
      setStatesLoading(false);
    }
  }, [stateItemsPerPage]);

  const fetchAllStates = useCallback(async () => {
    try {
      const res = await API.getAdminStates({ limit: 1000 });
      if (res?.success) setAllStates(res.data || []);
    } catch (e) {
      toast.error('Unable to load states.');
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'states') return;
    fetchStates(statePage, debouncedStateSearch);
  }, [activeTab, statePage, debouncedStateSearch, fetchStates]);

  useEffect(() => { setStatePage(1); }, [debouncedStateSearch]);

  useEffect(() => { fetchAllStates(); }, [fetchAllStates]);

  const refreshStates = () => {
    fetchStates(statePage, debouncedStateSearch);
    fetchAllStates();
  };

  const openCreateState = () => { setEditingState(null); setStateForm({ name: '' }); setStateModal(true); };
  const openEditState = (state) => { setEditingState(state); setStateForm({ name: state.name }); setStateModal(true); };

  const handleStateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editingState
        ? await API.updateState(editingState._id, stateForm)
        : await API.createState(stateForm);
      if (res?.success) {
        toast.success(editingState ? 'State updated' : 'State created');
        setStateModal(false);
        refreshStates();
      } else {
        toast.error(res?.message || 'Failed to save state');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save state');
    }
  };

  const handleDeleteState = async (state) => {
    if (!window.confirm(`Deactivate "${state.name}"? Cities already linked to it are unaffected.`)) return;
    try {
      await API.deleteState(state._id);
      toast.success('State deactivated');
      refreshStates();
    } catch (err) {
      toast.error('Failed to deactivate state');
    }
  };

  // Cities
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [cityStateFilter, setCityStateFilter] = useState('');
  const [cityPage, setCityPage] = useState(1);
  const [cityItemsPerPage, setCityItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [cityPagination, setCityPagination] = useState({});
  const [cityModal, setCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityForm, setCityForm] = useState({ name: '', state: '' });

  const debouncedCitySearch = useDebounce(citySearch, 500);

  const fetchCities = useCallback(async (page, search, stateId) => {
    setCitiesLoading(true);
    try {
      const res = await API.getAdminCities({ page, limit: cityItemsPerPage, search, state: stateId });
      if (res?.success) {
        setCities(res.data || []);
        setCityPagination(res.pagination || {});
      }
    } catch (e) {
      toast.error('Unable to load cities.');
    } finally {
      setCitiesLoading(false);
    }
  }, [cityItemsPerPage]);

  useEffect(() => {
    if (activeTab !== 'cities') return;
    fetchCities(cityPage, debouncedCitySearch, cityStateFilter);
  }, [activeTab, cityPage, debouncedCitySearch, cityStateFilter, fetchCities]);

  useEffect(() => { setCityPage(1); }, [debouncedCitySearch, cityStateFilter]);

  const stateOptions = allStates.map(s => ({ value: s._id, label: s.name }));

  const openCreateCity = () => { setEditingCity(null); setCityForm({ name: '', state: cityStateFilter || '' }); setCityModal(true); };
  const openEditCity = (city) => { setEditingCity(city); setCityForm({ name: city.name, state: city.state?._id || '' }); setCityModal(true); };

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    if (!cityForm.state) { toast.error('Please select a state.'); return; }
    try {
      const res = editingCity
        ? await API.updateCity(editingCity._id, cityForm)
        : await API.createCity(cityForm);
      if (res?.success) {
        toast.success(editingCity ? 'City updated' : 'City created');
        setCityModal(false);
        fetchCities(cityPage, debouncedCitySearch, cityStateFilter);
      } else {
        toast.error(res?.message || 'Failed to save city');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save city');
    }
  };

  const handleDeleteCity = async (city) => {
    if (!window.confirm(`Deactivate "${city.name}"?`)) return;
    try {
      await API.deleteCity(city._id);
      toast.success('City deactivated');
      fetchCities(cityPage, debouncedCitySearch, cityStateFilter);
    } catch (err) {
      toast.error('Failed to deactivate city');
    }
  };

  const stateColumns = [
    { key: 'name', header: 'State', render: (_, s) => <span className="font-bold text-slate-900 dark:text-white">{s.name}</span> },
    { key: 'status', header: 'Status', render: (_, s) => <StatusBadge isActive={s.isActive} /> },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, s) => (
        <div className="text-right">
          <button onClick={() => openEditState(s)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg mr-1"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDeleteState(s)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  const cityColumns = [
    { key: 'name', header: 'City', render: (_, c) => <span className="font-bold text-slate-900 dark:text-white">{c.name}</span> },
    {
      key: 'state', header: 'State', render: (_, c) => (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary-600">
          <MapPin className="w-3.5 h-3.5 text-primary-500" /> {c.state?.name || '—'}
        </span>
      )
    },
    { key: 'status', header: 'Status', render: (_, c) => <StatusBadge isActive={c.isActive} /> },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, c) => (
        <div className="text-right">
          <button onClick={() => openEditCity(c)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg mr-1"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDeleteCity(c)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  const tabButtons = (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg xl:rounded-xl w-full xl:w-auto">
      {[
        { id: 'states', label: 'States', icon: Landmark },
        { id: 'cities', label: 'Cities', icon: MapPin }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 xl:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <tab.icon className="w-3.5 h-3.5" /> {tab.label}
        </button>
      ))}
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

  const stateFilters = (
    <>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search states..." value={stateSearch} onChange={e => setStateSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl text-sm" />
      </div>
      {viewToggleButtons}
      <button onClick={openCreateState} className="w-full xl:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:bg-primary-700">
        <Plus className="w-4 h-4" /> Add State
      </button>
      <Pagination
        compact
        currentPage={statePage}
        totalPages={statePagination.totalPages || 1}
        onPageChange={setStatePage}
        totalItems={statePagination.total || 0}
        itemsPerPage={stateItemsPerPage}
        onItemsPerPageChange={(val) => { setStateItemsPerPage(val); setStatePage(1); }}
      />
    </>
  );

  const cityFilters = (
    <>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search cities..." value={citySearch} onChange={e => setCitySearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl text-sm" />
      </div>
      <StyledSelect
        icon={Landmark}
        value={cityStateFilter}
        onChange={setCityStateFilter}
        options={[{ value: '', label: 'All States' }, ...stateOptions]}
        placeholder="All States"
        className="w-full xl:w-56"
      />
      {viewToggleButtons}
      <button onClick={openCreateCity} className="w-full xl:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:bg-primary-700">
        <Plus className="w-4 h-4" /> Add City
      </button>
      <Pagination
        compact
        currentPage={cityPage}
        totalPages={cityPagination.totalPages || 1}
        onPageChange={setCityPage}
        totalItems={cityPagination.total || 0}
        itemsPerPage={cityItemsPerPage}
        onItemsPerPageChange={(val) => { setCityItemsPerPage(val); setCityPage(1); }}
      />
    </>
  );

  useAdminMobileHeader({
    title: 'Locations',
    count: activeTab === 'states' ? (statePagination.total || 0) : (cityPagination.total || 0),
    filters: activeTab === 'states' ? stateFilters : cityFilters
  });

  if (!isMounted) return null;

  const renderGridCard = (item, idx, { Icon, title, subtitle, onEdit, onDelete, page, itemsPerPage }) => (
    <div key={item._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="relative w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
        </div>
        <StatusBadge isActive={item.isActive} />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle}
      </div>
      <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
        <button onClick={onDelete} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /> Deactivate</button>
      </div>
    </div>
  );

  const renderListRow = (item, idx, { Icon, title, subtitle, onEdit, onDelete, page, itemsPerPage }) => (
    <div key={item._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 dark:text-white truncate">{title}</h3>
        {subtitle}
      </div>
      <StatusBadge isActive={item.isActive} />
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"><Edit3 className="w-4 h-4" /></button>
        <button onClick={onDelete} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">
        <div className="pb-3">{tabButtons}</div>
        <div className="flex-1 min-h-0 overflow-auto">
          {activeTab === 'states' ? (
            statesLoading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : viewMode === 'table' ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
                <ResponsiveTable data={states} columns={stateColumns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} emptyMessage="No states found" fillHeight />
              </div>
            ) : viewMode === 'grid' ? (
              <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                {states.map((s, idx) => renderGridCard(s, idx, {
                  Icon: Landmark,
                  title: s.name,
                  onEdit: () => openEditState(s),
                  onDelete: () => handleDeleteState(s),
                  page: statePage,
                  itemsPerPage: stateItemsPerPage
                }))}
                {states.length === 0 && <div className="col-span-full py-8 text-center text-slate-400">No states found</div>}
              </div>
            ) : (
              <div className="h-full overflow-auto space-y-2">
                {states.map((s, idx) => renderListRow(s, idx, {
                  Icon: Landmark,
                  title: s.name,
                  onEdit: () => openEditState(s),
                  onDelete: () => handleDeleteState(s),
                  page: statePage,
                  itemsPerPage: stateItemsPerPage
                }))}
                {states.length === 0 && <div className="py-8 text-center text-slate-400">No states found</div>}
              </div>
            )
          ) : (
            citiesLoading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : viewMode === 'table' ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
                <ResponsiveTable data={cities} columns={cityColumns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} emptyMessage="No cities found" fillHeight />
              </div>
            ) : viewMode === 'grid' ? (
              <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                {cities.map((c, idx) => renderGridCard(c, idx, {
                  Icon: MapPin,
                  title: c.name,
                  subtitle: <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-500" />{c.state?.name || '—'}</p>,
                  onEdit: () => openEditCity(c),
                  onDelete: () => handleDeleteCity(c),
                  page: cityPage,
                  itemsPerPage: cityItemsPerPage
                }))}
                {cities.length === 0 && <div className="col-span-full py-8 text-center text-slate-400">No cities found</div>}
              </div>
            ) : (
              <div className="h-full overflow-auto space-y-2">
                {cities.map((c, idx) => renderListRow(c, idx, {
                  Icon: MapPin,
                  title: c.name,
                  subtitle: <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-500" />{c.state?.name || '—'}</p>,
                  onEdit: () => openEditCity(c),
                  onDelete: () => handleDeleteCity(c),
                  page: cityPage,
                  itemsPerPage: cityItemsPerPage
                }))}
                {cities.length === 0 && <div className="py-8 text-center text-slate-400">No cities found</div>}
              </div>
            )
          )}
        </div>

        {/* State Modal */}
        <AnimatePresence>
          {stateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStateModal(false)} className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-3xl" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'tween', duration: 0.2 }} className="relative w-full max-w-md bg-white dark:bg-[#0A0F1E] rounded-3xl border-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{editingState ? 'Edit' : 'Add'} State</h2>
                  <button onClick={() => setStateModal(false)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-black dark:hover:text-white rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleStateSubmit} className="p-6 space-y-4">
                  <input required placeholder="State name" value={stateForm.name} onChange={e => setStateForm({ name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold" />
                  <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-sm transition-all">
                    {editingState ? 'Save Changes' : 'Create State'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* City Modal */}
        <AnimatePresence>
          {cityModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCityModal(false)} className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-3xl" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'tween', duration: 0.2 }} className="relative w-full max-w-md bg-white dark:bg-[#0A0F1E] rounded-3xl border-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{editingCity ? 'Edit' : 'Add'} City</h2>
                  <button onClick={() => setCityModal(false)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-black dark:hover:text-white rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCitySubmit} className="p-6 space-y-4">
                  <input required placeholder="City name" value={cityForm.name} onChange={e => setCityForm({ ...cityForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold" />
                  <StyledSelect
                    icon={Landmark}
                    value={cityForm.state}
                    onChange={(val) => setCityForm({ ...cityForm, state: val })}
                    options={stateOptions}
                    placeholder="Select state"
                    className="w-full"
                  />
                  <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-sm transition-all">
                    {editingCity ? 'Save Changes' : 'Create City'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LocationsPage;
