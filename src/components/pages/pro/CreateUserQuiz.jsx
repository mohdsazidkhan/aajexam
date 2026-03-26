'use client';

import React, { useState, useEffect } from 'react';
import UnifiedFooter from '../../UnifiedFooter';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { getCurrentUser } from '../../../lib/utils/authUtils';
import { toast } from 'react-toastify';

const CreateUserQuiz = () => {
	const router = useRouter();
	const user = getCurrentUser();

	// Form states
	const [step, setStep] = useState(1); // 1: Categories, 2: Quiz Details, 3: Questions
	const [loading, setLoading] = useState(false);

	// Stats
	const [monthlyStats, setMonthlyStats] = useState(null);
	const [creationStats, setCreationStats] = useState(null);

	// Category/Subcategory
	const [showCategoryForm, setShowCategoryForm] = useState(false);
	const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [newCategoryDesc, setNewCategoryDesc] = useState('');
	const [newSubcategoryName, setNewSubcategoryName] = useState('');
	const [newSubcategoryDesc, setNewSubcategoryDesc] = useState('');
	const [categories, setCategories] = useState([]);
	const [subcategories, setSubcategories] = useState([]);

	// Quiz data
	const [quizData, setQuizData] = useState({
		title: '',
		description: '',
		categoryId: '',
		subcategoryId: '',
		difficulty: 'beginner',
		requiredLevel: 1,
		timeLimit: 3, // minutes
		questions: [
			{ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 30 }
		]
	});

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const [monthly, creation] = await Promise.all([
				API.getMonthlyQuizCount(),
				API.getQuizCreationStats()
			]);
			if (monthly?.success) setMonthlyStats(monthly.data);
			if (creation?.success) setCreationStats(creation.data);
		} catch (err) {
			console.error('Error fetching stats:', err);
		}
	};

	const fetchCategories = async () => {
		try {
			const response = await API.getApprovedCategories();
			if (response?.success) {
				setCategories(response.data.allCategories || []);
			}
		} catch (err) {
			console.error('Error fetching categories:', err);
		}
	};

	const fetchSubcategories = async (categoryId) => {
		if (!categoryId) {
			setSubcategories([]);
			return;
		}
		try {
			const response = await API.getApprovedSubcategories(categoryId);
			if (response?.success) {
				setSubcategories(response.data.allSubcategories || []);
			}
		} catch (err) {
			console.error('Error fetching subcategories:', err);
		}
	};

	useEffect(() => {
		if (step === 1) fetchCategories();
	}, [step]);

	useEffect(() => {
		if (quizData.categoryId) {
			fetchSubcategories(quizData.categoryId);
		}
	}, [quizData.categoryId]);

	const handleCreateCategory = async () => {
		if (!newCategoryName.trim() || newCategoryName.length < 3) {
			toast.error('Category name must be at least 3 characters');
			return;
		}
		setLoading(true);
		try {
			await API.createCategory({ name: newCategoryName, description: newCategoryDesc });
			toast.success('Category submitted for approval');
			setNewCategoryName('');
			setNewCategoryDesc('');
			setShowCategoryForm(false);
			fetchCategories();
		} catch (err) {
			toast.error(err?.message || 'Failed to create category');
		} finally {
			setLoading(false);
		}
	};

	const handleCreateSubcategory = async () => {
		if (!quizData.categoryId) {
			toast.error('Please select a category first');
			return;
		}
		if (!newSubcategoryName.trim() || newSubcategoryName.length < 3) {
			toast.error('Subcategory name must be at least 3 characters');
			return;
		}
		setLoading(true);
		try {
			await API.createSubcategory({
				name: newSubcategoryName,
				description: newSubcategoryDesc,
				categoryId: quizData.categoryId
			});
			toast.success('Subcategory submitted for approval');
			setNewSubcategoryName('');
			setNewSubcategoryDesc('');
			setShowSubcategoryForm(false);
			fetchSubcategories(quizData.categoryId);
		} catch (err) {
			toast.error(err?.message || 'Failed to create subcategory');
		} finally {
			setLoading(false);
		}
	};

	const handleQuestionChange = (index, field, value) => {
		const updated = [...quizData.questions];
		updated[index] = { ...updated[index], [field]: value };
		setQuizData({ ...quizData, questions: updated });
	};

	const handleOptionChange = (qIndex, optIndex, value) => {
		const updated = [...quizData.questions];
		updated[qIndex].options[optIndex] = value;
		setQuizData({ ...quizData, questions: updated });
	};

	const addQuestion = () => {
		if (quizData.questions.length >= 10) {
			toast.error('Maximum 10 questions allowed');
			return;
		}
		setQuizData({
			...quizData,
			questions: [...quizData.questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 30 }]
		});
	};

	const removeQuestion = (index) => {
		if (quizData.questions.length <= 1) {
			toast.error('At least 1 question required');
			return;
		}
		const updated = quizData.questions.filter((_, i) => i !== index);
		setQuizData({ ...quizData, questions: updated });
	};

	const validateStep1 = () => {
		if (!quizData.categoryId) {
			toast.error('Please select a category');
			return false;
		}
		if (!quizData.subcategoryId) {
			toast.error('Please select a subcategory');
			return false;
		}
		return true;
	};

	const validateStep2 = () => {
		if (!quizData.title.trim() || quizData.title.length < 10 || quizData.title.length > 200) {
			toast.error('Quiz title must be 10-200 characters');
			return false;
		}
		if (quizData.description && quizData.description.length > 1000) {
			toast.error('Description cannot exceed 1000 characters');
			return false;
		}
		if (quizData.timeLimit < 2 || quizData.timeLimit > 5) {
			toast.error('Quiz time limit must be 2-5 minutes');
			return false;
		}
		return true;
	};

	const validateStep3 = () => {
		if (quizData.questions.length < 5 || quizData.questions.length > 10) {
			toast.error('Quiz must have 5-10 questions');
			return false;
		}

		for (let i = 0; i < quizData.questions.length; i++) {
			const q = quizData.questions[i];
			if (!q.questionText.trim() || q.questionText.length < 5) {
				toast.error(`Question ${i + 1}: Text is too short (min 5 characters)`);
				return false;
			}
			if (q.options.some(opt => !opt.trim())) {
				toast.error(`Question ${i + 1}: All options must be filled`);
				return false;
			}
			if (q.timeLimit < 15 || q.timeLimit > 60) {
				toast.error(`Question ${i + 1}: Time limit must be 15-60 seconds`);
				return false;
			}
		}
		return true;
	};

	const handleSubmit = async () => {
		if (!validateStep3()) return;

		if (monthlyStats && monthlyStats.currentCount >= monthlyStats.limit) {
			toast.error(`Monthly quiz limit (${monthlyStats.limit}) exceeded`);
			return;
		}

		setLoading(true);
		try {
			await API.createUserQuiz(quizData);
			toast.success('Quiz created successfully! Pending admin approval');
			router.push('/pro/quizzes/mine');
		} catch (err) {
			if (err?.response?.status === 429) {
				toast.error(err.response?.data?.message || 'Monthly quiz limit exceeded');
			} else {
				toast.error(err?.message || 'Failed to create quiz');
			}
		} finally {
			setLoading(false);
		}
	};

	const nextStep = () => {
		if (step === 1 && !validateStep1()) return;
		if (step === 2 && !validateStep2()) return;
		setStep(step + 1);
	};

	const prevStep = () => setStep(step - 1);

	// Allow all authenticated users

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
				<div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10">
					{/* Header */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 lg:p-4 mb-1 lg:mb-6">
						<h1 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2">
							Create Custom Quiz
						</h1>
						<p className="text-sm lg:text-md text-gray-600 dark:text-gray-300">
							Create and share custom quizzes with the community! (Max {monthlyStats?.limit || 30}/month)
						</p>

						{/* Stats */}
						{monthlyStats && (
							<div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
								<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
									<div className="text-sm text-gray-600 dark:text-gray-400">Monthly Usage</div>
									<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
										{monthlyStats.currentCount} / {monthlyStats.limit}
									</div>
									<div className="text-xs text-gray-500 mt-1">Quizzes created this month</div>
								</div>
							</div>
						)}

						{/* Progress Steps */}
						<div className="mt-3 lg:mt-6 flex items-center justify-center">
							{[1, 2, 3].map((s) => (
								<React.Fragment key={s}>
									<div className={`flex items-center justify-center w-6 lg:w-10 h-6 lg:h-10 rounded-full ${step >= s ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
										}`}>
										{s}
									</div>
									{s < 3 && (
										<div className={`w-[45%] h-1 ${step > s ? 'bg-blue-500' : 'bg-gray-300'}`} />
									)}
								</React.Fragment>
							))}
						</div>
						<div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
							<span>Category</span>
							<span>Details</span>
							<span>Questions</span>
						</div>
					</div>

					{/* Step 1: Category & Subcategory */}
					{step === 1 && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 lg:p-6 space-y-6">
							<h2 className="text-md lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white">Select Category & Subcategory</h2>

							{/* Category Selection */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Category *
								</label>
								<select
									value={quizData.categoryId}
									onChange={(e) => setQuizData({ ...quizData, categoryId: e.target.value, subcategoryId: '' })}
									className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								>
									<option value="">-- Select Category --</option>
									{categories.map(cat => (
										<option key={cat._id} value={cat._id}>{cat.name}</option>
									))}
								</select>
								<button
									onClick={() => setShowCategoryForm(!showCategoryForm)}
									className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
								>
									{showCategoryForm ? '- Cancel' : '+ Create New Category'}
								</button>
							</div>

							{/* Create Category Form */}
							{showCategoryForm && (
								<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
									<input
										type="text"
										placeholder="Category Name (3-100 chars)"
										value={newCategoryName}
										onChange={(e) => setNewCategoryName(e.target.value)}
										className="w-full p-3 border rounded-lg"
										maxLength={100}
									/>
									<textarea
										placeholder="Description (optional)"
										value={newCategoryDesc}
										onChange={(e) => setNewCategoryDesc(e.target.value)}
										className="w-full p-3 border rounded-lg"
										rows={2}
									/>
									<button
										onClick={handleCreateCategory}
										disabled={loading}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
									>
										{loading ? 'Creating...' : 'Create Category'}
									</button>
								</div>
							)}

							{/* Subcategory Selection */}
							{quizData.categoryId && (
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Subcategory *
									</label>
									<select
										value={quizData.subcategoryId}
										onChange={(e) => setQuizData({ ...quizData, subcategoryId: e.target.value })}
										className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									>
										<option value="">-- Select Subcategory --</option>
										{subcategories.map(sub => (
											<option key={sub._id} value={sub._id}>{sub.name}</option>
										))}
									</select>
									<button
										onClick={() => setShowSubcategoryForm(!showSubcategoryForm)}
										className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
									>
										{showSubcategoryForm ? '- Cancel' : '+ Create New Subcategory'}
									</button>
								</div>
							)}

							{/* Create Subcategory Form */}
							{showSubcategoryForm && (
								<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-3">
									<input
										type="text"
										placeholder="Subcategory Name (3-100 chars)"
										value={newSubcategoryName}
										onChange={(e) => setNewSubcategoryName(e.target.value)}
										className="w-full p-3 border rounded-lg"
										maxLength={100}
									/>
									<textarea
										placeholder="Description (optional)"
										value={newSubcategoryDesc}
										onChange={(e) => setNewSubcategoryDesc(e.target.value)}
										className="w-full p-3 border rounded-lg"
										rows={2}
									/>
									<button
										onClick={handleCreateSubcategory}
										disabled={loading}
										className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
									>
										{loading ? 'Creating...' : 'Create Subcategory'}
									</button>
								</div>
							)}

							<button
								onClick={nextStep}
								className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
							>
								Next: Quiz Details →
							</button>
						</div>
					)}

					{/* Step 2: Quiz Details */}
					{step === 2 && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 lg:p-6 space-y-6">
							<h2 className="text-md md:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white">Quiz Details</h2>

							{/* Summary from Step 1 */}
							{quizData.categoryId && quizData.subcategoryId && (
								<div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
									<h3 className="text-base md:text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2 md:mb-3">📋 Selected Options</h3>
									<div className="space-y-2 md:space-y-3">
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
											<span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300 sm:w-24">Category:</span>
											<span className="text-xs sm:text-lg text-blue-600 dark:text-blue-400 font-medium break-words sm:break-normal">
												{categories.find(c => c._id === quizData.categoryId)?.name || 'Unknown'}
											</span>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
											<span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300 sm:w-24">Subcategory:</span>
											<span className="text-xs sm:text-lg text-blue-600 dark:text-blue-400 font-medium break-words sm:break-normal">
												{subcategories.find(s => s._id === quizData.subcategoryId)?.name || 'Unknown'}
											</span>
										</div>
									</div>
								</div>
							)}

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Quiz Title * (10-200 characters)
								</label>
								<input
									type="text"
									value={quizData.title}
									onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
									className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									placeholder="e.g., JavaScript Advanced Concepts"
									maxLength={200}
								/>
								<div className="text-xs text-gray-500 mt-1">{quizData.title.length} / 200</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Description (max 1000 characters)
								</label>
								<textarea
									value={quizData.description}
									onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
									className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									rows={4}
									placeholder="Describe your quiz..."
									maxLength={1000}
								/>
								<div className="text-xs text-gray-500 mt-1">{quizData.description.length} / 1000</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Difficulty *
									</label>
									<select
										value={quizData.difficulty}
										onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
										className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									>
										<option value="beginner">Beginner</option>
										<option value="intermediate">Intermediate</option>
										<option value="advanced">Advanced</option>
										<option value="expert">Expert</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Required Level * (1-10)
									</label>
									<input
										type="number"
										value={quizData.requiredLevel}
										onChange={(e) => setQuizData({ ...quizData, requiredLevel: parseInt(e.target.value) || 1 })}
										className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										min={1}
										max={10}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Time Limit * (2-5 mins)
									</label>
									<input
										type="number"
										value={quizData.timeLimit}
										onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 3 })}
										className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										min={2}
										max={5}
									/>
								</div>
							</div>

							<div className="flex gap-4">
								<button
									onClick={prevStep}
									className="flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
								>
									← Back
								</button>
								<button
									onClick={nextStep}
									className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
								>
									Add Questions →
								</button>
							</div>
						</div>
					)}

					{/* Step 3: Questions */}
					{step === 3 && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 lg:p-6 space-y-6">
							<div className="flex justify-between items-center">
								<h2 className="text-md lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white">
									Add Questions ({quizData.questions.length}/10)
								</h2>
							</div>

							<div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
								📝 Minimum 5 questions, Maximum 10 questions required
							</div>

							{/* Summary of Step 1 & 2 */}
							<div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-3 md:p-4">
								<h3 className="text-base md:text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2 md:mb-3">📋 Quiz Summary</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
									<div className="space-y-2 md:space-y-3">
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
											<span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300 sm:w-28">Category:</span>
											<span className="text-xs sm:text-lg text-orange-700 dark:text-yellow-400 break-words sm:break-normal">
												{categories.find(c => c._id === quizData.categoryId)?.name || 'Unknown'}
											</span>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
											<span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300 sm:w-28">Subcategory:</span>
											<span className="text-xs sm:text-lg text-orange-700 dark:text-yellow-400 break-words sm:break-normal">
												{subcategories.find(s => s._id === quizData.subcategoryId)?.name || 'Unknown'}
											</span>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
											<span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300 sm:w-28">Title:</span>
											<span className="text-xs sm:text-lg text-orange-700 dark:text-yellow-400 break-words sm:break-normal sm:truncate">
												{quizData.title || 'Not set'}
											</span>
										</div>
									</div>
									<div className="space-y-2 md:space-y-3">
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
											<span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300 sm:w-28">Difficulty:</span>
											<span className="text-xs sm:text-lg text-orange-700 dark:text-yellow-400 capitalize">
												{quizData.difficulty}
											</span>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
											<span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300 sm:w-28">Required Level:</span>
											<span className="text-xs sm:text-lg text-orange-700 dark:text-yellow-400">
												{quizData.requiredLevel}
											</span>
										</div>
										<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
											<span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300 sm:w-28">Time Limit:</span>
											<span className="text-xs sm:text-lg text-orange-700 dark:text-yellow-400">
												{quizData.timeLimit} mins
											</span>
										</div>
									</div>
								</div>
							</div>

							{quizData.questions.map((question, qIndex) => (
								<div key={qIndex} className="p-2 lg:p-4 xl:p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg space-y-4">
									<div className="flex justify-between items-center">
										<h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
											Question {qIndex + 1}
										</h3>
										{quizData.questions.length > 1 && (
											<button
												onClick={() => removeQuestion(qIndex)}
												className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
											>
												Remove
											</button>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Question Text * (min 5 chars)
										</label>
										<textarea
											value={question.questionText}
											onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
											className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
											rows={3}
											placeholder="Enter your question..."
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{question.options.map((opt, optIndex) => (
											<div key={optIndex}>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													Option {optIndex + 1} *
													{question.correctAnswerIndex === optIndex && (
														<span className="ml-2 text-green-600 dark:text-green-400">✓ Correct</span>
													)}
												</label>
												<input
													type="text"
													value={opt}
													onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
													className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
													placeholder={`Option ${optIndex + 1}`}
												/>
											</div>
										))}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Correct Answer *
											</label>
											<select
												value={question.correctAnswerIndex}
												onChange={(e) => handleQuestionChange(qIndex, 'correctAnswerIndex', parseInt(e.target.value))}
												className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
											>
												<option value={0}>Option 1</option>
												<option value={1}>Option 2</option>
												<option value={2}>Option 3</option>
												<option value={3}>Option 4</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Time Limit (15-60 sec) *
											</label>
											<input
												type="number"
												value={question.timeLimit}
												onChange={(e) => handleQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value) || 30)}
												className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
												min={15}
												max={60}
											/>
										</div>
									</div>
								</div>
							))}

							{/* Add Question Button */}
							<div className="flex justify-center">
								<button
									onClick={addQuestion}
									disabled={quizData.questions.length >= 10}
									className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-md lg:text-lg xl:text-xl"
								>
									+ Add Question ({quizData.questions.length}/10)
								</button>
							</div>

							<div className="flex gap-4">
								<button
									onClick={prevStep}
									className="flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
								>
									← Back
								</button>
								<button
									onClick={handleSubmit}
									disabled={loading || quizData.questions.length < 5}
									className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
								>
									{loading ? 'Creating Quiz...' : '✓ Create Quiz'}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			<UnifiedFooter />
		</>
	);
};

export default CreateUserQuiz;






