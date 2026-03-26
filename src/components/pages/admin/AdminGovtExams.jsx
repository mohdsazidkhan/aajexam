"use client";

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import Link from "next/link";
import ViewToggle from "../../ViewToggle";
import Loading from "../../Loading";
import Button from "../../ui/Button";
import { FaEdit, FaTrash } from "react-icons/fa";

const AdminGovtExams = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "grid" : "table";
    }
    return "table";
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    code: "",
    description: "",
    logo: "",
    isActive: true
  });

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  useEffect(() => {
    fetchCategories();
    fetchAllExams();
  }, []);

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);

    if (categoryId === "all") {
      fetchAllExams();
      return;
    }

    setLoading(true);

    try {
      const res = await API.getExamsByCategory(categoryId);
      if (res?.success) setExams(res.data || []);
      else if (Array.isArray(res)) setExams(res);
    } catch (err) {
      console.error("Exam fetch error", err);
      toast.error("Failed to load exams");
    }

    setLoading(false);
  };

  // Handle window resize to update view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "table") {
        setViewMode("list");
      } else if (window.innerWidth >= 768 && viewMode === "list") {
        setViewMode("table");
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const fetchCategories = async () => {
    try {
      const response = await API.getRealExamCategories();
      if (response?.success) {
        setCategories(response.data || []);
      } else if (Array.isArray(response)) {
        setCategories(response);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAllExams = async () => {
    setLoading(true);
    try {
      const response = await API.getAdminExams();
      if (response?.success) {
        setExams(response.data || []);
      } else if (Array.isArray(response)) {
        setExams(response);
      }
    } catch (error) {
      console.error("Error fetching all exams:", error);
      toast.error("Failed to load all exams");
    }
    setLoading(false);
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
    if (!confirm("Are you sure you want to delete this exam? This will also delete all patterns and tests associated with it.")) return;

    try {
      await API.deleteExam(examId);
      toast.success("Exam deleted successfully");
      fetchAllExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error(error?.response?.data?.message || "Failed to delete exam");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingExam) {
        await API.updateExam(editingExam._id, formData);
        toast.success("Exam updated successfully");
      } else {
        await API.createExam(formData);
        toast.success("Exam created successfully");
      }
      setShowModal(false);
      fetchAllExams();
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error(error?.response?.data?.message || "Failed to save exam");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const filteredExams = selectedCategory === "all"
    ? exams
    : exams.filter(exam => exam.category?._id === selectedCategory || exam.category === selectedCategory);

  if (!isMounted) return null;

  return (
    <AdminMobileAppWrapper title="Government Exams">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="mb-4 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-2 lg:gap-4">
            <div>
              <h1 className="text-xl md:text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-0 lg:mb-2">
                🏛️ Government Exams
              </h1>
              <p className="text-gray-600 dark:text-gray-400 hidden md:block">
                Manage exams for Government Exams
              </p>
            </div>
            {/* Filter */}
            <div className="mb-0 lg:mb-4 mt-0 lg:mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  handleCategoryChange(e.target.value);
                }}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} Exams
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
              <Button
                variant="admin"
                onClick={handleCreate}
              >
                + Add Exam
              </Button>
            </div>
          </div>



          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading size="md" color="blue" message="Loading exams..." />
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
              No exams found. Create your first exam!
            </div>
          ) : (
            <>
              {/* Table view */}
              {viewMode === "table" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredExams.map((exam) => (
                        <tr key={exam._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                            {exam.code}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {exam.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {exam.category?.name} Exam
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exam.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                              {exam.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatDate(exam.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link
                              href={`/admin/govt-exams/patterns?examId=${exam._id}`}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              Patterns
                            </Link>
                            <button
                              onClick={() => handleEdit(exam)}
                              className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(exam._id)}
                              className="text-primary-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
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
                  {filteredExams.map((exam) => (
                    <div
                      key={exam._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-md lg:text-lg font-semibold text-gray-900 dark:text-white">
                              {exam.code} - {exam.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exam.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                              {exam.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Category: {exam.category?.name || "N/A"}
                          </p>
                          {exam.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {exam.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {formatDate(exam.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-col sm:flex-row">
                          <Link
                            href={`/admin/govt-exams/patterns?examId=${exam._id}`}
                            className="px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          >
                            Patterns
                          </Link>
                          <button
                            onClick={() => handleEdit(exam)}
                            className="p-2 text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(exam._id)}
                            className="p-2 text-primary-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid view */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExams.map((exam) => (
                    <div
                      key={exam._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-md lg:text-lg font-semibold text-gray-900 dark:text-white">
                            {exam.code}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {exam.name}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${exam.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                          {exam.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Category: {exam.category?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Created: {formatDate(exam.createdAt)}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Link
                          href={`/admin/govt-exams/patterns?examId=${exam._id}`}
                          className="flex-1 px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
                        >
                          Patterns
                        </Link>
                        <button
                          onClick={() => handleEdit(exam)}
                          className="px-3 py-2 text-sm bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(exam._id)}
                          className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-primary-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-md lg:text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingExam ? `Edit Exam: ${editingExam.name}` : "Create New Exam"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} Exam
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exam Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., SSC, UPSC, IBPS"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exam Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Staff Selection Commission"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description of the exam"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="admin"
                >
                  {editingExam ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExams;

