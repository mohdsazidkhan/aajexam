"use client";

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import ViewToggle from "../../ViewToggle";
import Loading from "../../Loading";
import Button from "../../ui/Button";
import { FaEdit, FaTrash } from "react-icons/fa";

const AdminGovtExamTests = () => {
  const { router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "grid" : "table";
    }
    return "table";
  });
  const [selectedPattern, setSelectedPattern] = useState("all");
  const [uploadMode, setUploadMode] = useState(false);
  const [jsonText, setJsonText] = useState("");

  const [formData, setFormData] = useState({
    examPattern: "",
    title: "",
    totalMarks: 100,
    duration: 60,
    isFree: false,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
    explanation: "",
    section: "",
    tags: [],
    difficulty: "medium"
  });

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  useEffect(() => {
    fetchCategories();
  }, []);

  // ------------------ LOAD CATEGORIES ------------------
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.getRealExamCategories();
      if (res?.success) {
        setCategories(res.data || []);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error("Category load error", e);
    } finally {
      setLoading(false);
    }
  };

  // ------------------ CATEGORY → EXAMS ------------------
  const handleCategoryChange = async (categoryId) => {
    setExams([]);
    setPatterns([]);
    setTests([]);
    setSelectedPattern("all");

    if (!categoryId) return;

    try {
      setLoading(false);
      const res = await API.getExamsByCategory(categoryId);
      if (res?.success) {
        setExams(res.data || []);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error("Exams load error", e);
    }
  };

  // ------------------ EXAM → PATTERNS ------------------
  const handleExamChange = async (examId) => {
    setPatterns([]);
    setTests([]);
    setSelectedPattern("all");

    if (!examId) return;

    try {
      setLoading(false);
      const res = await API.getPatternsByExam(examId);
      if (res?.success) {
        setPatterns(res.data || []);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error("Patterns load error", e);
    }
  };

  // ------------------ PATTERN → TESTS ------------------
  const handlePatternChange = async (patternId) => {
    setSelectedPattern(patternId);
    setTests([]);

    if (patternId === "all") return;

    try {
      setLoading(false);
      const res = await API.getTestsByPattern(patternId);
      if (res?.success) {
        setTests(res.data || []);
        setLoading(false);
      } else if (Array.isArray(res)) {
        setTests(res);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error("Tests load error", e);
    }
  };

  // ------------------ CREATE TEST ------------------
  const handleCreate = () => {
    if (selectedPattern === "all") return;

    setEditingTest(null);
    setUploadMode(false);
    setJsonText("");

    setFormData({
      examPattern: selectedPattern,
      title: "",
      totalMarks: 100,
      duration: 60,
      isFree: false,
      questions: []
    });

    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      explanation: "",
      section: "",
      tags: [],
      difficulty: "medium"
    });

    setShowModal(true);
  };

  // ------------------ EDIT TEST ------------------
  const handleEdit = (test) => {
    setEditingTest(test);
    setUploadMode(false);
    setJsonText("");

    setFormData({
      examPattern: test.examPattern?._id || test.examPattern,
      title: test.title,
      totalMarks: test.totalMarks,
      duration: test.duration,
      isFree: test.isFree,
      questions: test.questions || []
    });

    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      explanation: "",
      section: "",
      tags: [],
      difficulty: "medium"
    });

    setShowModal(true);
  };

  // ------------------ DELETE TEST ------------------
  const handleDelete = async (testId) => {
    if (!confirm("Delete this test?")) return;

    try {
      await API.deletePracticeTest(testId);

      toast.success("Test deleted");

      if (selectedPattern && selectedPattern !== "all") {
        handlePatternChange(selectedPattern);
      }
    } catch (e) {
      console.error("Delete error", e);
      toast.error("Failed to delete");
    }
  };

  // ------------------ ADD SINGLE QUESTION ------------------
  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || currentQuestion.options.some(o => !o)) {
      toast.error("Fill all fields");
      return;
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      explanation: "",
      section: "",
      tags: [],
      difficulty: "medium"
    });

    toast.success("Added");
  };

  // ------------------ REMOVE QUESTION ------------------
  const handleRemoveQuestion = (i) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== i)
    }));
  };

  // ------------------ BULK UPLOAD ------------------
  const handleBulkUpload = () => {
    try {
      const data = JSON.parse(jsonText);

      if (!Array.isArray(data.questions)) {
        toast.error("Invalid JSON format");
        return;
      }

      setFormData(prev => ({
        ...prev,
        questions: data.questions
      }));

      toast.success(`${data.questions.length} questions loaded`);
      setJsonText("");

    } catch (e) {
      toast.error("Invalid JSON");
    }
  };

  // ------------------ SAVE TEST ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.questions.length === 0) {
      toast.error("Add at least 1 question");
      return;
    }

    try {
      if (editingTest) {
        await API.updatePracticeTest(editingTest._id, formData);
        toast.success("Updated");
      } else {
        await API.createPracticeTest(formData);
        toast.success("Created");
      }

      setShowModal(false);
      if (selectedPattern !== "all") handlePatternChange(selectedPattern);

    } catch (e) {
      console.error("Save error", e);
      toast.error("Failed to save");
    }
  };

  // ------------------ FRONT-END SELECTED DATA ------------------
  const selectedPatternData = patterns.find(p => p._id === selectedPattern);
  const selectedExamData = exams.find(e => e._id === selectedPatternData?.exam?._id);
  const selectedCategoryData = categories.find(c => c._id === selectedExamData?.category);

  // ------------------ FILTER TESTS ------------------
  const filteredTests =
    selectedPattern === "all"
      ? tests
      : tests.filter(t =>
        t.examPattern?._id === selectedPattern ||
        t.examPattern === selectedPattern
      );

  return (
    <AdminMobileAppWrapper title="Practice Tests">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="mb-2 lg:mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 lg:gap-4">
              <div>
                <h1 className="text-xl md:text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-0 lg:mb-2">
                  🏛️ Practice Tests
                </h1>
                <p className="text-gray-600 dark:text-gray-400 hidden md:block">
                  Manage practice tests for Government Exams
                </p>
              </div>
              <div>
                <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
              </div>
              <div>
                <Button
                  variant="admin"
                  onClick={handleCreate}
                  disabled={selectedPattern === "all"}
                >
                  + Add Test
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-4 mb-2 lg:mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} Exams
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam
              </label>
              <select
                onChange={(e) => handleExamChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Exams</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>
                    {exam.code} - {exam.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pattern
              </label>
              <select
                value={selectedPattern}
                onChange={(e) => handlePatternChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Patterns</option>
                {patterns.map(pattern => (
                  <option key={pattern._id} value={pattern._id}>
                    {pattern.exam.name} - {pattern.title}
                  </option>
                ))}
              </select>
            </div>
          </div>


          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading size="md" color="blue" message="Loading tests..." />
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
              {selectedPattern === "all" ? "No tests found. Create your first test!" : "No tests found for the selected pattern."}
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
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Questions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTests.map((test) => (
                        <tr key={test._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {test.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {test.duration} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {test.questions?.length || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${test.isFree
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                              }`}>
                              {test.isFree ? "Free" : "Paid"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(test)}
                              className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(test._id)}
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
                  {filteredTests.map((test) => (
                    <div
                      key={test._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-md lg:text-lg font-semibold text-gray-900 dark:text-white">
                              {test.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${test.isFree
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                              }`}>
                              {test.isFree ? "Free" : "Paid"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{test.duration} min</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{test.questions?.length || 0}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Total Marks:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{test.totalMarks || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(test)}
                            className="p-2 text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(test._id)}
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
                  {filteredTests.map((test) => (
                    <div
                      key={test._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-md lg:text-2xl font-bold truncate flex-1">
                          {test.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${test.isFree
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                          }`}>
                          {test.isFree ? "Free" : "Paid"}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{test.duration} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{test.questions?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Total Marks:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{test.totalMarks || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleEdit(test)}
                          className="flex-1 px-3 py-2 text-sm bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(test._id)}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-3 lg:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-md lg:text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingTest ? `Edit Test: ${editingTest.title}` : "Create New Test"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 pt-7">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                      className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Free Test
                    </span>
                  </label>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setUploadMode(false)}
                  className={`px-4 py-2 font-medium ${!uploadMode ? 'border-b-2 border-secondary-600 text-secondary-600' : 'text-gray-500'}`}
                >
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode(true)}
                  className={`px-4 py-2 font-medium ${uploadMode ? 'border-b-2 border-secondary-600 text-secondary-600' : 'text-gray-500'}`}
                >
                  Bulk Upload (JSON)
                </button>
              </div>

              {/* Manual Entry */}
              {!uploadMode && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add Question
                    <span className="text-xs text-gray-500 ml-2">
                      {formData.questions.length} questions added
                    </span>
                  </label>

                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Question Text *
                      </label>
                      <textarea
                        value={currentQuestion.questionText}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {currentQuestion.options.map((opt, idx) => (
                        <div key={idx}>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Option {idx + 1} {idx === currentQuestion.correctAnswerIndex && "(✓ Correct)"}
                          </label>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[idx] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: newOptions });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswerIndex: idx })}
                            className="mt-1 text-xs text-secondary-600 hover:underline"
                          >
                            Mark as Correct
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Section
                        </label>
                        <input
                          type="text"
                          value={currentQuestion.section}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, section: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Difficulty
                        </label>
                        <select
                          value={currentQuestion.difficulty}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Explanation
                        </label>
                        <input
                          type="text"
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddQuestion}
                      variant="admin"
                      fullWidth
                    >
                      + Add Question
                    </Button>
                  </div>

                  {/* Existing Questions */}
                  {formData.questions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.questions.map((q, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{q.questionText}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Section: {q.section || "N/A"} | Difficulty: {q.difficulty}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-primary-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bulk Upload */}
              {uploadMode && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    JSON Upload
                    <span className="text-xs text-gray-500 ml-2">
                      Format: &#123;"questions": [...]&#125;
                    </span>
                  </label>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    rows="10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white font-mono text-xs"
                    placeholder='{"questions": [{"questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswerIndex": 0, ...}]}'
                  />
                  <Button
                    onClick={handleBulkUpload}
                    variant="admin"
                  >
                    Upload JSON
                  </Button>

                  {formData.questions.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">
                        {formData.questions.length} questions loaded
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, questions: [] })}
                        className="text-primary-600 hover:text-red-800 text-sm"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                  {editingTest ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExamTests;

