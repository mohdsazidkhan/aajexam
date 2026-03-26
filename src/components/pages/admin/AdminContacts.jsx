'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import SearchFilter from '../../SearchFilter';
import { isMobile } from 'react-device-detect';
import {
  FaUser,
  FaEnvelope,
  FaRegCalendarAlt,
  FaTrash,
} from 'react-icons/fa';
import useDebounce from '../../../hooks/useDebounce';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';

export default function AdminContacts() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  // const [total, setTotal] = useState(0);
  // const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');


  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const debouncedSearch = useDebounce(searchTerm, 1000); // 1s delay

  useEffect(() => {
    fetchContacts(page, 10, debouncedSearch);
  }, [debouncedSearch, page]);


  const fetchContacts = async (currentpage = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentpage.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await API.getAdminContacts(params);
      setContacts(response.contacts || response);
      setPagination(response.pagination || {});

    } catch (err) {
      setError('Failed to fetch contacts');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const res = await API.getAdminContacts(id)
        if (res.ok) {
          toast.success('Contact deleted successfully!');
          fetchContacts(page, 10, searchTerm);
        } else {
          toast.error('Failed to delete contact');
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact');
      }
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Message
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
            {contacts.map((contact) => (
              <tr key={contact._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {((page - 1) * 20) + contacts.indexOf(contact) + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="w-4 h-4 text-orange-700 dark:text-yellow-400" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {contact.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                    <FaEnvelope className="w-4 h-4 mr-2" />
                    {contact.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {contact.message}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(contact.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(contact.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                      variant="admin"
                      size="small"
                      icon={<FaEnvelope className="w-4 h-4" />}
                      title="Send Email"
                    />
                    <Button
                      onClick={() => handleDelete(contact._id)}
                      variant="danger"
                      size="small"
                      icon={<FaTrash className="w-4 h-4" />}
                      title="Delete Contact"
                    />
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
      {contacts.map((contact) => (
        <div key={contact._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <FaUser className="w-5 h-5 text-orange-700 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {contact.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {contact.email}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                  variant="admin"
                  size="small"
                  icon={<FaEnvelope className="w-4 h-4" />}
                  title="Send Email"
                />
                <Button
                  onClick={() => handleDelete(contact._id)}
                  variant="danger"
                  size="small"
                  icon={<FaTrash className="w-4 h-4" />}
                  title="Delete Contact"
                />
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {contact.message}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <FaRegCalendarAlt className="inline mr-1" />
              {formatDate(contact.createdAt)} at {formatTime(contact.createdAt)}
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
        {contacts.map((contact) => (
          <div key={contact._id} className="p-2 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                    <FaUser className="w-5 h-5 text-orange-700 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.email}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2 mb-2">
                  {contact.message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <FaRegCalendarAlt className="inline mr-1" />
                  {formatDate(contact.createdAt)} at {formatTime(contact.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                  variant="admin"
                  size="small"
                  icon={<FaEnvelope className="w-4 h-4" />}
                  title="Send Email"
                />
                <Button
                  onClick={() => handleDelete(contact._id)}
                  variant="danger"
                  size="small"
                  icon={<FaTrash className="w-4 h-4" />}
                  title="Delete Contact"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Contacts">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Contacts ({pagination.total})
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Delete, View Contact Queries
                </p>
              </div>
              {/* Search and Filters */}
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                placeholder="Search contacts by name or email..."
              />
              <ViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
                views={['table', 'list', 'grid']}
              />
              <div className="flex items-center space-x-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
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




            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loading size="lg" color="yellow" message="" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Error loading contacts
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {error}
                </p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📧</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No contacts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No contact form submissions yet.'}
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
                currentPage={pagination.currentPage}
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
}



