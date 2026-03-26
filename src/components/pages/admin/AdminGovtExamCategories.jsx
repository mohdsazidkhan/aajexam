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
import ViewToggle from "../../ViewToggle";
import Loading from "../../Loading";
import Button from "../../ui/Button";
import { FaEdit, FaTrash } from "react-icons/fa";

const AdminGovtExamCategories = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "list" : "table";
    }
    return "table";
  });
  const [formData, setFormData] = useState({
    name: "",
    type: "Central",
    description: ""
  });

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  useEffect(() => {
    fetchCategories();
  }, []);

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
    setLoading(true);
    try {
      const response = await API.getRealExamCategories();
      if (response?.success) {
        setCategories(response.data || []);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", type: "Central", description: "" });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await API.deleteExamCategory(categoryId);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error?.response?.data?.message || "Failed to delete category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await API.updateExamCategory(editingCategory._id, formData);
        toast.success("Category updated successfully");
      } else {
        await API.createExamCategory(formData);
        toast.success("Category created successfully");
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error?.response?.data?.message || "Failed to save category");
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

  if (!isMounted) return null;

  return (
    <AdminMobileAppWrapper title="Government Exams - Categories">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="mb-4 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="mt-2 lg:mt-0">
              <h1 className="text-xl md:text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-0 lg:mb-2">
                🏛️ Govt. Exams - Categories
              </h1>
              <p className="text-gray-600 dark:text-gray-400 hidden md:block">
                Manage exam categories for Government Exams
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
              <Button
                variant="admin"
                onClick={handleCreate}
              >
                + Add Category
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading size="md" color="blue" message="Loading categories..." />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
              No categories found. Create your first category!
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
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
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
                      {categories.map((category) => (
                        <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {category.name} Exams
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${category.type === "Central"
                              ? "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              }`}>
                              {category.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {category.description || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatDate(category.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category._id)}
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
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${category.type === "Central"
                              ? "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              }`}>
                              {category.type}
                            </span>
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {category.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {formatDate(category.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
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
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {category.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${category.type === "Central"
                          ? "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}>
                          {category.type}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Created: {formatDate(category.createdAt)}
                      </p>
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex-1 px-3 py-2 text-sm bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="flex-1 px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-primary-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Delete
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-md lg:text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="Central">Central Government</option>
                  <option value="State">State Government</option>
                </select>
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
                />
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
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExamCategories;

