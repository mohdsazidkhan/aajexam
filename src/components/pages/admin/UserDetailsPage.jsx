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
  FaPhone,
  FaAt,
  FaCrown,
  FaUserTag,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLink,
} from "react-icons/fa";
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';

const PAGE_LIMIT = 10;

export default function UserDetailsPage() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [userDetails, setUserDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
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
    fetchUserDetails(page, limit, debouncedSearch);
  }, [debouncedSearch, page, limit]);

  const fetchUserDetails = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      };

      // Try new API endpoint first, fallback to students if not available
      let data;
      try {
        data = await API.getAdminUserDetails(params);
      } catch (err) {
        // Fallback to students API if user-details endpoint doesn't exist yet
        console.warn('User details API not available, falling back to students API:', err);
        data = await API.getAdminStudents(params);
      }

      if (data.success) {
        // Handle both response formats:
        // User Details API: { success: true, data: { users: [...], pagination: {...} } }
        // Students API: { students: [...], pagination: {...} }
        const usersData = data.data?.users || data.users || data.userDetails || data.students || [];
        // Ensure it's an array
        const usersArray = Array.isArray(usersData) ? usersData : [];
        setUserDetails(usersArray);

        // Handle pagination from both formats
        const paginationData = data.data?.pagination || data.pagination || {};
        setLimit(paginationData.limit || limit);
        setPagination({
          currentPage: paginationData.page || paginationData.currentPage || page,
          totalPages: paginationData.totalPages || 1,
          total: paginationData.total || 0,
          hasNextPage: paginationData.hasNext || false,
          hasPrevPage: paginationData.hasPrev || false,
        });
      } else {
        // Handle students API format (no success field)
        if (data.students) {
          const usersArray = Array.isArray(data.students) ? data.students : [];
          setUserDetails(usersArray);
          const paginationData = data.pagination || {};
          setLimit(paginationData.limit || limit);
          setPagination({
            currentPage: paginationData.page || page,
            totalPages: paginationData.totalPages || 1,
            total: paginationData.total || 0,
            hasNextPage: paginationData.hasNext || false,
            hasPrevPage: paginationData.hasPrev || false,
          });
        } else {
          setError(data.message || "Failed to fetch user details");
          setUserDetails([]); // Ensure it's an array even on error
        }
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setUserDetails([]); // Ensure it's an array on error
      if (err.response) {
        setError(`Failed to fetch user details: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.message) {
        setError(`Failed to fetch user details: ${err.message}`);
      } else {
        setError("Failed to fetch user details");
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
      pro: "bg-purple-100 text-primary-800 dark:bg-purple-900 dark:text-primary-200",
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
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        Level {level}
      </span>
    );
  };

  // Table View Component
  const TableView = () => {
    if (!Array.isArray(userDetails)) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500">
          Invalid data format
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-[1200px] md:w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Social Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Challenge Wins (D/W/M)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {userDetails.map((detail) => (
                <tr
                  key={detail._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-primary-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {detail.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {detail.name || "N/A"}
                        </div>
                        {detail.username && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
                            <FaAt className="w-3 h-3 mr-1" />
                            {detail.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center mb-1">
                        <FaEnvelope className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="truncate max-w-[200px]">{detail.email || "N/A"}</span>
                      </div>
                      {detail.phone && (
                        <div className="flex items-center">
                          <FaPhone className="w-4 h-4 mr-2 text-gray-500" />
                          {detail.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {detail.socialLinks ? (
                        <div className="grid grid-cols-2 gap-2">
                          {detail.socialLinks.instagram && (
                            <div className="flex items-center">
                              <FaInstagram className="w-4 h-4 mr-2 text-pink-500" />
                              <a
                                href={detail.socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary-600 hover:underline truncate max-w-[150px]"
                              >
                                Instagram
                              </a>
                            </div>
                          )}
                          {detail.socialLinks.facebook && (
                            <div className="flex items-center">
                              <FaFacebook className="w-4 h-4 mr-2 text-secondary-600" />
                              <a
                                href={detail.socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary-600 hover:underline truncate max-w-[150px]"
                              >
                                Facebook
                              </a>
                            </div>
                          )}
                          {detail.socialLinks.x && (
                            <div className="flex items-center">
                              <FaTwitter className="w-4 h-4 mr-2 text-secondary-400" />
                              <a
                                href={detail.socialLinks.x}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary-600 hover:underline truncate max-w-[150px]"
                              >
                                Twitter/X
                              </a>
                            </div>
                          )}
                          {detail.socialLinks.youtube && (
                            <div className="flex items-center">
                              <FaYoutube className="w-4 h-4 mr-2 text-primary-600" />
                              <a
                                href={detail.socialLinks.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary-600 hover:underline truncate max-w-[150px]"
                              >
                                YouTube
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No social links</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <span className="font-bold text-primary-600 dark:text-red-400 mr-1">{detail.dailyProgress?.highScoreWins || 0}</span>
                        <span className="text-gray-500">D</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-bold text-secondary-600 dark:text-primary-400 mr-1">{detail.weeklyProgress?.highScoreWins || 0}</span>
                        <span className="text-gray-500">W</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-bold text-secondary-600 dark:text-secondary-400 mr-1">{detail.monthlyProgress?.highScoreWins || 0}</span>
                        <span className="text-gray-500">M</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      {detail.subscriptionStatus && (
                        <div className="flex items-center">
                          <FaCrown className="w-4 h-4 mr-2 text-primary-500" />
                          {getSubscriptionBadge(detail.subscriptionStatus)}
                        </div>
                      )}
                      {detail.level?.currentLevel !== undefined && (
                        <div className="flex items-center">
                          <FaUserTag className="w-4 h-4 mr-2 text-primary-500" />
                          {getLevelBadge(detail.level.currentLevel)}
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
  };

  // Card View Component
  const CardView = () => {
    if (!Array.isArray(userDetails)) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500">
          Invalid data format
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
        {userDetails.map((detail) => (
          <div
            key={detail._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-3 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-primary-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-base">
                      {detail.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {detail.name || "N/A"}
                    </h3>
                    {detail.username && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <FaAt className="inline w-3 h-3 mr-1" />
                        {detail.username}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  {detail.subscriptionStatus &&
                    getSubscriptionBadge(detail.subscriptionStatus)}
                  {detail.level?.currentLevel !== undefined &&
                    getLevelBadge(detail.level.currentLevel)}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                  Challenge Wins
                </h4>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-sm font-bold text-primary-600 dark:text-red-400">{detail.dailyProgress?.highScoreWins || 0}</div>
                    <div className="text-[10px] text-gray-500">Daily</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-secondary-600 dark:text-primary-400">{detail.weeklyProgress?.highScoreWins || 0}</div>
                    <div className="text-[10px] text-gray-500">Weekly</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-secondary-600 dark:text-secondary-400">{detail.monthlyProgress?.highScoreWins || 0}</div>
                    <div className="text-[10px] text-gray-500">Monthly</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Details
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center">
                    <FaEnvelope className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {detail.email || "N/A"}
                    </span>
                  </div>
                  {detail.phone && (
                    <div className="flex items-center">
                      <FaPhone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        {detail.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Social Details
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {detail.socialLinks ? (
                    <>
                      {detail.socialLinks.instagram && (
                        <div className="flex items-center">
                          <FaInstagram className="w-4 h-4 mr-2 text-pink-500" />
                          <a
                            href={detail.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-secondary-600 hover:underline truncate"
                          >
                            Instagram
                          </a>
                        </div>
                      )}
                      {detail.socialLinks.facebook && (
                        <div className="flex items-center">
                          <FaFacebook className="w-4 h-4 mr-2 text-secondary-600" />
                          <a
                            href={detail.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-secondary-600 hover:underline truncate"
                          >
                            Facebook
                          </a>
                        </div>
                      )}
                      {detail.socialLinks.x && (
                        <div className="flex items-center">
                          <FaTwitter className="w-4 h-4 mr-2 text-secondary-400" />
                          <a
                            href={detail.socialLinks.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-secondary-600 hover:underline truncate"
                          >
                            Twitter/X
                          </a>
                        </div>
                      )}
                      {detail.socialLinks.youtube && (
                        <div className="flex items-center">
                          <FaYoutube className="w-4 h-4 mr-2 text-primary-600" />
                          <a
                            href={detail.socialLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-secondary-600 hover:underline truncate"
                          >
                            YouTube
                          </a>
                        </div>
                      )}
                      {!detail.socialLinks.instagram && !detail.socialLinks.facebook &&
                        !detail.socialLinks.x && !detail.socialLinks.youtube && (
                          <span className="text-sm text-gray-400">No social links</span>
                        )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">No social links</span>
                  )}
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
  };

  // List View Component
  const ListView = () => {
    if (!Array.isArray(userDetails)) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500">
          Invalid data format
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {userDetails.map((detail) => (
            <div
              key={detail._id}
              className="p-3 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start">
                <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-primary-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-base">
                      {detail.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {detail.name || "N/A"}
                    </h3>
                    {detail.username && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <FaAt className="inline w-3 h-3 mr-1" />
                        {detail.username}
                      </p>
                    )}
                    <div className="flex items-center mt-1 space-x-2">
                      {detail.subscriptionStatus &&
                        getSubscriptionBadge(detail.subscriptionStatus)}
                      {detail.level?.currentLevel !== undefined &&
                        getLevelBadge(detail.level.currentLevel)}
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-[10px] font-bold text-primary-600 dark:text-red-400">Daily: {detail.dailyProgress?.highScoreWins || 0}</span>
                      <span className="text-[10px] font-bold text-secondary-600 dark:text-primary-400">Weekly: {detail.weeklyProgress?.highScoreWins || 0}</span>
                      <span className="text-[10px] font-bold text-secondary-600 dark:text-secondary-400">Monthly: {detail.monthlyProgress?.highScoreWins || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Details
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center">
                        <FaEnvelope className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {detail.email || "N/A"}
                        </span>
                      </div>
                      {detail.phone && (
                        <div className="flex items-center">
                          <FaPhone className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {detail.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Social Details
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {detail.socialLinks ? (
                        <>
                          {detail.socialLinks.instagram && (
                            <div className="flex items-center">
                              <FaInstagram className="w-4 h-4 mr-2 text-pink-500" />
                              <a
                                href={detail.socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-secondary-600 hover:underline truncate"
                              >
                                Instagram
                              </a>
                            </div>
                          )}
                          {detail.socialLinks.facebook && (
                            <div className="flex items-center">
                              <FaFacebook className="w-4 h-4 mr-2 text-secondary-600" />
                              <a
                                href={detail.socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-secondary-600 hover:underline truncate"
                              >
                                Facebook
                              </a>
                            </div>
                          )}
                          {detail.socialLinks.x && (
                            <div className="flex items-center">
                              <FaTwitter className="w-4 h-4 mr-2 text-secondary-400" />
                              <a
                                href={detail.socialLinks.x}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-secondary-600 hover:underline truncate"
                              >
                                Twitter/X
                              </a>
                            </div>
                          )}
                          {detail.socialLinks.youtube && (
                            <div className="flex items-center">
                              <FaYoutube className="w-4 h-4 mr-2 text-primary-600" />
                              <a
                                href={detail.socialLinks.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-secondary-600 hover:underline truncate"
                              >
                                YouTube
                              </a>
                            </div>
                          )}
                          {!detail.socialLinks.instagram && !detail.socialLinks.facebook &&
                            !detail.socialLinks.x && !detail.socialLinks.youtube && (
                              <span className="text-sm text-gray-400">No social links</span>
                            )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">No social links</span>
                      )}
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
  };

  return (
    <AdminMobileAppWrapper title="User Details">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  User Details ({pagination.total || 0})
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View detailed information of all users
                </p>
              </div>
              {/* Search and Filters */}
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                placeholder="Search by name, email, username..."
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
                  Error loading user details
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            ) : userDetails.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                  👤
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No users found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "No users have registered yet."}
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


