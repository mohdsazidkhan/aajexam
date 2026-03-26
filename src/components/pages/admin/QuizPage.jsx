'use client';

import { useState, useEffect, useCallback } from "react";
import API from '../../../lib/api';

import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Pagination from "../../Pagination";
import ViewToggle from "../../ViewToggle";
import SearchFilter from "../../SearchFilter";
import {
  FaTrash,
  FaPlus,
  FaClock,
  FaStar,
  FaSpinner,
  FaEdit,
} from "react-icons/fa";
import { isMobile } from "react-device-detect";
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import Button from "../../ui/Button";
import { useSSR } from '../../../hooks/useSSR';

const QuizPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [totalMarks, setTotalMarks] = useState(5);
  const [timeLimit, setTimeLimit] = useState(2);
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [requiredLevel, setRequiredLevel] = useState(1);
  const [recommendedLevel, setRecommendedLevel] = useState(1);
  const [levelRangeMin, setLevelRangeMin] = useState(1);
  const [levelRangeMax, setLevelRangeMax] = useState(10);
  const [tags, setTags] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // List states
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  //const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(isMobile ? "list" : "table");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptions, setEditOptions] = useState(['', '', '', '']);
  const [editCorrectAnswerIndex, setEditCorrectAnswerIndex] = useState(0);
  const [editTimeLimit, setEditTimeLimit] = useState(30);
  const [filters, setFilters] = useState({
    difficulty: "",
    category: "",
    subcategory: "",
    isActive: "",
    requiredLevel: ""
  });
  console.log(category, 'categorycategory');
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchQuizzes = useCallback(async (page = 1, search = "", filterParams = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: itemsPerPage,
        ...(search && { search }),
        ...filterParams,
      };
      const response = await API.getAdminQuizzes(params);
      setQuizzes(response.quizzes || response);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await API.getAdminCategories({
        page: 1,
        limit: 50
      });
      setCategories(response.categories || response);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  // const fetchSubcategories = async () => {
  //   try {
  //     setLoadingSubcategories(true);
  //     const response = await API.getAdminSubcategories();
  //     setSubcategories(response.subcategories || response);
  //   } catch (error) {
  //     console.error("Error fetching subcategories:", error);
  //     toast.error("Failed to fetch subcategories");
  //   } finally {
  //     setLoadingSubcategories(false);
  //   }
  // };

  const fetchSubcategoriesByCategory = async (categoryId) => {

    if (!categoryId) {
      setFilteredSubcategories([]);
      return;
    }
    try {
      setLoadingSubcategories(true);
      const response = await API.getSubcategories(categoryId);

      setFilteredSubcategories(response.subcategories || response || []);
    } catch (error) {
      console.error("Error fetching subcategories by category:", error);
      toast.error("Failed to fetch subcategories for selected category");
      setFilteredSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };


  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchCategories();
    //fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchQuizzes(currentPage, debouncedSearch, filters);
  }, [currentPage, debouncedSearch, filters, fetchQuizzes]);


  // Handle category change
  const handleCategoryChange = (categoryId) => {
    console.log(categoryId, 'categoryId');
    setCategory(categoryId);
    setSubcategory(""); // Clear subcategory when category changes
    fetchSubcategoriesByCategory(categoryId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!subcategory) {
      toast.error("Please select a subcategory");
      return;
    }
    if (!totalMarks || totalMarks <= 0) {
      toast.error("Total marks must be greater than 0");
      return;
    }
    if (!timeLimit || timeLimit <= 0) {
      toast.error("Time limit must be greater than 0");
      return;
    }
    if (parseInt(levelRangeMin) > parseInt(levelRangeMax)) {
      toast.error("Minimum level cannot be greater than maximum level");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: title.trim(),
      category,
      subcategory,
      totalMarks: parseInt(totalMarks),
      timeLimit: parseInt(timeLimit),
      description: description.trim(),
      difficulty,
      requiredLevel: parseInt(requiredLevel),
      recommendedLevel: parseInt(recommendedLevel),
      levelRange: {
        min: parseInt(levelRangeMin),
        max: parseInt(levelRangeMax),
      },
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      isActive: true,
    };

    try {
      await API.createQuiz(payload);
      toast.success("Quiz created successfully!");
      resetForm();
      setShowForm(false);
      fetchQuizzes(currentPage, searchTerm, filters);
    } catch (err) {
      toast.error(err.message || "Failed to create quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setSubcategory("");
    setTotalMarks("");
    setTimeLimit("");
    setDescription("");
    setDifficulty("beginner");
    setRequiredLevel(1);
    setRecommendedLevel(1);
    setLevelRangeMin(1);
    setLevelRangeMax(10);
    setTags("");
    setFilteredSubcategories([]);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ difficulty: "", category: "", subcategory: "", isActive: "", requiredLevel: "" });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await API.deleteQuiz(id);
        toast.success("Quiz deleted successfully!");
        fetchQuizzes(currentPage, searchTerm, filters);
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("Failed to delete quiz");
      }
    }
  };

  const handleViewQuiz = async (quiz) => {
    console.log(quiz, 'handleViewQuiz');
    try {
      // For admin-created quizzes, try to fetch questions via admin questions API
      let enriched = { ...quiz };
      try {
        const qres = await API.getAdminQuestions({ quiz: quiz._id, limit: 1000 });
        console.log('API Response:', qres); // Debug log

        // Since we're filtering by quiz ID in the backend now, we can use all questions from response
        const questions = qres?.questions || [];
        console.log('Questions found:', questions?.length || 0); // Debug log

        if (Array.isArray(questions) && questions.length > 0) {
          enriched = { ...enriched, questions };
        } else {
          console.log('No questions found for quiz:', quiz._id);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        // show without questions if unavailable
      }
      setSelectedQuiz(enriched);
      setShowModal(true);
    } catch (err) {
      console.error('Error in handleViewQuiz:', err);
      toast.error(err?.message || "Failed to load quiz details");
    }
  };

  const handleEditQuiz = async (quiz) => {
    console.log('handleEditQuiz', quiz);
    try {
      // Fetch questions for this quiz
      let enriched = { ...quiz };
      try {
        const qres = await API.getAdminQuestions({ quiz: quiz._id, limit: 1000 });
        const questions = qres?.questions || [];

        if (Array.isArray(questions) && questions.length > 0) {
          enriched = { ...enriched, questions };
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        // Continue without questions if unavailable
      }
      setEditingQuiz(enriched);
      setShowEditModal(true);
    } catch (err) {
      console.error('Error in handleEditQuiz:', err);
      toast.error(err?.message || "Failed to load quiz for editing");
    }
  };

  const handleEditQuestion = (question, index) => {
    setEditingQuestion(question);
    setEditingQuestionIndex(index);
    setEditQuestionText(question.questionText || '');
    setEditOptions([...question.options || [], '', '', '', ''].slice(0, 4));
    setEditCorrectAnswerIndex(question.correctAnswerIndex || 0);
    setEditTimeLimit(question.timeLimit || 30);
  };

  const handleSaveQuestion = async () => {
    if (!editQuestionText.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (editOptions.some(option => !option.trim())) {
      toast.error('All options must be filled');
      return;
    }

    try {
      const payload = {
        quiz: editingQuiz._id,
        questionText: editQuestionText.trim(),
        options: editOptions.filter(option => option.trim()),
        correctAnswerIndex: parseInt(editCorrectAnswerIndex),
        timeLimit: parseInt(editTimeLimit) || 30
      };

      if (editingQuestion && editingQuestion._id) {
        // Update existing question
        await API.updateQuestion(editingQuestion._id, payload);
        toast.success('Question updated successfully!');
      } else {
        // Create new question
        await API.createQuestion(payload);
        toast.success('Question created successfully!');
      }

      // Refresh the quiz data
      handleEditQuiz(editingQuiz);

      // Reset form
      setEditingQuestion(null);
      setEditingQuestionIndex(null);
      setEditQuestionText('');
      setEditOptions(['', '', '', '']);
      setEditCorrectAnswerIndex(0);
      setEditTimeLimit(30);

    } catch (err) {
      console.error('Error saving question:', err);
      toast.error(err?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await API.deleteQuestion(questionId);
        toast.success('Question deleted successfully!');
        // Refresh the quiz data
        handleEditQuiz(editingQuiz);
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
      }
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...editOptions];
    newOptions[index] = value;
    setEditOptions(newOptions);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "expert":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filterOptions = {
    difficulty: {
      label: "Difficulty",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
        { value: "expert", label: "Expert" },
      ],
    },
    category: {
      label: "Category",
      options: categories.map((cat) => ({
        value: cat._id,
        label: cat.name,
      })),
    },
    isActive: {
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
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
                Quiz
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Questions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Details
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
            {quizzes.map((quiz) => (
              <tr
                key={quiz._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {((currentPage - 1) * itemsPerPage) + quizzes.indexOf(quiz) + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm md:text-lg font-medium text-gray-900 dark:text-white">
                      {quiz.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {quiz.description?.substring(0, 50)}...
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {quiz.category?.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {quiz.subcategory?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                      quiz.difficulty
                    )}`}
                  >
                    {quiz.questionCount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                      quiz.difficulty
                    )}`}
                  >
                    {quiz.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    Level {quiz.requiredLevel}-{quiz.recommendedLevel}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {quiz.totalMarks} marks
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {quiz.timeLimit} min
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {(() => {
                      const date = new Date(quiz.createdAt);
                      const day = date.getDate().toString().padStart(2, '0');
                      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                      const month = monthNames[date.getMonth()];
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(quiz.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewQuiz(quiz)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Quiz Details"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleEditQuiz(quiz)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      title="Edit Questions"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Quiz"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
      {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                {quiz.title}
              </h3>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                  quiz.difficulty
                )}`}
              >
                {quiz.difficulty}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-3">
              {quiz.description || "No description available"}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-3">
              Questions: <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                  quiz.difficulty
                )}`}
              >
                {quiz.questionCount}
              </span>
            </p>
            <div className="space-y-2 mb-2">
              <div className="flex items-center font-semibold text-sm text-gray-600 dark:text-gray-300">
                {quiz.category?.name} / {quiz.subcategory?.name}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FaStar className="w-4 h-4 mr-2" />
                Level {quiz.requiredLevel}-{quiz.recommendedLevel}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FaClock className="w-4 h-4 mr-2" />
                {quiz.totalMarks} marks • {quiz.timeLimit} min
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(() => {
                  const date = new Date(quiz.createdAt);
                  const day = date.getDate().toString().padStart(2, '0');
                  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                  const month = monthNames[date.getMonth()];
                  const year = date.getFullYear();
                  return `${day}-${month}-${year}`;
                })()} at {new Date(quiz.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewQuiz(quiz)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="View Quiz Details"
                >
                  👁️
                </button>
                <button
                  onClick={() => handleEditQuiz(quiz)}
                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                  title="Edit Questions"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(quiz._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete Quiz"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
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
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex flex-col md:flex-row items-end md:items-center justify-between">
              <div className="flex-none md:flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                    {quiz.title}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                      quiz.difficulty
                    )}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {quiz.description || "No description available"}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-3">
                  Questions: <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                      quiz.difficulty
                    )}`}
                  >
                    {quiz.questionCount}
                  </span>
                </p>
                <div className="space-y-2 mb-2">
                  <div className="flex items-center font-semibold text-sm text-gray-600 dark:text-gray-300">
                    {quiz.category?.name} / {quiz.subcategory?.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FaStar className="w-4 h-4 mr-2" />
                    Level {quiz.requiredLevel}-{quiz.recommendedLevel}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FaClock className="w-4 h-4 mr-2" />
                    {quiz.totalMarks} marks • {quiz.timeLimit} min
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Created: {new Date(quiz.createdAt).toLocaleDateString('en-US')} at {new Date(quiz.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleViewQuiz(quiz)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="View Quiz Details"
                >
                  👁️
                </button>
                <button
                  onClick={() => handleEditQuiz(quiz)}
                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                  title="Edit Questions"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(quiz._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete Quiz"
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
    <AdminMobileAppWrapper title="Quizzes">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Enhanced Header */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                  Quizzes ({pagination.total})
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Create, edit, and delete quizzes
                </p>
              </div>

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
                Add Quiz
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
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              filterOptions={filterOptions}
              placeholder="Search quizzes..."
            />
          </div>


          {/* Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Quiz
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold border-b pb-2 text-gray-800 dark:text-white">
                      Basic Information
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quiz Title *
                      </label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter quiz title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Enter quiz description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tags
                      </label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tags (comma separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Example: javascript, react, frontend
                      </p>
                    </div>
                  </div>

                  {/* Category & Timing */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold border-b pb-2 text-gray-800 dark:text-white">
                      Category & Timing
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category *
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories?.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subcategory *
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        required
                        disabled={!category || loadingSubcategories}
                      >
                        <option value="">
                          {!category
                            ? "Select Category First"
                            : loadingSubcategories
                              ? "Loading Subcategories..."
                              : "Select Subcategory"}
                        </option>
                        {filteredSubcategories.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      {loadingSubcategories && (
                        <div className="flex items-center text-sm text-orange-700 dark:text-yellow-400 mt-1">
                          <FaSpinner className="animate-spin mr-2" />
                          Loading subcategories...
                        </div>
                      )}

                      {category &&
                        !loadingSubcategories &&
                        filteredSubcategories.length === 0 && (
                          <div className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                            No subcategories found for this category
                          </div>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Marks *
                      </label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter total marks"
                        type="number"
                        min="1"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Limit (minutes) *
                      </label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter time limit"
                        type="number"
                        min="1"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Level Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold border-b pb-2 text-gray-800 dark:text-white">
                      Level Settings
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Difficulty *
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        required
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Required Level *
                      </label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Required level"
                        type="number"
                        min="1"
                        max="10"
                        value={requiredLevel}
                        onChange={(e) => setRequiredLevel(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Recommended Level *
                      </label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Recommended level"
                        type="number"
                        min="1"
                        max="10"
                        value={recommendedLevel}
                        onChange={(e) => setRecommendedLevel(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Level Range *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Min Level"
                          type="number"
                          min="1"
                          max="10"
                          value={levelRangeMin}
                          onChange={(e) => setLevelRangeMin(e.target.value)}
                          required
                        />
                        <input
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Max Level"
                          type="number"
                          min="1"
                          max="10"
                          value={levelRangeMax}
                          onChange={(e) => setLevelRangeMax(e.target.value)}
                          required
                        />
                      </div>
                      {parseInt(levelRangeMin) > parseInt(levelRangeMax) && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Min level cannot be greater than max level
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="submit"
                    variant="admin"
                    loading={isSubmitting}
                  >
                    Create Quiz
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Loading size="md" color="yellow" message="" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
                📝
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No quizzes found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Get started by creating your first quiz."}
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
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>

      {/* Quiz Review Modal */}
      {showModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[99] overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Quiz Details: {selectedQuiz.title}
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
                    {selectedQuiz.requiredLevel} - {selectedQuiz.recommendedLevel}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Time Limit:</span>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {selectedQuiz.timeLimit} minutes
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Total Marks:</span>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {selectedQuiz.totalMarks} marks
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Questions:</span>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {selectedQuiz.questionCount || selectedQuiz.questions?.length || 0}
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

              {selectedQuiz.tags && selectedQuiz.tags.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuiz.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                  Questions ({selectedQuiz.questions?.length || 0}):
                </h3>
                <div className="space-y-4">
                  {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
                    selectedQuiz.questions.map((q, i) => (
                      <div
                        key={q._id || i}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <p className="font-medium text-gray-800 dark:text-white mb-2">
                          {i + 1}. {q.questionText}
                        </p>
                        <div className="grid grid-cols-2 gap-2 ml-4">
                          {q.options?.map((opt, j) => (
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
                          )) || <div className="text-gray-500">No options available</div>}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Time: {q.timeLimit || 30}s
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        No questions found for this quiz. Questions may need to be added to this quiz.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                }}
                className="flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Edit Modal */}
      {showEditModal && editingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[99] overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg container mx-auto py-4 px-0 lg:px-10 w-full max-h-[95vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Edit Quiz Questions: {editingQuiz.title}
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuiz(null);
                  setEditingQuestion(null);
                  setEditingQuestionIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {editingQuiz.category?.name} / {editingQuiz.subcategory?.name}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Questions:</span>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {editingQuiz.questions?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Question Form */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">
                {editingQuestion ? `Edit Question ${editingQuestionIndex + 1}` : 'Add New Question'}
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={editQuestionText}
                      onChange={(e) => setEditQuestionText(e.target.value)}
                      rows="3"
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      value={editTimeLimit}
                      onChange={(e) => setEditTimeLimit(e.target.value)}
                      min="5"
                      max="300"
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Options (Select the correct answer) *
                    </label>
                    {editOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={index}
                          checked={editCorrectAnswerIndex === index}
                          onChange={(e) => setEditCorrectAnswerIndex(parseInt(e.target.value))}
                          className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <Button
                  variant="admin"
                  onClick={handleSaveQuestion}
                >
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </Button>
                {editingQuestion && (
                  <button
                    onClick={() => {
                      setEditingQuestion(null);
                      setEditingQuestionIndex(null);
                      setEditQuestionText('');
                      setEditOptions(['', '', '', '']);
                      setEditCorrectAnswerIndex(0);
                      setEditTimeLimit(30);
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Questions ({editingQuiz.questions?.length || 0})
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {editingQuiz.questions && editingQuiz.questions.length > 0 ? (
                  editingQuiz.questions.map((q, i) => (
                    <div
                      key={q._id || i}
                      className={`p-4 rounded-lg border-2 ${editingQuestionIndex === i
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-medium text-gray-800 dark:text-white flex-1">
                          {i + 1}. {q.questionText}
                        </p>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEditQuestion(q, i)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                            title="Edit Question"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                            title="Delete Question"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {q.options?.map((opt, j) => (
                          <div
                            key={j}
                            className={`p-2 rounded text-sm ${j === q.correctAnswerIndex
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-semibold"
                              : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {String.fromCharCode(65 + j)}. {opt}
                            {j === q.correctAnswerIndex && " ✓"}
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Time: {q.timeLimit || 30}s
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-gray-500 dark:text-gray-400 mb-2">
                      No questions found for this quiz.
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Use the form above to add your first question.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuiz(null);
                  setEditingQuestion(null);
                  setEditingQuestionIndex(null);
                  // Refresh the quiz list
                  fetchQuizzes(currentPage, searchTerm, filters);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminMobileAppWrapper>
  );
};

export default QuizPage;


