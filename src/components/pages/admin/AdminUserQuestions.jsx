"use client";

import React, { useEffect, useState, useCallback } from "react";
import API from '../../../lib/api';
import { toast } from "react-toastify";
import Sidebar from '../../Sidebar';
import { useSelector } from "react-redux";
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { getCurrentUser } from "../../../utils/authUtils";
// import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import SearchFilter from '../../SearchFilter';
import Button from '../../ui/Button';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const AdminUserQuestions = () => {
  const [items, setItems] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryStatus = searchParams?.get("status") || null;
  const initialStatus = ["pending", "approved", "rejected"].includes(
    queryStatus || ""
  )
    ? queryStatus
    : "";
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(
    typeof window !== "undefined" && window.innerWidth < 768 ? "list" : "table"
  );

  // always in admin route in this page
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        status,
        page,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
      };
      const res = await API.getAdminUserQuestions(params);
      if (res?.success) {
        setItems(res.data || []);
        setTotal(res.pagination?.total || 0);
        setPagination(res.pagination || {});
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [status, page, itemsPerPage, searchTerm]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep URL in sync when status changes via UI
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pathname]);

  // Update state if status in URL changes externally (e.g., navigation)
  useEffect(() => {
    const urlStatus = searchParams?.get("status");
    if (
      urlStatus &&
      ["pending", "approved", "rejected"].includes(urlStatus) &&
      urlStatus !== status
    ) {
      setPage(1);
      setStatus(urlStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await API.updateUserQuestionStatus(id, newStatus);
      toast.success(`Question ${newStatus} successfully!`);
      load();
    } catch (err) {
      toast.error(err?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900 dark:text-primary-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "❓";
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setPage(1);
  };

  const handleSearch = (search) => {
    setSearchTerm(search);
    setPage(1);
  };

  // default view now controlled by viewMode state

  const content = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto p-2 lg:p-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="text-xl lg:text-4xl mr-3">💭</span>
                User Questions ({total})
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Review and approve/reject user-submitted questions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <SearchFilter
                onSearch={handleSearch}
                placeholder="Search questions..."
                className="w-full lg:w-60"
              />
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">All</option>
                  <option value="pending">⏳ Pending Review</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <label className="text-xs sm:text-lg text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Show:
              </label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs sm:text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
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

            {/* View toggle */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded ${viewMode === "list"
                  ? "bg-secondary-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded ${viewMode === "grid"
                  ? "bg-secondary-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded ${viewMode === "table"
                  ? "bg-secondary-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading size="md" color="gray" message="" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              🤔
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No questions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {status === "pending"
                ? "No pending questions to review."
                : `No ${status} questions found.`}
            </p>
          </div>
        ) : (
          <>
            {/* Table view */}
            {viewMode === "table" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        S.No.
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Question
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Created At
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Stats
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status / Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {items.map((q) => (
                      <tr key={q._id}>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {((page - 1) * limit) + items.indexOf(q) + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-[380px]">
                          <div className="font-medium mb-2">
                            {q.questionText}
                          </div>

                          {/* Options display */}
                          <div className="flex flex-wrap space-x-2 mb-2">
                            {(q.options || []).map((opt, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center space-x-2 text-xs ${idx === q.correctOptionIndex
                                  ? "text-green-700 dark:text-green-400 font-medium"
                                  : "text-gray-600 dark:text-gray-400"
                                  }`}
                              >
                                <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="truncate">{opt}</span>
                                {idx === q.correctOptionIndex && (
                                  <span className="text-green-600 dark:text-green-400">
                                    ✓
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {q.userId?.name || "Unknown"}
                          </div>
                          {(q.userId?.email || q.userId?.phone) && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {q.userId?.email || ""}
                              {q.userId?.email && q.userId?.phone ? " • " : ""}
                              {q.userId?.phone || ""}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(q.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(q.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="text-secondary-600 dark:text-secondary-400">
                              👁️ {q.viewsCount || 0}
                            </span>
                            <span className="text-primary-600 dark:text-red-400">
                              ❤️ {q.likesCount || 0}
                            </span>
                            <span className="text-primary-600 dark:text-primary-400">
                              💬 {(q.answers || []).length}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div
                            className={`inline-block px-3 py-1 rounded-lg font-medium border ${getStatusColor(
                              q.status
                            )}`}
                          >
                            {getStatusIcon(q.status)} {q.status}
                          </div>
                          {q.status === "pending" && (
                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => updateStatus(q._id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => updateStatus(q._id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* List view */}
            {viewMode === "list" && (
              <div className="space-y-3">
                {items.map((q, idx) => (
                  <div
                    key={q._id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {((page - 1) * (pagination.limit || itemsPerPage || limit)) + idx + 1}
                      </span>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {q.questionText}
                      </div>
                    </div>

                    {/* Options display */}
                    <div className="flex flex-wrap space-x-2 mb-2">
                      {(q.options || []).map((opt, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center space-x-2 text-xs ${idx === q.correctOptionIndex
                            ? "text-green-700 dark:text-green-400 font-medium"
                            : "text-gray-600 dark:text-gray-400"
                            }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="truncate">{opt}</span>
                          {idx === q.correctOptionIndex && (
                            <span className="text-green-600 dark:text-green-400">
                              ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span>
                        {q.userId?.name || "Unknown"}
                        {q.userId?.email ? ` • ${q.userId.email}` : ""}
                      </span>
                      <span>
                        Views: {q.viewsCount || 0} • Likes: {q.likesCount || 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Created: {formatDate(q.createdAt)} at {new Date(q.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(
                          q.status
                        )}`}
                      >
                        {getStatusIcon(q.status)} {q.status}
                      </div>
                      {q.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => updateStatus(q._id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => updateStatus(q._id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid view */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map((q, idx) => (
                  <div
                    key={q._id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {((page - 1) * (pagination.limit || itemsPerPage || limit)) + idx + 1}
                      </span>
                      <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-3">
                        {q.questionText}
                      </div>
                    </div>

                    {/* Options display */}
                    <div className="flex flex-wrap space-x-2 mb-2">
                      {(q.options || []).map((opt, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center space-x-2 text-xs ${idx === q.correctOptionIndex
                            ? "text-green-700 dark:text-green-400 font-medium"
                            : "text-gray-600 dark:text-gray-400"
                            }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="truncate">{opt}</span>
                          {idx === q.correctOptionIndex && (
                            <span className="text-green-600 dark:text-green-400">
                              ✓
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      {q.userId?.name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Created: {formatDate(q.createdAt)} at {new Date(q.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-secondary-600 dark:text-secondary-400">
                        👁️ {q.viewsCount || 0}
                      </span>
                      <span className="text-primary-600 dark:text-red-400">
                        ❤️ {q.likesCount || 0}
                      </span>
                      <span className="text-primary-600 dark:text-primary-400">
                        💬 {(q.answers || []).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(
                          q.status
                        )}`}
                      >
                        {getStatusIcon(q.status)} {q.status}
                      </div>
                      {q.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => updateStatus(q._id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => updateStatus(q._id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </>
        )}

        {/* Pagination - Always show when there are items */}
        {!loading && items.length > 0 && (
          <div className="mt-8 pb-4">
            <Pagination
              currentPage={pagination.page || page}
              totalPages={pagination.totalPages || totalPages}
              onPageChange={setPage}
              totalItems={pagination.total || total}
              itemsPerPage={pagination.limit || itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AdminMobileAppWrapper title="User Questions">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent w-full text-gray-900 dark:text-white">
          {content}
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminUserQuestions;




