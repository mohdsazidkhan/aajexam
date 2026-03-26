"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

const getAttemptTestId = (attempt) => {
  return (
    attempt?.practiceTest?._id ||
    attempt?.practiceTest ||
    attempt?.test?._id ||
    attempt?.test ||
    'unknown'
  );
};

const AdminGovtExamResults = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [tests, setTests] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedPattern, setSelectedPattern] = useState("");
  const [selectedTest, setSelectedTest] = useState("all");
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "grid" : "table";
    }
    return "table";
  });
  const requestCache = useRef({
    exams: new Map(),
    patterns: new Map(),
    tests: new Map(),
  });

  const computeRankedAttempts = useCallback((attemptList = []) => {
    if (!Array.isArray(attemptList) || attemptList.length === 0) {
      return [];
    }

    const rankMap = new Map();
    const groupedByTest = new Map();

    attemptList.forEach((attempt) => {
      const testKey = getAttemptTestId(attempt);
      if (!groupedByTest.has(testKey)) {
        groupedByTest.set(testKey, []);
      }
      groupedByTest.get(testKey).push(attempt);
    });

    groupedByTest.forEach((group) => {
      const sortedGroup = [...group].sort((a, b) => {
        const scoreDiff = (b?.score ?? 0) - (a?.score ?? 0);
        if (scoreDiff !== 0) return scoreDiff;

        const accuracyDiff = (b?.accuracy ?? 0) - (a?.accuracy ?? 0);
        if (accuracyDiff !== 0) return accuracyDiff;

        const timeA = a?.totalTime ?? Number.POSITIVE_INFINITY;
        const timeB = b?.totalTime ?? Number.POSITIVE_INFINITY;
        if (timeA !== timeB) return timeA - timeB;

        const submittedA = a?.submittedAt ? new Date(a.submittedAt).getTime() : Number.POSITIVE_INFINITY;
        const submittedB = b?.submittedAt ? new Date(b.submittedAt).getTime() : Number.POSITIVE_INFINITY;
        return submittedA - submittedB;
      });

      let previous = null;
      sortedGroup.forEach((attempt, index) => {
        let rank = index + 1;
        if (previous) {
          const sameScore = (attempt?.score ?? 0) === (previous?.score ?? 0);
          const sameAccuracy = (attempt?.accuracy ?? 0) === (previous?.accuracy ?? 0);
          const sameTime = (attempt?.totalTime ?? Number.POSITIVE_INFINITY) === (previous?.totalTime ?? Number.POSITIVE_INFINITY);
          if (sameScore && sameAccuracy && sameTime) {
            const prevRank = previous?._id ? rankMap.get(previous._id) : null;
            if (prevRank != null) {
              rank = prevRank;
            }
          }
        }
        if (attempt?._id) {
          rankMap.set(attempt._id, rank);
        }
        previous = attempt;
      });
    });

    return attemptList.map((attempt) => {
      const computedRank = attempt?._id ? rankMap.get(attempt._id) : null;
      return {
        ...attempt,
        rank: computedRank ?? attempt?.rank ?? null,
      };
    });
  }, []);

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  const getExamsForCategory = useCallback(
    async (categoryId) => {
      if (!categoryId) return [];
      if (requestCache.current.exams.has(categoryId)) {
        return requestCache.current.exams.get(categoryId);
      }

      try {
        const response = await API.getExamsByCategory(categoryId);
        const data = response?.success && Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        requestCache.current.exams.set(categoryId, data);
        return data;
      } catch (error) {
        console.error(`Error fetching exams for category ${categoryId}:`, error);
        requestCache.current.exams.set(categoryId, []);
        return [];
      }
    },
    []
  );

  const getPatternsForExam = useCallback(
    async (examId) => {
      if (!examId) return [];
      if (requestCache.current.patterns.has(examId)) {
        return requestCache.current.patterns.get(examId);
      }

      try {
        const response = await API.getPatternsByExam(examId);
        const data = response?.success && Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        requestCache.current.patterns.set(examId, data);
        return data;
      } catch (error) {
        console.error(`Error fetching patterns for exam ${examId}:`, error);
        requestCache.current.patterns.set(examId, []);
        return [];
      }
    },
    []
  );

  const getTestsForPattern = useCallback(
    async (patternId) => {
      if (!patternId) return [];
      if (requestCache.current.tests.has(patternId)) {
        return requestCache.current.tests.get(patternId);
      }

      try {
        const response = await API.getTestsByPattern(patternId);
        const data = response?.success && Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        requestCache.current.tests.set(patternId, data);
        return data;
      } catch (error) {
        console.error(`Error fetching tests for pattern ${patternId}:`, error);
        requestCache.current.tests.set(patternId, []);
        return [];
      }
    },
    []
  );

  // ====================== OPTIMIZED DATA FETCH LOGIC ======================

  useEffect(() => {
    if (selectedTest === "all") {
      setAttempts(allAttempts);
    } else {
      const filtered = allAttempts.filter((attempt) => {
        const attemptTestId = getAttemptTestId(attempt);
        return attemptTestId === selectedTest;
      });
      const sortedByRank = filtered.slice().sort((a, b) => {
        const rankA = a?.rank ?? Number.POSITIVE_INFINITY;
        const rankB = b?.rank ?? Number.POSITIVE_INFINITY;
        if (rankA === rankB) {
          return (b?.score ?? 0) - (a?.score ?? 0);
        }
        return rankA - rankB;
      });
      setAttempts(sortedByRank);
    }
  }, [selectedTest, allAttempts]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "table") {
        setViewMode("list");
      } else if (window.innerWidth >= 768 && viewMode === "list") {
        setViewMode("table");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  // ✅ Prevent duplicate API runs
  const isFetchingRef = useRef(false);

  // Fetch categories on mount
  const fetchCategories = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const categoriesResponse = await API.getRealExamCategories();
      const categoryData = categoriesResponse?.success ? categoriesResponse.data || [] : [];
      setCategories(categoryData);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Fetch all attempts on mount (for filtering)
  const fetchAllAttempts = useCallback(async () => {
    try {
      const attemptsResponse = await API.getAdminAllAttempts({ limit: 200 });
      const attemptData =
        (attemptsResponse?.success &&
          Array.isArray(attemptsResponse.data) &&
          attemptsResponse.data) ||
        (Array.isArray(attemptsResponse) ? attemptsResponse : []) ||
        [];

      const rankedAttempts = computeRankedAttempts(attemptData);
      setAllAttempts(rankedAttempts);
      setAttempts(rankedAttempts);
    } catch (error) {
      console.error("❌ Error fetching attempts:", error);
      toast.error("Failed to load attempts");
      setAllAttempts([]);
      setAttempts([]);
    }
  }, [computeRankedAttempts]);

  // Load categories and attempts on mount
  useEffect(() => {
    fetchCategories();
    fetchAllAttempts();
  }, [fetchCategories, fetchAllAttempts]);

  // ====================== FILTER HANDLERS ======================

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId || "");
    setExams([]);
    setPatterns([]);
    setTests([]);
    setSelectedExam("");
    setSelectedPattern("");
    setSelectedTest("all");

    if (!categoryId) {
      return;
    }

    setLoading(true);
    try {
      const data = await getExamsForCategory(categoryId);
      setExams(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExamChange = async (examId) => {
    setSelectedExam(examId || "");
    setPatterns([]);
    setTests([]);
    setSelectedPattern("");
    setSelectedTest("all");

    if (!examId) {
      return;
    }

    setLoading(true);
    try {
      const data = await getPatternsForExam(examId);
      setPatterns(data || []);
    } catch (error) {
      console.error("Error fetching patterns:", error);
      toast.error("Failed to load patterns");
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePatternChange = async (patternId) => {
    setSelectedPattern(patternId || "");
    setTests([]);
    setSelectedTest("all");

    if (!patternId) {
      return;
    }

    setLoading(true);
    try {
      const data = await getTestsForPattern(patternId);
      setTests(data || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load tests");
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  // ====================== UTIL FUNCTIONS ======================

  const handleViewDetails = async (attemptId) => {
    try {
      const response = await API.getAdminAttemptDetails(attemptId);
      if (response?.success) {
        setSelectedAttempt(response.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("Failed to fetch attempt details");
    }
  };

  const handleExportCSV = () => {
    const filteredAttempts =
      selectedTest === "all"
        ? attempts
        : attempts.filter((attempt) => {
          const testId =
            attempt.test?._id ||
            attempt.test ||
            attempt.practiceTest?._id ||
            attempt.practiceTest;
          return testId === selectedTest;
        });

    if (filteredAttempts.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvHeaders = [
      "User",
      "Email",
      "Test",
      "Score",
      "Correct",
      "Wrong",
      "Accuracy",
      "Rank",
      "Percentile",
      "Time (min)",
      "Submitted",
    ];
    const csvRows = filteredAttempts.map((attempt) => [
      attempt.user?.name || "N/A",
      attempt.user?.email || "N/A",
      attempt.practiceTest?.title || "N/A",
      attempt.score || 0,
      attempt.correctCount || 0,
      attempt.wrongCount || 0,
      attempt.accuracy?.toFixed(2) + "%" || "0%",
      attempt.rank || "N/A",
      attempt.percentile?.toFixed(2) + "%" || "0%",
      Math.round(attempt.totalTime / 60000) || 0,
      attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "N/A",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-attempts-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const formatTime = (ms) => {
    if (!ms) return "N/A";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const testsById = useMemo(() => {
    const map = new Map();
    tests.forEach((test) => {
      if (test?._id) {
        map.set(test._id, test);
      }
    });
    return map;
  }, [tests]);

  const getTestTitle = useCallback(
    (attempt) => {
      if (!attempt) return "N/A";

      const practiceTitle =
        attempt.practiceTest?.title ||
        attempt.practiceTest?.name ||
        attempt.test?.title ||
        attempt.test?.name;
      if (practiceTitle) {
        return practiceTitle;
      }

      const attemptTestId =
        attempt.practiceTest?._id ||
        attempt.practiceTest ||
        attempt.test?._id ||
        attempt.test;

      if (attemptTestId && testsById.has(attemptTestId)) {
        const test = testsById.get(attemptTestId);
        return test?.title || test?.name || "N/A";
      }

      return "N/A";
    },
    [testsById]
  );

  const getTotalMarks = useCallback(
    (attempt) => {
      const practiceTestMarks =
        attempt?.practiceTest?.totalMarks ??
        attempt?.practiceTest?.maxMarks ??
        attempt?.practiceTest?.marks ??
        attempt?.practiceTest?.totalScore;

      if (practiceTestMarks != null) return practiceTestMarks;

      const attemptTotal =
        attempt?.totalMarks ??
        attempt?.maxMarks ??
        attempt?.marks ??
        attempt?.totalScore;

      if (attemptTotal != null) return attemptTotal;

      const attemptTestId =
        attempt?.practiceTest?._id ||
        attempt?.practiceTest ||
        attempt?.test?._id ||
        attempt?.test;

      if (attemptTestId && testsById.has(attemptTestId)) {
        const test = testsById.get(attemptTestId);
        return (
          test?.totalMarks ??
          test?.maxMarks ??
          test?.marks ??
          test?.totalScore ??
          0
        );
      }

      return 0;
    },
    [testsById]
  );

  // ====================== END FETCH FIX ======================


  if (!isMounted) return null;

  // Filter attempts based on selected test (client-side filtering)
  // When "all" is selected, show all attempts
  // When a specific test is selected, filter attempts for that test
  const filteredAttempts =
    selectedTest === "all"
      ? attempts
      : attempts.filter((attempt) => {
        const testId =
          attempt.practiceTest?._id ||
          attempt.practiceTest ||
          attempt.test?._id ||
          attempt.test;
        return testId === selectedTest;
      });

  return (
    <AdminMobileAppWrapper title="Test Results Dashboard">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-2 md:p-6 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="mb-4 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-2 lg:gap-4">
            <div>
              <h1 className="text-xl md:text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-0 lg:mb-2">
                📊 Test Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 hidden md:block">
                View and manage user test attempts and results
              </p>
            </div>
            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 lg:gap-4 mb-2 lg:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam
              </label>
              <select
                value={selectedExam}
                onChange={(e) => handleExamChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                disabled={!selectedCategory || loading}
              >
                <option value="">Select Exam</option>
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
                disabled={!selectedExam || loading}
              >
                <option value="">Select Pattern</option>
                {patterns.map(pattern => (
                  <option key={pattern._id} value={pattern._id}>
                    {pattern.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test
              </label>
              <select
                value={selectedTest}
                onChange={(e) => {
                  setSelectedTest(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-500 dark:bg-gray-700 dark:text-white"
                disabled={!selectedPattern || loading}
              >
                <option value="all">All Tests</option>
                {tests.map(test => (
                  <option key={test._id} value={test._id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading size="md" color="blue" message="Loading results..." />
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
              {selectedTest === "all" ? "No attempts found." : "No attempts found for the selected test."}
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredAttempts.length} attempt(s) found
                </div>
                <Button
                  onClick={handleExportCSV}
                  variant="admin"
                  size="small"
                >
                  Export CSV
                </Button>
              </div>

              {/* Table view */}
              {viewMode === "table" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Accuracy
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredAttempts.map((attempt) => (
                        <tr key={attempt._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                            #{attempt.rank || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="text-xs font-semibold uppercase tracking-wide text-secondary-600 dark:text-secondary-300 mb-1">
                              {getTestTitle(attempt)}
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {attempt.user?.name || "N/A"}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {attempt.user?.email || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {attempt.score || 0} / {getTotalMarks(attempt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${attempt.accuracy >= 80
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : attempt.accuracy >= 60
                                ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                              {attempt.accuracy?.toFixed(1) || 0}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatTime(attempt.totalTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              onClick={() => handleViewDetails(attempt._id)}
                              variant="admin"
                              size="small"
                            >
                              View Details
                            </Button>
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
                  {filteredAttempts.map((attempt) => (
                    <div
                      key={attempt._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              #{attempt.rank || "-"}
                            </span>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-600 dark:text-secondary-300">
                                {getTestTitle(attempt)}
                              </p>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                {attempt.user?.name || "N/A"}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {attempt.user?.email || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Score:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {attempt.score || 0} / {getTotalMarks(attempt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Accuracy:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${attempt.accuracy >= 80
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : attempt.accuracy >= 60
                                  ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}>
                                {attempt.accuracy?.toFixed(1) || 0}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Time:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {formatTime(attempt.totalTime)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            onClick={() => handleViewDetails(attempt._id)}
                            variant="admin"
                            size="small"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid view */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAttempts.map((attempt) => (
                    <div
                      key={attempt._id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                          #{attempt.rank || "-"}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${attempt.accuracy >= 80
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : attempt.accuracy >= 60
                            ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                          {attempt.accuracy?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-600 dark:text-secondary-300 mb-1 truncate">
                        {getTestTitle(attempt)}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {attempt.user?.name || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">
                        {attempt.user?.email || "N/A"}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Score:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {attempt.score || 0} / {getTotalMarks(attempt)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Time:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatTime(attempt.totalTime)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(attempt._id)}
                        className="w-full px-3 py-2 text-sm bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                Attempt Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User</h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-600 dark:text-secondary-300 mb-1">
                    {getTestTitle(selectedAttempt)}
                  </p>
                  <p className="text-gray-900 dark:text-white">{selectedAttempt.user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAttempt.user?.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test</h3>
                  <p className="text-md lg:text-base text-gray-900 dark:text-white">
                    {getTestTitle(selectedAttempt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score</h3>
                  <p className="text-md lg:text-2xl font-bold text-secondary-600">{selectedAttempt.score}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accuracy</h3>
                  <p className="text-md lg:text-2xl font-bold text-green-600">{selectedAttempt.accuracy?.toFixed(1)}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rank</h3>
                  <p className="text-md lg:text-2xl font-bold text-primary-600">#{selectedAttempt.rank}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Percentile</h3>
                  <p className="text-md lg:text-2xl font-bold text-primary-600">{selectedAttempt.percentile?.toFixed(1)}%</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="text-md lg:text-2xl font-bold text-green-600">{selectedAttempt.correctCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="text-md lg:text-2xl font-bold text-primary-600">{selectedAttempt.wrongCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Wrong</div>
                  </div>
                  <div className="p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded">
                    <div className="text-md lg:text-2xl font-bold text-secondary-600">{formatTime(selectedAttempt.totalTime)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
                  </div>
                </div>
              </div>

              {selectedAttempt.submittedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Submitted At</h3>
                  <p className="text-sm lg:text-base text-gray-900 dark:text-white">
                    {new Date(selectedAttempt.submittedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExamResults;

