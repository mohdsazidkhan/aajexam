'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import API from '../../lib/api';
// MobileAppWrapper removed
// UnifiedNavbar removed
import UnifiedFooter from '../../components/UnifiedFooter';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';

const AddQuestionPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: '',
    difficulty: 'medium'
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState({
    currentCount: 0,
    limit: 100,
    remaining: 100,
    canAddMore: true
  });
  const [dailyCount, setDailyCount] = useState({
    currentCount: 0,
    limit: 5,
    remaining: 5,
    canAddMore: true
  });

  useEffect(() => {
    fetchCategories();
    fetchCurrentMonthQuestionCount();
    fetchCurrentDayQuestionCount();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.getPublicCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMonthQuestionCount = async () => {
    try {
      const response = await API.getCurrentMonthQuestionCount();
      if (response.success) {
        setQuestionCount(response.data);
      }
    } catch (error) {
      console.error('Error fetching current month question count:', error);
    }
  };

  const fetchCurrentDayQuestionCount = async () => {
    try {
      const response = await API.getCurrentDayQuestionCount();
      if (response.success) {
        setDailyCount(response.data);
      }
    } catch (error) {
      console.error('Error fetching current day question count:', error);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const validateForm = () => {
    if (!dailyCount.canAddMore) {
      toast.error(`You have reached the daily limit of ${dailyCount.limit} questions. You can add more questions tomorrow.`);
      return false;
    }

    if (!questionCount.canAddMore) {
      toast.error(`You have reached the monthly limit of ${questionCount.limit} questions. You can add more questions next month.`);
      return false;
    }

    if (!formData.question.trim()) {
      toast.error('Please enter a question');
      return false;
    }

    if (formData.options.some(option => !option.trim())) {
      toast.error('Please fill in all options');
      return false;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }

    if (!formData.explanation.trim()) {
      toast.error('Please provide an explanation');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        questionText: formData.question.trim(),
        options: formData.options.map(opt => opt.trim()),
        correctOptionIndex: formData.correctAnswer,
        explanation: formData.explanation.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
      };

      const response = await API.createUserQuestion(payload);

      if (response.success) {
        toast.success('Question submitted successfully! It will be reviewed before publishing.');

        // Reset form
        setFormData({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
          category: '',
          difficulty: 'medium'
        });

        // Refresh question counts
        fetchCurrentMonthQuestionCount();
        fetchCurrentDayQuestionCount();

        // Navigate back
        router.back();
      } else {
        toast.error(response.message || 'Failed to submit question');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      if (error?.response?.status === 429) {
        const errorData = error?.response?.data;
        if (errorData?.error === 'DAILY_LIMIT_EXCEEDED') {
          toast.error('You can add max 5 questions per day');
        } else if (errorData?.error === 'MONTHLY_LIMIT_EXCEEDED') {
          toast.error('You can add max 100 questions in a month');
        } else {
          toast.error(errorData?.message || 'Daily/Monthly limit exceeded');
        }
      } else {
        toast.error(error.message || 'Failed to submit question');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add Question - AajExam Pro</title>
        <meta name="description" content="Create and submit questions to AajExam. Contribute to the knowledge base and help others learn." />
        <meta name="keywords" content="add question, create question, submit question, contribute content, pro user, question creator" />
        <meta property="og:title" content="Add Question - AajExam Pro" />
        <meta property="og:description" content="Create and submit questions to AajExam." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Add Question - AajExam Pro" />
        <meta name="twitter:description" content="Create and contribute questions on AajExam. All users can post!" />
      </Head>

      <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📝 Create New Question</h1>
                <p className="text-gray-600 dark:text-gray-300">Contribute quality questions to help the community</p>
              </div>
            </div>
          </div>

          {/* Daily Question Count */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700 mb-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Daily Progress: {dailyCount.currentCount}/{dailyCount.limit}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {dailyCount.remaining} questions remaining today
              </p>
              {!dailyCount.canAddMore && (
                <p className="text-xs text-primary-600 dark:text-red-400 font-semibold mt-1">
                  ⚠️ Daily limit reached
                </p>
              )}
            </div>
          </div>

          {/* Monthly Question Count */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700 mb-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Monthly Progress: {questionCount.currentCount}/{questionCount.limit}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {questionCount.remaining} questions remaining this month
              </p>
              {!questionCount.canAddMore && (
                <p className="text-xs text-primary-600 dark:text-red-400 font-semibold mt-1">
                  ⚠️ Monthly limit reached
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Question *
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                rows="4"
                placeholder="Enter your question here..."
                required
              />
            </div>

            {/* Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Answer Options *
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Click on the option letter to mark it as correct
              </p>

              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctAnswer: index })}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${formData.correctAnswer === index
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </button>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Difficulty Level
              </label>
              <div className="flex space-x-2">
                {['easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`px-4 py-2 rounded-lg border ${formData.difficulty === level
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Explanation *
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Provide a clear explanation for the correct answer
              </p>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                rows="4"
                placeholder="Explain why this is the correct answer..."
                required
              />
            </div>

            {/* Guidelines */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
              <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">
                📋 Guidelines
              </h3>
              <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
                <li>• Questions should be clear and unambiguous</li>
                <li>• All options should be plausible</li>
                <li>• Provide detailed explanations</li>
                <li>• Avoid controversial or offensive content</li>
                <li>• Questions will be reviewed before approval</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !questionCount.canAddMore || !dailyCount.canAddMore}
              className={`w-full py-3 px-4 rounded-lg font-semibold ${!questionCount.canAddMore || !dailyCount.canAddMore || submitting
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700'
                }`}
            >
              {!dailyCount.canAddMore
                ? "Daily Limit Reached"
                : !questionCount.canAddMore
                  ? "Monthly Limit Reached"
                  : submitting
                    ? "Submitting..."
                    : "Submit Question"
              }
            </button>
          </form>
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default AddQuestionPage;
