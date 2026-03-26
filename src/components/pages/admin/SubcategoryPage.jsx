'use client';

import { useState, useEffect, useCallback } from 'react';
import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import SearchFilter from '../../SearchFilter';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { isMobile } from 'react-device-detect';
import useDebounce from '../../../hooks/useDebounce';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';

const SubcategoryPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');
  const [showForm, setShowForm] = useState(false);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchSubcategories = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: itemsPerPage,
        ...(search && { search })
      };
      const response = await API.getAdminSubcategories(params);
      setSubcategories(response.subcategories || response);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await API.getAdminCategories();
      setCategories(response.categories || response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubcategories(currentPage, debouncedSearch, itemsPerPage);
  }, [currentPage, debouncedSearch, itemsPerPage, fetchSubcategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.updateSubcategory(editingId, { name, category, description });
        toast.success('Subcategory updated successfully!');
        setEditingId(null);
      } else {
        await API.createSubcategory({ name, category, description });
        toast.success('Subcategory created successfully!');
      }
      setName('');
      setCategory('');
      setDescription('');
      setShowForm(false);
      fetchSubcategories(currentPage, searchTerm);
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error(error.message || 'Failed to save subcategory');
    }
  };

  const handleEdit = (subcategory) => {
    setEditingId(subcategory._id);
    setName(subcategory.name);
    setCategory(subcategory.category._id || subcategory.category);
    setDescription(subcategory.description || '');
    setShowForm(!showForm);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await API.deleteSubcategory(id);
        toast.success('Subcategory deleted successfully!');
        fetchSubcategories(currentPage, searchTerm);
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        toast.error('Failed to delete subcategory');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setCategory('');
    setShowForm(false);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-[1000px] md:w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                S.No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Quizzes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {subcategories.map((subcategory) => (
              <tr key={subcategory._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {((currentPage - 1) * itemsPerPage) + subcategories.indexOf(subcategory) + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {subcategory.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {subcategory.quizCount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {subcategory.description || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                  {subcategory.category?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {(() => {
                      const date = new Date(subcategory.createdAt);
                      const day = date.getDate().toString().padStart(2, '0');
                      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                      const month = monthNames[date.getMonth()];
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(subcategory.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(subcategory)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subcategory._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {subcategories.map((subcategory) => (
        <div key={subcategory._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {subcategory.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(subcategory)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(subcategory._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {subcategory.category?.name || 'Unknown'}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              Quizzes: {subcategory.quizCount}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {subcategory.description || 'No description available'}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Created: {(() => {
                const date = new Date(subcategory.createdAt);
                const day = date.getDate().toString().padStart(2, '0');
                const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
              })()} at {new Date(subcategory.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {subcategories.map((subcategory) => (
          <div key={subcategory._id} className="p-2 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {subcategory.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {subcategory.description || 'No description available'}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Quizzes: {subcategory.quizCount}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {subcategory.category?.name || 'Unknown'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Created: {(() => {
                    const date = new Date(subcategory.createdAt);
                    const day = date.getDate().toString().padStart(2, '0');
                    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    const month = monthNames[date.getMonth()];
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()} at {new Date(subcategory.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(subcategory)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(subcategory._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Subcategories">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Subcategories ({pagination.total})
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Create, edit, and delete subcategories
                </p>
              </div>
              {/* Search and Filters */}
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                placeholder="Search subcategories..."
              />
              <ViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
                views={['table', 'list', 'grid']}
              />
              <Button
                variant="admin"
                onClick={() => setShowForm(!showForm)}
                icon={<FaPlus className="w-4 h-4" />}
              >
                Add Subcategory
              </Button>
              <div className="flex items-center space-x-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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


            {/* Form */}
            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">
                  {editingId ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subcategory Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter subcategory name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter category description"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      variant="admin"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </Button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loading size="md" color="gray" message="" />
              </div>
            ) : subcategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📂</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No subcategories found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first subcategory.'}
                </p>
              </div>
            ) : (
              <>
                {viewMode === 'table' && <TableView />}
                {viewMode === 'grid' && <CardView />}
                {viewMode === 'list' && <ListView />}
              </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default SubcategoryPage;




