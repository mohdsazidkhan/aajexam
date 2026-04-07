import { useState, useEffect, useCallback } from "react";
import API from '../../../lib/api';
import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Pagination from "../../Pagination";
import ViewToggle from "../../ViewToggle";
import SearchFilter from "../../SearchFilter";
import {
  Trash2,
  Plus,
  Clock,
  Star,
  Loader2,
  Edit3,
  Info,
  CheckCircle2,
  Layers,
  ChevronRight,
  Search,
  Filter,
  X,
  Target,
  BrainCircuit,
  Activity,
  Zap,
  LayoutGrid,
  List,
  Table,
  Calendar,
  Settings,
  Database,
  ArrowRight,
  Eye,
  ShieldCheck,
  AlertCircle,
  Award,
  BookOpen,
  Hash,
  HelpCircle,
  Fingerprint,
  SquarePlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isMobile } from "react-device-detect";
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
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
        return "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200";
      case "advanced":
        return "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200";
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
    <Card
      variant="white"
      className="p-0 border-none shadow-xl bg-white dark:bg-slate-900/60 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 dark:border-white/5">
              {[
                { label: '#', icon: Hash },
                { label: 'Quiz Title', icon: BookOpen },
                { label: 'Category', icon: Database },
                { label: 'Questions', icon: HelpCircle },
                { label: 'Difficulty', icon: Settings },
                { label: 'Level / Marks', icon: Activity },
                { label: 'Created', icon: Calendar },
                { label: 'Actions', icon: ArrowRight, align: 'text-right' }
              ].map((head, i) => (
                <th key={i} className={`px-4 lg:px-8 py-4 lg:py-8 ${head.align || 'text-left'}`}>
                  <div className={`flex items-center gap-3 ${head.align === 'text-right' ? 'justify-end' : ''}`}>
                    <head.icon className="w-4 h-4 text-fuchsia-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{head.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50 dark:divide-white/5">
            {quizzes.map((quiz, index) => (
              <motion.tr
                key={quiz._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group hover:bg-indigo-500/5 transition-all"
              >
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <span className="text-xs font-black text-slate-400 font-mono">
                    #{((currentPage - 1) * itemsPerPage) + index + 1}
                  </span>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6 max-w-md">
                  <div className="space-y-1 text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 uppercase tracking-tight">
                      {quiz.title}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 line-clamp-1 uppercase tracking-widest">
                      {quiz.description?.substring(0, 100)}
                    </p>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Database className="w-3 h-3 text-indigo-500" />
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{quiz.category?.name}</span>
                    </div>
                    {quiz.subcategory && (
                      <div className="flex items-center gap-2 pl-4">
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{quiz.subcategory?.name}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border-2 border-indigo-500/20 text-indigo-600 font-black text-xs">
                    {quiz.questionCount || 0}
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <span className={`inline-flex px-3 py-1.5 rounded-xl border-2 text-[10px] font-black tracking-tighter uppercase ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic">Level {quiz.requiredLevel}-{quiz.recommendedLevel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic">{quiz.totalMarks} Marks</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                      {new Date(quiz.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      {new Date(quiz.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleViewQuiz(quiz)}
                      className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditQuiz(quiz)}
                      className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                      title="Edit Questions"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(quiz._id)}
                      className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
      {quizzes.map((quiz, index) => (
        <motion.div
          key={quiz._id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white/50 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col"
        >
          {/* Gradient Header */}
          <div className="relative h-28 overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cyber-network.png')] opacity-10" />
            <div className="relative z-10 p-6 flex justify-between items-start text-white font-black italic">
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Category</div>
                <div className="text-xs uppercase">{quiz.category?.name || 'General'}</div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleViewQuiz(quiz)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 hover:bg-white/40 transition-all"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditQuiz(quiz)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 hover:bg-white/40 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="absolute bottom-4 left-6 z-10 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border border-white/30 backdrop-blur-md ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border border-white/30 backdrop-blur-md bg-white/10 text-white">
                {quiz.questionCount || 0} Questions
              </span>
            </div>
          </div>

          <div className="p-3 lg:p-8 flex-1 flex flex-col">
            <div className="mb-6 flex-1">
              <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight group-hover:text-indigo-500 transition-colors line-clamp-2 mb-3">
                {quiz.title}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest line-clamp-3 leading-relaxed">
                {quiz.description || "No description available"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 lg:mb-8">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent group-hover:border-indigo-500/10 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Min Level</span>
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white uppercase italic">Level {quiz.requiredLevel}-{quiz.recommendedLevel}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent group-hover:border-indigo-500/10 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Time Limit</span>
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{quiz.timeLimit} Minutes</div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-slate-50 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{quiz.totalMarks} Marks</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDelete(quiz._id)}
                className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="space-y-3 lg:space-y-6">
      {quizzes.map((quiz, index) => (
        <motion.div
          key={quiz._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white/50 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 p-3 lg:p-8 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
            <div className="flex items-start gap-3 lg:gap-8 flex-1">
              <div className="w-24 h-24 rounded-lg lg:rounded-[2rem] bg-fuchsia-500/10 border-2 border-fuchsia-500/20 flex items-center justify-center text-4xl shadow-xl flex-shrink-0 group-hover:rotate-6 transition-transform">
                {quiz.title.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3 font-black text-[10px] uppercase tracking-widest">
                  <div className="px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-500 font-black">
                     {quiz.category?.name || 'General'}
                   </div>
                  <div className={`px-3 py-1 rounded-full border border-current font-black ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                </div>
                <h3 className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none group-hover:text-fuchsia-500 transition-colors">
                  {quiz.title}
                </h3>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-2xl line-clamp-2">
                   {quiz.description || "No description available"}
                 </p>

                <div className="flex flex-wrap items-center gap-3 lg:gap-8 pt-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white italic">
                    <BrainCircuit className="w-4 h-4 text-indigo-500" />
                    <span>{quiz.questionCount || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Level {quiz.requiredLevel}-{quiz.recommendedLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{quiz.timeLimit} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-rose-500" />
                    <span>{quiz.totalMarks} Marks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:pl-8 lg:border-l-2 border-slate-50 dark:border-white/5">
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewQuiz(quiz)}
                  className="px-4 lg:px-8 py-4 bg-fuchsia-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-3"
                >
                  <Eye className="w-5 h-5" /> View Details
                </motion.button>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditQuiz(quiz)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-transparent hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(quiz._id)}
                    className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Quizzes">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent w-full max-auto text-slate-900 dark:text-white font-outfit ">
          {/* Page Header */}
          <div className="relative mb-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 pb-8 border-b-4 border-slate-100 dark:border-white/5 relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary-500/10 rounded-2xl border-2 border-primary-500/20">
                    <Zap className="w-8 h-8 text-primary-500" />
                  </div>
                  <span className="text-[10px] font-black tracking-[0.4em] text-primary-500 uppercase">Quiz Management</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none mb-4 italic">
                  MANAGE <span className="text-indigo-600 whitespace-nowrap">QUIZZES</span>
                </h1>
                <p className="max-w-xl text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em] text-[10px] leading-relaxed">
                  Create, edit, and manage quizzes for your students.
                </p>
              </motion.div>

              <div className="flex flex-wrap items-center gap-4 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex bg-slate-100/50 dark:bg-white/5 backdrop-blur-xl p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-200/50 dark:border-white/10"
                >
                  <button onClick={() => setViewMode('table')} className={`p-4 rounded-2xl transition-all ${viewMode === 'table' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-primary-500'}`}><Table className="w-5 h-5" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-4 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-primary-500'}`}><List className="w-5 h-5" /></button>
                  <button onClick={() => setViewMode('grid')} className={`p-4 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-primary-500'}`}><LayoutGrid className="w-5 h-5" /></button>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="group relative px-4 lg:px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:shadow-primary-500/20 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-3">
                    <Plus className="w-5 h-5" /> CREATE QUIZ
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-8">
              {[
                { label: 'Total Quizzes', value: pagination.total || 0, icon: Target, color: 'primary' },
                { label: 'Avg. Time', value: '25m', icon: Clock, color: 'amber' },
                { label: 'Categories', value: categories.length, icon: Layers, color: 'emerald' },
                { label: 'Published', value: pagination.total || 0, icon: Database, color: 'purple' }
              ].map((stat, i) => (
                <Card key={i} className="p-6 border-none shadow-sm flex items-center gap-4 bg-white dark:bg-slate-900">
                  <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</h4>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-4"
          >
            <div className="bg-white/50 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] p-6 border-4 border-slate-100 dark:border-white/5 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-6">
                <div className="flex-1 w-full relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-fuchsia-500 transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-xl lg:rounded-[2.5rem] text-xs font-black uppercase tracking-widest outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  <div className="relative group min-w-[200px]">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-fuchsia-500 transition-colors">
                      <Database className="w-5 h-5" />
                    </div>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full pl-16 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-fuchsia-500/30 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div className="relative group min-w-[150px]">
                    <select
                      value={filters.difficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                      className="w-full px-3 lg:px-6 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-fuchsia-500/30 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer text-center"
                    >
                      <option value="">All Difficulties</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div className="relative min-w-[120px]">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="w-full px-3 lg:px-6 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-fuchsia-500/30 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer text-center"
                    >
                       {[10, 20, 50, 100].map(val => <option key={val} value={val}>{val} per page</option>)}
                    </select>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearFilters}
                    className="p-5 bg-primary-500/10 text-primary-500 rounded-full hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>


          {/* Create Quiz Modal */}
          <AnimatePresence>
            {showForm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-5xl bg-white/90 dark:bg-[#0A0F1E]/90 backdrop-blur-2xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                  {/* Modal Header */}
                  <div className="p-3 lg:p-8 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-fuchsia-100/50 to-transparent dark:from-fuchsia-500/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-fuchsia-500 text-white rounded-2xl shadow-lg shadow-fuchsia-500/20">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Create <span className="text-indigo-500">Quiz</span></h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fill in the details to create a new quiz</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  <div className="p-3 lg:p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-4 lg:space-y-8">
                          <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-100 dark:border-white/5">
                            <Fingerprint className="w-5 h-5 text-fuchsia-500" />
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Basic Information</h3>
                          </div>

                          <div className="space-y-3 lg:space-y-6">
                            <div className="relative group">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Quiz Title</label>
                              <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Introduction to JavaScript"
                                className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-bold uppercase tracking-tight outline-none transition-all placeholder:text-slate-300"
                              />
                            </div>

                            <div className="relative group">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Description</label>
                              <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                placeholder="Enter a brief description of this quiz..."
                                className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:border-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-bold uppercase tracking-tight outline-none transition-all placeholder:text-slate-300 resize-none"
                              />
                            </div>

                            <div className="relative group">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Tags</label>
                              <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g. math, algebra, beginner"
                                className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-bold uppercase tracking-tight outline-none transition-all placeholder:text-slate-300"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 lg:space-y-8">
                          <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-100 dark:border-white/5">
                            <Settings className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Quiz Settings</h3>
                          </div>

                          <div className="space-y-3 lg:space-y-6">
                            <div className="grid grid-cols-2 gap-3 lg:gap-6">
                              <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Category</label>
                                <select
                                  value={category}
                                  onChange={(e) => handleCategoryChange(e.target.value)}
                                  className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-xs font-bold uppercase tracking-tight outline-none transition-all appearance-none cursor-pointer"
                                >
                                  <option value="">Select Category</option>
                                  {categories?.map(cat => <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>)}
                                </select>
                              </div>
                              <div className="relative group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Subcategory</label>
                                <select
                                  value={subcategory}
                                  onChange={(e) => setSubcategory(e.target.value)}
                                  disabled={!category || loadingSubcategories}
                                  className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-xs font-bold uppercase tracking-tight outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                                >
                                  <option value="">{loadingSubcategories ? 'Loading...' : 'Select Subcategory'}</option>
                                  {filteredSubcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name.toUpperCase()}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:gap-6">
                              <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Total Marks</label>
                                <input
                                  type="number"
                                  value={totalMarks}
                                  onChange={(e) => setTotalMarks(e.target.value)}
                                  className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-black outline-none transition-all"
                                />
                              </div>
                              <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Time Limit (Minutes)</label>
                                <input
                                  type="number"
                                  value={timeLimit}
                                  onChange={(e) => setTimeLimit(e.target.value)}
                                  className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-black outline-none transition-all"
                                />
                              </div>
                            </div>

                            <div className="group">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Difficulty Level</label>
                              <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer text-center"
                              >
                                <option value="beginner">BEGINNER</option>
                                <option value="intermediate">INTERMEDIATE</option>
                                <option value="advanced">ADVANCED</option>
                                <option value="expert">EXPERT</option>
                              </select>
                            </div>

                            <div className="p-6 bg-indigo-500/5 rounded-lg lg:rounded-[2rem] border-2 border-indigo-500/10 space-y-3 lg:space-y-6">
                              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] text-center">Level Requirements</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block text-center">Required Level</label>
                                  <input type="number" value={requiredLevel} onChange={(e) => setRequiredLevel(e.target.value)} className="w-full bg-white dark:bg-white/10 px-4 py-3 rounded-xl text-center text-sm font-black outline-none border-2 border-transparent focus:border-indigo-500/30" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block text-center">Recommended Level</label>
                                  <input type="number" value={recommendedLevel} onChange={(e) => setRecommendedLevel(e.target.value)} className="w-full bg-white dark:bg-white/10 px-4 py-3 rounded-xl text-center text-sm font-black outline-none border-2 border-transparent focus:border-indigo-500/30" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block text-center">Min Level</label>
                                  <input type="number" value={levelRangeMin} onChange={(e) => setLevelRangeMin(e.target.value)} className="w-full bg-white dark:bg-white/10 px-4 py-3 rounded-xl text-center text-sm font-black outline-none border-2 border-transparent focus:border-indigo-500/30" />
                                </div>
                                <div>
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block text-center">Max Level</label>
                                  <input type="number" value={levelRangeMax} onChange={(e) => setLevelRangeMax(e.target.value)} className="w-full bg-white dark:bg-white/10 px-4 py-3 rounded-xl text-center text-sm font-black outline-none border-2 border-transparent focus:border-indigo-500/30" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pb-8 border-t border-slate-100 dark:border-white/5 pt-8">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => { setShowForm(false); resetForm(); }}
                          className="px-4 lg:px-10 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 lg:px-12 py-5 bg-fuchsia-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-fuchsia-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                          Create Quiz
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Quiz List */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 space-y-3 lg:space-y-6"
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
                    <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-fuchsia-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-2 animate-pulse">Please wait</p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading quizzes...</p>
                  </div>
                </motion.div>
              ) : quizzes.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="w-20 lg:w-32 h-20 lg:h-32 rounded-2xl lg:rounded-[3.5rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 lg:mb-8 relative group">
                    <div className="absolute inset-0 bg-fuchsia-500/10 rounded-2xl lg:rounded-[3.5rem] group-hover:scale-110 transition-transform" />
                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 relative z-10" />
                  </div>
                  <h3 className="text-xl lg:text-3xl font-black italic tracking-tighter text-slate-300 dark:text-slate-700 uppercase mb-4">
                    No Quizzes <span className="text-indigo-500/30">Found</span>
                  </h3>
                  <p className="max-w-md text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    {searchTerm ? 'No quizzes match your search. Try a different keyword or clear your filters.' : 'Create your first quiz to get started.'}
                  </p>
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearFilters}
                      className="mt-4 lg:mt-8 px-4 lg:px-10 py-5 bg-fuchsia-500/10 text-fuchsia-500 rounded-lg lg:rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-fuchsia-500 hover:text-white transition-all border-2 border-fuchsia-500/20 shadow-xl"
                    >
                      Clear Filters
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pb-24"
                >
                  {viewMode === 'table' && <TableView />}
                  {viewMode === 'grid' && <CardView />}
                  {viewMode === 'list' && <ListView />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 lg:mt-12 mb-20"
            >
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* View Quiz Modal */}
      <AnimatePresence>
        {showModal && selectedQuiz && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white/90 dark:bg-[#0A0F1E]/90 backdrop-blur-2xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-3 lg:p-8 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-100/50 to-transparent dark:from-indigo-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Quiz <span className="text-indigo-500">Details</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedQuiz.title}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="p-3 lg:p-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-4 lg:space-y-12">
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Difficulty', value: selectedQuiz.difficulty, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                      { label: 'Time Limit', value: `${selectedQuiz.timeLimit} Min`, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                      { label: 'Questions', value: selectedQuiz.questionCount || selectedQuiz.questions?.length || 0, icon: BrainCircuit, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { label: 'Total Marks', value: `${selectedQuiz.totalMarks} Marks`, icon: Target, color: 'text-rose-500', bg: 'bg-rose-500/10' }
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/5 flex flex-col items-center text-center gap-2">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description Block */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-100 dark:border-white/5">
                      <Database className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Quiz Overview</h3>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed p-6 bg-slate-50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/5">
                      {selectedQuiz.description || "No description available"}
                    </p>
                  </div>

                  {/* Tags Block */}
                  {selectedQuiz.tags && selectedQuiz.tags.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-100 dark:border-white/5">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Tags</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuiz.tags.map((tag, i) => (
                          <span key={i} className="px-4 py-2 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questions Block */}
                  <div className="space-y-3 lg:space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-100 dark:border-white/5">
                      <Layers className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest text-center">Questions List</h3>
                    </div>

                    <div className="space-y-4">
                      {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
                        selectedQuiz.questions.map((q, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={q._id || i}
                            className="p-4 lg:p-8 bg-slate-50 dark:bg-white/5 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 hover:border-indigo-500/20 transition-all group"
                          >
                            <div className="flex items-start gap-3 lg:gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black italic shadow-lg shadow-indigo-500/20 flex-shrink-0 group-hover:rotate-6 transition-transform">
                                {i + 1}
                              </div>
                              <div className="flex-1 space-y-4">
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-relaxed">
                                  {q.questionText}
                                </p>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  {q.options?.map((opt, j) => (
                                    <div key={j} className={`px-3 lg:px-6 py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${j === q.correctAnswerIndex ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-white/50 dark:bg-white/5 border-transparent text-slate-400'}`}>
                                      <span className="mr-3 opacity-50">{String.fromCharCode(65 + j)}.</span> {opt}
                                      {j === q.correctAnswerIndex && <CheckCircle2 className="w-4 h-4 inline-block ml-2 mb-1" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-20 text-center bg-slate-50 dark:bg-white/5 rounded-xl lg:rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/5">
                          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No questions yet. Add questions to this quiz to get started.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 lg:p-8 border-t-2 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                  className="px-4 lg:px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Questions Modal */}
      <AnimatePresence>
        {showEditModal && editingQuiz && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditModal(false);
                setEditingQuiz(null);
                setEditingQuestion(null);
                setEditingQuestionIndex(null);
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-white/90 dark:bg-[#0A0F1E]/90 backdrop-blur-2xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-3 lg:p-8 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-100/50 to-transparent dark:from-emerald-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Edit <span className="text-emerald-500">Questions</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Editing: {editingQuiz.title}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingQuiz(null);
                    setEditingQuestion(null);
                    setEditingQuestionIndex(null);
                  }}
                  className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="p-3 lg:p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">

                  {/* Left Column: Question Form */}
                  <div className="xl:col-span-5 space-y-4 lg:space-y-8">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-100 dark:border-white/5">
                      <SquarePlus className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                        {editingQuestion ? `Editing Question ${editingQuestionIndex + 1}` : 'Add New Question'}
                      </h3>
                    </div>

                    <div className="p-4 lg:p-8 bg-slate-50 dark:bg-white/5 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 space-y-4 lg:space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Question Text</label>
                        <textarea
                          value={editQuestionText}
                          onChange={(e) => setEditQuestionText(e.target.value)}
                          placeholder="Enter the question text..."
                          rows="4"
                          className="w-full px-3 lg:px-6 py-4 bg-white dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl text-xs font-bold uppercase tracking-tight outline-none transition-all placeholder:text-slate-300 resize-none shadow-sm"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Options</label>
                        <div className="space-y-3">
                          {editOptions.map((option, index) => (
                            <div key={index} className="flex items-center gap-3 group">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all border-2 ${editCorrectAnswerIndex === index ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 cursor-pointer hover:border-emerald-500/30'}`} onClick={() => setEditCorrectAnswerIndex(index)}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                className="flex-1 px-3 lg:px-6 py-3 bg-white dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-xl text-xs font-bold uppercase tracking-tight outline-none transition-all shadow-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block">Time Limit (Seconds)</label>
                        <div className="flex items-center gap-4">
                          <Clock className="w-5 h-5 text-slate-300" />
                          <input
                            type="number"
                            value={editTimeLimit}
                            onChange={(e) => setEditTimeLimit(e.target.value)}
                            className="w-full px-3 lg:px-6 py-4 bg-white dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl text-sm font-black outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveQuestion}
                          className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                        >
                          <Zap className="w-5 h-5" />
                          {editingQuestion ? 'Save Changes' : 'Add Question'}
                        </motion.button>
                        {editingQuestion && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditingQuestion(null);
                              setEditingQuestionIndex(null);
                              setEditQuestionText('');
                              setEditOptions(['', '', '', '']);
                              setEditCorrectAnswerIndex(0);
                              setEditTimeLimit(30);
                            }}
                            className="p-5 bg-slate-200 dark:bg-white/5 text-slate-500 rounded-2xl"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Question List */}
                  <div className="xl:col-span-7 space-y-4 lg:space-y-8">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Questions in this Quiz</h3>
                      </div>
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black rounded-lg border border-indigo-500/20">
                        {editingQuiz.questions?.length || 0} Total
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                      {editingQuiz.questions && editingQuiz.questions.length > 0 ? (
                        editingQuiz.questions.map((q, i) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={q._id || i}
                            className={`p-6 rounded-xl lg:rounded-[2.5rem] border-4 transition-all group ${editingQuestionIndex === i ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-emerald-500/10'}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-lg flex-shrink-0 ${editingQuestionIndex === i ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-white dark:bg-white/5 text-slate-400'}`}>
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-4 pr-12 leading-relaxed">
                                  {q.questionText}
                                </p>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  {q.options?.map((opt, j) => (
                                    <div key={j} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${j === q.correctAnswerIndex ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' : 'bg-white/50 dark:bg-white/5 text-slate-400 border border-transparent'}`}>
                                      <span className="opacity-50">{String.fromCharCode(65 + j)}</span>
                                      <span className="truncate">{opt}</span>
                                      {j === q.correctAnswerIndex && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                                    </div>
                                  ))}
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    {q.timeLimit || 30}s time limit
                                  </div>
                                  <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEditQuestion(q, i)}
                                      className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(q._id)}
                                      className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-32 text-center bg-slate-50 dark:bg-white/5 rounded-xl lg:rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/5">
                          <Fingerprint className="w-16 h-16 text-slate-200 mx-auto mb-6 animate-pulse" />
                          <h4 className="text-xl font-black italic text-slate-300 uppercase tracking-tighter mb-2">No Questions Found</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                            This quiz has no questions yet. Use the form on the left to add your first question.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 lg:p-8 border-t-2 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-4 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingQuiz(null);
                    setEditingQuestion(null);
                    setEditingQuestionIndex(null);
                    fetchQuizzes(currentPage, searchTerm, filters);
                  }}
                  className="flex-1 py-5 bg-emerald-500 text-white rounded-lg lg:rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Done
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminMobileAppWrapper>
  );
};

export default QuizPage;



