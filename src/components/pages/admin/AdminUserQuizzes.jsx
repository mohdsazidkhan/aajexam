"use client";

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import Loading from "../../Loading";
import Button from "../../ui/Button";

const AdminUserQuizzes = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [activeTab, setActiveTab] = useState("quizzes"); // quizzes, categories, subcategories
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState(""); // approve, reject
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | approved | rejected
  const [searchQuery, setSearchQuery] = useState("");
  console.log(selectedQuiz, 'selectedQuiz')
  // always in admin route in this page
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, searchQuery]);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month} ${year} at ${time}`;
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "quizzes") {
        const params = {};
        if (statusFilter !== "all") params.status = statusFilter;
        if (searchQuery && searchQuery.trim())
          params.search = searchQuery.trim();
        const response = await API.adminGetAllUserQuizzes(params);
        if (response?.success) setQuizzes(response.data || []);
        else if (Array.isArray(response)) setQuizzes(response);
      } else if (activeTab === "categories") {
        const params = {};
        if (statusFilter !== "all") params.status = statusFilter;
        if (searchQuery && searchQuery.trim())
          params.search = searchQuery.trim();
        const response =
          statusFilter === "pending" && !searchQuery
            ? await API.adminGetPendingCategories(params)
            : await API.getAdminCategories({
              status: statusFilter !== "all" ? statusFilter : undefined,
              search: searchQuery || undefined,
            });
        if (response?.success) {
          setCategories(response.data || response.items || []);
        } else if (Array.isArray(response)) {
          setCategories(response);
        } else if (response?.categories) {
          setCategories(response.categories || []);
        } else {
          setCategories([]);
        }
      } else if (activeTab === "subcategories") {
        const params = {};
        if (statusFilter !== "all") params.status = statusFilter;
        if (searchQuery && searchQuery.trim())
          params.search = searchQuery.trim();
        const response =
          statusFilter === "pending" && !searchQuery
            ? await API.adminGetPendingSubcategories(params)
            : await API.getAdminSubcategories({
              status: statusFilter !== "all" ? statusFilter : undefined,
              search: searchQuery || undefined,
            });
        if (response?.success) {
          setSubcategories(response.data || response.items || []);
        } else if (Array.isArray(response)) {
          setSubcategories(response);
        } else if (response?.subcategories) {
          setSubcategories(response.subcategories || []);
        } else {
          setSubcategories([]);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = async (quiz) => {
    try {
      if (quiz?.status === 'pending') {
        const response = await API.adminGetPendingQuizDetails(quiz._id);
        if (response?.success) {
          setSelectedQuiz(response.data);
          setShowModal(true);
          return;
        }
      }
      // For approved/rejected: try to fetch questions via admin questions API
      let enriched = { ...quiz };
      try {
        const qres = await API.getAdminQuestions({ quiz: quiz._id, limit: 1000 });
        const questions = qres?.questions?.filter(q => q.quiz?._id === quiz?._id) || qres?.data?.filter(q => q.quiz?._id === quiz?._id) || [];
        if (Array.isArray(questions) && questions.length > 0) {
          enriched = { ...enriched, questions };
        }
      } catch (_) {
        // ignore; show without questions if unavailable
      }
      setSelectedQuiz(enriched);
      setShowModal(true);
    } catch (err) {
      toast.error(err?.message || "Failed to load quiz details");
    }
  };

  const handleApproveQuiz = async (id) => {
    try {
      const response = await API.adminApproveQuiz(id, adminNotes);
      if (response?.success) {
        toast.success(response.message || "Quiz approved successfully");
        if (response.data?.milestoneAchieved) {
          toast.success(
            `🎉 Milestone achieved! User upgraded to ${response.data.milestoneDetails.tier}`,
            { autoClose: 5000 }
          );
        }
      }
      setShowModal(false);
      setAdminNotes("");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to approve quiz");
    }
  };

  const handleRejectQuiz = async (id) => {
    if (!adminNotes.trim()) {
      toast.error("Please provide rejection reason");
      return;
    }
    try {
      await API.adminRejectQuiz(id, adminNotes);
      toast.success("Quiz rejected");
      setShowModal(false);
      setAdminNotes("");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to reject quiz");
    }
  };

  const handleApproveCategory = async (id) => {
    try {
      await API.adminApproveCategory(id, "");
      toast.success("Category approved");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to approve category");
    }
  };

  const handleRejectCategory = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await API.adminRejectCategory(id, reason);
      toast.success("Category rejected");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to reject category");
    }
  };

  const handleApproveSubcategory = async (id) => {
    try {
      await API.adminApproveSubcategory(id, "");
      toast.success("Subcategory approved");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to approve subcategory");
    }
  };

  const handleRejectSubcategory = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await API.adminRejectSubcategory(id, reason);
      toast.success("Subcategory rejected");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to reject subcategory");
    }
  };

  return (
    <AdminMobileAppWrapper title="User Questions">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent w-full text-gray-900 dark:text-white">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto p-2 lg:p-4">
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 lg:p-4 mb-1 lg:mb-6">
                <h1 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2 lg:mb-0">
                  User Quizzes
                </h1>

                {/* Tabs */}
                <div className="flex gap-2">
                  {["quizzes", "categories", "subcategories"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 lg:px-6 py-1 lg:py-3 rounded-lg font-medium capitalize ${activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Filters */}
                <div className="mt-3 flex flex-col lg:flex-row gap-2 lg:items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    >
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, creator, category..."
                      className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <Loading size="md" color="blue" message="Loading..." />
                </div>
              ) : (
                <>
                  {/* Quizzes Tab */}
                  {activeTab === "quizzes" && (
                    <div className="space-y-4">
                      {quizzes.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                          <p className="text-xl text-gray-600 dark:text-gray-400">
                            No pending quizzes
                          </p>
                        </div>
                      ) : (
                        quizzes.map((quiz) => (
                          <div
                            key={quiz._id}
                            className={`rounded-lg shadow-lg p-6 ${quiz.status === "approved"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : quiz.status === "rejected"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-yellow-100 dark:bg-yellow-900/30"
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-2">
                                  {quiz.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">
                                  {quiz.description}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">
                                      Status:
                                    </span>
                                    <br />
                                    <p
                                      className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-semibold ${quiz.status === "approved"
                                        ? "bg-green-600 text-white"
                                        : quiz.status === "rejected"
                                          ? "bg-red-600 text-white"
                                          : "bg-yellow-600 text-white"
                                        }`}
                                    >
                                      {quiz.status}
                                    </p>
                                  </div>

                                  <div>
                                    <span className="text-gray-500">
                                      Category:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                      {quiz.category?.name || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Difficulty:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white capitalize">
                                      {quiz.difficulty}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Questions:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                      {quiz.questionCount || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Creator:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                      {quiz.createdBy?.name ||
                                        quiz.createdBy?.email ||
                                        "Unknown"}
                                    </p>
                                    {quiz.createdBy?.email && (
                                      <p className="text-xs text-gray-600 dark:text-gray-300">
                                        {quiz.createdBy.email}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Created At:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                      {formatDate(quiz.createdAt) || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Stats:
                                    </span>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-gray-800 dark:text-white text-xs">
                                        Views: {quiz.viewsCount || 0}
                                      </span>
                                      {quiz.status === 'approved' && quiz.rewardAmount > 0 && (
                                        <span className="font-bold text-green-600 dark:text-green-400 text-xs mt-1">
                                          Reward: ₹{quiz.rewardAmount}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="admin"
                                onClick={() => handleViewQuiz(quiz)}
                                className="ml-4 font-semibold"
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Categories Tab */}
                  {activeTab === "categories" && (
                    <div className="space-y-4">
                      {categories.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                          <p className="text-xl text-gray-600 dark:text-gray-400">
                            No pending categories
                          </p>
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <div
                            key={cat._id}
                            className={`rounded-lg shadow-lg p-6 ${cat.status === "approved"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : cat.status === "rejected"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-yellow-100 dark:bg-yellow-900/30"
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-2">
                                  {cat.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">
                                  {cat.description || "No description"}
                                </p>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div className="text-sm">
                                    <span className="text-gray-500">
                                      Created by:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white ml-0 lg:ml-2">
                                      {cat.createdBy?.email || "Unknown"}
                                    </p>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-500">
                                      Subcategories:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white ml-0 lg:ml-2">
                                      {cat.subcategoryCount || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Created At:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white ml-0 lg:ml-2">
                                      {formatDate(cat.createdAt) || 0}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {cat.status === 'pending' && (
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleApproveCategory(cat._id)}
                                  >
                                    ✓ Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleRejectCategory(cat._id)}
                                  >
                                    ✗ Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Subcategories Tab */}
                  {activeTab === "subcategories" && (
                    <div className="space-y-4">
                      {subcategories.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                          <p className="text-xl text-gray-600 dark:text-gray-400">
                            No pending subcategories
                          </p>
                        </div>
                      ) : (
                        subcategories.map((sub) => (
                          <div
                            key={sub._id}
                            className={`rounded-lg shadow-lg p-6 ${sub.status === "approved"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : sub.status === "rejected"
                                ? "bg-red-100 dark:bg-red-900/30"
                                : "bg-yellow-100 dark:bg-yellow-900/30"
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-2">
                                  {sub.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">
                                  {sub.description || "No description"}
                                </p>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">
                                      Category:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                      {sub.category?.name || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Quizzes:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                      {sub.quizCount || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Created by:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                      {sub.createdBy?.email || "Unknown"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Created At:
                                    </span>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                      {formatDate(sub.createdAt) || 0}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {sub.status === 'pending' && (
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() =>
                                      handleApproveSubcategory(sub._id)
                                    }
                                  >
                                    ✓ Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() =>
                                      handleRejectSubcategory(sub._id)
                                    }
                                  >
                                    ✗ Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Quiz Review Modal */}
              {showModal && selectedQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[99] overflow-y-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      Review Quiz: {selectedQuiz.title}
                    </h2>

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {selectedQuiz.category?.name} /{" "}
                            {selectedQuiz.subcategory?.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Difficulty:</span>
                          <p className="font-medium text-gray-800 dark:text-white capitalize">
                            {selectedQuiz.difficulty}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Level:</span>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {selectedQuiz.requiredLevel}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Time Limit:</span>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {selectedQuiz.timeLimit} minutes
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                          Description:
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedQuiz.description || "No description"}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                          Questions ({selectedQuiz.questions?.length || 0}):
                        </h3>
                        <div className="space-y-4">
                          {selectedQuiz.questions?.map((q, i) => (
                            <div
                              key={i}
                              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <p className="font-medium text-gray-800 dark:text-white mb-2">
                                {i + 1}. {q.questionText}
                              </p>
                              <div className="grid grid-cols-2 gap-2 ml-4">
                                {q.options.map((opt, j) => (
                                  <div
                                    key={j}
                                    className={`p-2 rounded ${j === q.correctAnswerIndex
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-semibold"
                                      : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                                      }`}
                                  >
                                    {j + 1}. {opt}
                                    {j === q.correctAnswerIndex && " ✓"}
                                  </div>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                Time: {q.timeLimit}s
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Admin Notes (optional for approval, required for
                        rejection):
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                        placeholder="Enter notes for the creator..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => {
                          setShowModal(false);
                          setAdminNotes("");
                        }}
                        className="flex-1 font-semibold bg-gray-500 hover:bg-gray-600"
                      >
                        Close
                      </Button>
                      {selectedQuiz?.status === 'pending' && (
                        <>
                          <Button
                            variant="danger"
                            onClick={() => handleRejectQuiz(selectedQuiz._id)}
                            className="flex-1 font-semibold"
                          >
                            ✗ Reject
                          </Button>
                          <Button
                            variant="success"
                            onClick={() => handleApproveQuiz(selectedQuiz._id)}
                            className="flex-1 font-semibold"
                          >
                            ✓ Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminUserQuizzes;
