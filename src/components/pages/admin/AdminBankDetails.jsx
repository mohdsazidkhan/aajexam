'use client';

import { useEffect, useState } from "react";

import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";
import ViewToggle from "../../ViewToggle";
import SearchFilter from "../../SearchFilter";
import { isMobile } from "react-device-detect";
import API from '../../../lib/api';
import {
  FaUser,
  FaEnvelope,
  FaRegCalendarAlt,
  FaUniversity,
  FaPhone,
  FaCreditCard,
  FaBuilding,
  FaKey,
  FaCrown,
  FaUserTag,
} from "react-icons/fa";
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';

const PAGE_LIMIT = 10;

export default function AdminBankDetails() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  // const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState(isMobile ? "list" : "table");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const debouncedSearch = useDebounce(searchTerm, 1000); // 1s delay

  useEffect(() => {
    fetchBankDetails(page, limit, debouncedSearch);
  }, [debouncedSearch, page, limit]);

  const fetchBankDetails = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      };

      const data = await API.getAdminBankDetails(params);
      if (data?.success || data?.bankDetails) {
        setBankDetails(data.bankDetails || []);
        // setTotal(data.pagination?.total || 0);
        setLimit(data.pagination?.limit || limit);
        setPagination({
          currentPage: data.pagination?.currentPage || data.pagination?.page || page,
          totalPages: data.pagination?.totalPages || 0,
          total: data.pagination?.total || 0,
          hasNextPage: data.pagination?.hasNextPage || data.pagination?.hasNext || false,
          hasPrevPage: data.pagination?.hasPrevPage || data.pagination?.hasPrev || false,
        });
      } else {
        setError(data.message || "Failed to fetch bank details");
      }
    } catch (err) {
      console.error('Error fetching bank details:', err);
      if (err.response) {
        setError(`Failed to fetch bank details: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.message) {
        setError(`Failed to fetch bank details: ${err.message}`);
      } else {
        setError("Failed to fetch bank details");
      }
    }
    setLoading(false);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubscriptionBadge = (status) => {
    const colors = {
      free: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      basic: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      premium:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      pro: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.free
          }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        Level {level}
      </span>
    );
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-[1200px] md:w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Account Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Bank Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date Added
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {bankDetails.map((detail) => (
              <tr
                key={detail._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="w-4 h-4 text-orange-700 dark:text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {detail.user?.name || "N/A"}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                        <FaEnvelope className="w-3 h-3 mr-1" />
                        {detail.user?.email || "N/A"}
                      </div>
                      {detail.user?.phone && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                          <FaPhone className="w-3 h-3 mr-1" />
                          {detail.user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center mb-1">
                      <FaUser className="w-4 h-4 mr-2 text-gray-500" />
                      {detail.accountHolderName}
                    </div>
                    <div className="flex items-center">
                      <FaCreditCard className="w-4 h-4 mr-2 text-gray-500" />
                      {detail.accountNumber}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center mb-1">
                      <FaUniversity className="w-4 h-4 mr-2 text-gray-500" />
                      {detail.bankName}
                    </div>
                    <div className="flex items-center mb-1">
                      <FaKey className="w-4 h-4 mr-2 text-gray-500" />
                      {detail.ifscCode}
                    </div>
                    <div className="flex items-center">
                      <FaBuilding className="w-4 h-4 mr-2 text-gray-500" />
                      {detail.branchName}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-2">
                    {detail.user?.subscriptionStatus && (
                      <div className="flex items-center">
                        <FaCrown className="w-4 h-4 mr-2 text-yellow-500" />
                        {getSubscriptionBadge(detail.user.subscriptionStatus)}
                      </div>
                    )}
                    {detail.user?.currentLevel !== undefined && (
                      <div className="flex items-center">
                        <FaUserTag className="w-4 h-4 mr-2 text-yellow-500" />
                        {getLevelBadge(detail.user.currentLevel)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(detail.createdAt)}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
      {bankDetails.map((detail) => (
        <div
          key={detail._id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-3 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                  <FaUser className="w-5 h-5 text-orange-700 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {detail.user?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {detail.user?.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                {detail.user?.subscriptionStatus &&
                  getSubscriptionBadge(detail.user.subscriptionStatus)}
                {detail.user?.currentLevel !== undefined &&
                  getLevelBadge(detail.user.currentLevel)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Details
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center">
                  <FaUser className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {detail.accountHolderName}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaCreditCard className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {detail.accountNumber}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Information
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center">
                  <FaUniversity className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {detail.bankName}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaKey className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {detail.ifscCode}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaBuilding className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {detail.branchName}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              <FaRegCalendarAlt className="inline mr-1" />
              {formatDate(detail.createdAt)}
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
        {bankDetails.map((detail) => (
          <div
            key={detail._id}
            className="p-3 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start">
              <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                  <FaUser className="w-5 h-5 text-orange-700 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {detail.user?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {detail.user?.email || "N/A"}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    {detail.user?.subscriptionStatus &&
                      getSubscriptionBadge(detail.user.subscriptionStatus)}
                    {detail.user?.currentLevel !== undefined &&
                      getLevelBadge(detail.user.currentLevel)}
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Details
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center">
                      <FaUser className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {detail.accountHolderName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaCreditCard className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {detail.accountNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Information
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center">
                      <FaUniversity className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {detail.bankName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaKey className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {detail.ifscCode}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaBuilding className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {detail.branchName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 md:ml-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                <FaRegCalendarAlt className="inline mr-1" />
                {formatDate(detail.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Bank Details">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  User Bank Details ({pagination.total || 0})
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View bank details of users
                </p>
              </div>
              {/* Search and Filters */}
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                placeholder="Search by name, email, or bank details..."
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
                    const newItemsPerPage = Number(e.target.value);
                    setItemsPerPage(newItemsPerPage);
                    setLimit(newItemsPerPage);
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
                  Error loading bank details
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : bankDetails.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                  🏦
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bank details found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "No users have added their bank details yet."}
                </p>
              </div>
            ) : (
              <>
                {viewMode === "table" && <TableView />}
                {viewMode === "grid" && <CardView />}
                {viewMode === "list" && <ListView />}
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


