"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import { getCurrentUser } from "../../../utils/authUtils";
import ViewToggle from "../../ViewToggle";
import Loading from "../../Loading";
import Button from "../../ui/Button";
import { FaEdit, FaTrash } from "react-icons/fa";

const AdminGovtExamPatterns = () => {

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [patterns, setPatterns] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExam, setSelectedExam] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    duration: 60,
    negativeMarking: 0,
    sections: []
  });

  const [newSection, setNewSection] = useState({
    name: "",
    totalQuestions: 1,
    marksPerQuestion: 1,
    negativePerQuestion: 0,
    sectionDuration: ""
  });

  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "grid" : "table";
    }
    return "table";
  });

  const user = getCurrentUser();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const isAdminRoute =
    typeof window !== "undefined"
      ? window.location.pathname.startsWith("/admin")
      : false;


  // --------------------------------------
  // 1️⃣ LOAD CATEGORIES ONLY ONCE
  // --------------------------------------
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await API.getRealExamCategories();
      if (res?.success) setCategories(res.data || []);
      else if (Array.isArray(res)) setCategories(res);
    } catch (err) {
      console.error("Category fetch error", err);
    }
  };


  // --------------------------------------
  // 2️⃣ SELECT CATEGORY → LOAD EXAMS
  // --------------------------------------
  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedExam("all");

    setExams([]);
    setPatterns([]);

    if (!categoryId) return;

    setLoading(true);
    try {
      const res = await API.getExamsByCategory(categoryId);
      if (res?.success) setExams(res.data || []);
    } catch (err) {
      console.error("Exams fetch error", err);
    }
    setLoading(false);
  };


  // --------------------------------------
  // 3️⃣ SELECT EXAM → LOAD PATTERNS
  // --------------------------------------
  const handleExamChange = async (examId) => {
    setSelectedExam(examId);
    setPatterns([]);

    if (examId === "all") return;

    setLoading(true);
    try {
      const res = await API.getPatternsByExam(examId);
      if (res?.success) setPatterns(res.data || []);
      else if (Array.isArray(res)) setPatterns(res);
    } catch (err) {
      console.error("Patterns fetch error", err);
      toast.error("Failed to load patterns");
    }
    setLoading(false);
  };


  // --------------------------------------
  // 4️⃣ CREATE NEW PATTERN
  // --------------------------------------
  const handleCreate = () => {
    if (selectedExam === "all") return;

    setEditingPattern(null);

    setFormData({
      title: "",
      duration: 60,
      negativeMarking: 0,
      sections: []
    });

    setShowModal(true);
  };


  // --------------------------------------
  // 5️⃣ EDIT PATTERN
  // --------------------------------------
  const handleEdit = (pattern) => {
    setEditingPattern(pattern);

    setFormData({
      title: pattern.title,
      duration: pattern.duration,
      negativeMarking: pattern.negativeMarking,
      sections: pattern.sections || []
    });

    setShowModal(true);
  };


  // --------------------------------------
  // 6️⃣ DELETE PATTERN → RELOAD SAME EXAM PATTERNS
  // --------------------------------------
  const handleDelete = async (id) => {
    if (!confirm("Delete pattern?")) return;

    try {
      await API.deleteExamPattern(id);
      toast.success("Pattern deleted!");
      handleExamChange(selectedExam);
    } catch (err) {
      toast.error("Delete failed");
    }
  };


  // --------------------------------------
  // 7️⃣ ADD NEW SECTION
  // --------------------------------------
  const handleAddSection = () => {
    if (!newSection.name || newSection.totalQuestions <= 0) {
      toast.error("Fill all section fields");
      return;
    }

    setFormData({
      ...formData,
      sections: [...formData.sections, { ...newSection }]
    });

    setNewSection({
      name: "",
      totalQuestions: 1,
      marksPerQuestion: 1,
      negativePerQuestion: 0,
      sectionDuration: ""
    });
  };


  // --------------------------------------
  // 8️⃣ REMOVE SECTION
  // --------------------------------------
  const handleRemoveSection = (index) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.sections.length === 0) {
      toast.error("Please add at least one section");
      return;
    }

    try {
      if (editingPattern) {
        await API.updateExamPattern(editingPattern._id, formData);
        toast.success("Pattern updated successfully");
      } else {
        await API.createExamPattern(formData);
        toast.success("Pattern created successfully");
      }
      setShowModal(false);
      fetchAllPatterns();
    } catch (err) {
      console.error("Save error", err);
      toast.error(err?.response?.data?.message || "Failed to save pattern");
    }
  };


  // --------------------------------------
  // 9️⃣ CALCULATE TOTAL MARKS
  // --------------------------------------
  const calculateTotalMarks = () =>
    formData.sections.reduce(
      (sum, sec) => sum + sec.totalQuestions * sec.marksPerQuestion,
      0
    );


  // --------------------------------------
  // 🔟 SELECTED EXAM / CATEGORY DATA (Optional)
  // --------------------------------------
  const selectedExamData = exams.find((e) => e._id === selectedExam);
  const selectedCategoryData = categories.find(
    (c) => c._id === selectedExamData?.category
  );


  // --------------------------------------
  // 1️⃣1️⃣ FILTER PATTERNS FOR CURRENT EXAM
  // --------------------------------------
  const filteredPatterns =
    selectedExam === "all"
      ? patterns
      : patterns.filter(
        (pattern) =>
          pattern.exam?._id === selectedExam || pattern.exam === selectedExam
      );


  return (
    <AdminMobileAppWrapper title="Exam Patterns">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="mb-4 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full min-w-fit lg:max-w-sm lg:min-w-sm">
                <h1 className="text-xl md:text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-0 lg:mb-2">
                  🏛️ Exam Patterns
                </h1>
                <p className="text-gray-600 dark:text-gray-400 hidden md:block">
                  Manage exam patterns
                </p>
              </div>
              {/* Filters */}
              <div className="w-full lg:max-w-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} Exams
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full lg:max-w-sm">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exams
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Exams</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.code} - {exam.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full lg:max-w-sm mt-2 lg:mt-5">
                <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
              </div>
              <div className="w-full lg:max-w-sm mt-2 lg:mt-6">
                <Button
                  variant="admin"
                  onClick={handleCreate}
                  disabled={selectedExam === "all"}
                >
                  + Add Pattern
                </Button>
              </div>
            </div>
          </div>



          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading size="md" color="blue" message="Loading patterns..." />
            </div>
          ) : filteredPatterns.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
              {selectedExam === "all"
                ? "No patterns found. Create your first pattern!"
                : "No patterns found for the selected exam."}
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
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Exam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total Marks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Sections
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPatterns.map((pattern) => (
                        <tr
                          key={pattern._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {pattern.title}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {pattern.exam?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {pattern.duration} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {pattern.totalMarks}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {pattern.sections?.length || 0} sections
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link
                              href={`/admin/govt-exams/tests?patternId=${pattern._id}`}
                              className="text-orange-700 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              Tests
                            </Link>
                            <button
                              onClick={() => handleEdit(pattern)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(pattern._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                  {filteredPatterns.map((pattern) => (
                    <div
                      key={pattern._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-md lg:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {pattern.title}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Duration:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {pattern.duration} min
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Marks:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {pattern.totalMarks}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Sections:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {pattern.sections?.length || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Neg. Mark:
                              </span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {pattern.negativeMarking || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-col sm:flex-row">
                          <Link
                            href={`/admin/govt-exams/tests?patternId=${pattern._id}`}
                            className="px-3 py-2 text-sm text-orange-700 dark:text-yellow-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          >
                            Tests
                          </Link>
                          <button
                            onClick={() => handleEdit(pattern)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(pattern._id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                  {filteredPatterns.map((pattern) => (
                    <div
                      key={pattern._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 truncate">
                        {pattern.title}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Duration:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {pattern.duration} min
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Total Marks:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {pattern.totalMarks}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Sections:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {pattern.sections?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Neg. Mark:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {pattern.negativeMarking || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Link
                          href={`/admin/govt-exams/tests?patternId=${pattern._id}`}
                          className="flex-1 px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-orange-700 dark:text-yellow-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
                        >
                          Tests
                        </Link>
                        <button
                          onClick={() => handleEdit(pattern)}
                          className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(pattern._id)}
                          className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-3 lg:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-md lg:text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingPattern ? `Edit Pattern: ${editingPattern.title}` : "Create New Pattern"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pattern Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full lg:max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., SSC CGL Tier 1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Negative Marking
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.negativeMarking}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        negativeMarking: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="0"
                  />
                </div>
              </div>

              {/* Sections */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sections *
                  <span className="text-xs text-gray-500 ml-2">
                    Current Total: {calculateTotalMarks()} marks
                  </span>
                </label>

                {/* Existing Sections */}
                {formData.sections.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {formData.sections.map((section, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{section.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({section.totalQuestions} Q ×{" "}
                            {section.marksPerQuestion} marks ={" "}
                            {section.totalQuestions * section.marksPerQuestion}{" "}
                            marks)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Section */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Add Section
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Section Name *
                      </label>
                      <input
                        type="text"
                        value={newSection.name}
                        onChange={(e) =>
                          setNewSection({ ...newSection, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., General Awareness"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Questions *
                      </label>
                      <input
                        type="number"
                        value={newSection.totalQuestions}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            totalQuestions: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Marks per Question *
                      </label>
                      <input
                        type="number"
                        value={newSection.marksPerQuestion}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            marksPerQuestion: parseFloat(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Negative per Question
                      </label>
                      <input
                        type="number"
                        value={newSection.negativePerQuestion}
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            negativePerQuestion:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddSection}
                    variant="admin"
                    fullWidth
                  >
                    + Add Section
                  </Button>
                </div>
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
                  {editingPattern ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExamPatterns;
