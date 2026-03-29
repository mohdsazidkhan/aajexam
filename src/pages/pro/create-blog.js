'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import API from '../../lib/api';
// MobileAppWrapper import removed
import UnifiedFooter from '../../components/UnifiedFooter';
import CustomEditor from '../../components/CustomEditor';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaImage, FaTimes, FaUpload } from 'react-icons/fa';
import { getCurrentUser } from '../../lib/utils/authUtils';

const CreateBlogPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImageFile: null,
    featuredImage: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [user, setUser] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [blogId, setBlogId] = useState(null);
  const [blogCount, setBlogCount] = useState({
    currentCount: 0,
    limit: 10,
    remaining: 10,
    canAddMore: true
  });
  const [loadingBlog, setLoadingBlog] = useState(false);

  const fetchCurrentMonthBlogCount = async () => {
    try {
      const response = await API.getCurrentMonthBlogCount();
      if (response.success && response.data) {
        setBlogCount(response.data);
      }
    } catch (error) {
      console.error('Error fetching current month blog count:', error);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    fetchCategories();

    // Fetch monthly blog count (only for new blogs, not edit mode)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');

      if (!editId) {
        fetchCurrentMonthBlogCount();
      }
      if (editId) {
        setIsEditMode(true);
        setBlogId(editId);
        fetchBlogForEdit(editId);
      }
    }
  }, [router]);

  const fetchBlogForEdit = async (id) => {
    try {
      setLoadingBlog(true);
      const response = await API.getMyBlog(id);
      if (response?.success && response.data) {
        const blog = response.data;
        // Check if blog is pending (only pending blogs can be edited)
        if (blog.status !== 'pending') {
          toast.error('You can only edit blogs that are pending review');
          router.push('/pro/my-blogs');
          return;
        }

        setFormData({
          title: blog.title || '',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          category: blog.category?._id || blog.category || '',
          tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
          featuredImageFile: null,
          featuredImage: blog.featuredImage || '',
          metaTitle: blog.metaTitle || '',
          metaDescription: blog.metaDescription || ''
        });

        if (blog.featuredImage) {
          setPreviewImage(blog.featuredImage);
        }
      }
    } catch (error) {
      console.error('Error fetching blog for edit:', error);
      toast.error('Failed to load blog for editing');
      router.push('/pro/my-blogs');
    } finally {
      setLoadingBlog(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Use public categories API (same categories as admin, but accessible to all users)
      const response = await API.getPublicCategories();

      // Handle different response formats
      if (response.success && response.data) {
        // Format: { success: true, data: [...] }
        setCategories(Array.isArray(response.data) ? response.data : []);
      } else if (response.categories) {
        // Format: { categories: [...] }
        setCategories(Array.isArray(response.categories) ? response.categories : []);
      } else if (Array.isArray(response)) {
        // Format: [...] (direct array)
        setCategories(response);
      } else {
        console.warn('Unexpected categories response format:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to student categories API
      try {
        const fallbackResponse = await API.getCategories();
        if (Array.isArray(fallbackResponse)) {
          setCategories(fallbackResponse);
        } else {
          setCategories([]);
        }
      } catch (fallbackError) {
        console.error('Error fetching categories (fallback):', fallbackError);
        toast.error('Failed to load categories');
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to strip HTML tags from text
  const stripHtml = (html) => {
    if (!html) return '';
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');
    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    // Replace multiple spaces/newlines with single space
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Strip HTML from excerpt field
    if (name === 'excerpt') {
      const cleanValue = stripHtml(value);
      setFormData({ ...formData, [name]: cleanValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setFormData({ ...formData, featuredImageFile: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setFormData({ ...formData, featuredImageFile: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = () => {
    setFormData({ ...formData, featuredImageFile: null, featuredImage: '' });
    setPreviewImage(null);
  };

  // Helper function to check if content is empty (only whitespace or empty tags)
  const isContentEmpty = (content) => {
    if (!content) return true;
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  const validateForm = () => {
    // Check monthly blog limit (only for new blogs, not edit mode)
    if (!isEditMode && !blogCount.canAddMore) {
      toast.error(`You have reached the monthly limit of ${blogCount.limit} blogs. You can add more blogs next month.`, { autoClose: 5000 });
      return false;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a blog title');
      return false;
    }

    if (isContentEmpty(formData.content)) {
      toast.error('Please enter blog content');
      return false;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }

    // Validate metaTitle length (max 60 chars)
    if (formData.metaTitle && formData.metaTitle.length > 60) {
      toast.error('Meta Title must be 60 characters or less');
      return false;
    }

    // Validate metaDescription length (max 160 chars)
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      toast.error('Meta Description must be 160 characters or less');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Parse tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Strip HTML from excerpt before sending
      const cleanExcerpt = formData.excerpt ? stripHtml(formData.excerpt.trim()) : '';

      // Validate category is selected
      if (!formData.category || formData.category.trim() === '') {
        toast.error('Please select a category');
        setSubmitting(false);
        return;
      }

      // Validate content is not empty after stripping HTML
      const contentText = formData.content ? formData.content.replace(/<[^>]*>/g, '').trim() : '';
      if (!contentText || contentText.length === 0) {
        toast.error('Please enter blog content');
        setSubmitting(false);
        return;
      }

      const blogData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: cleanExcerpt || undefined,
        category: formData.category.trim(),
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        featuredImageFile: formData.featuredImageFile || undefined,
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined
      };

      // Log blog data for debugging (without sensitive info)
      console.log('Submitting blog with data:', {
        title: blogData.title,
        category: blogData.category,
        hasContent: !!blogData.content,
        contentLength: blogData.content?.length,
        hasExcerpt: !!blogData.excerpt,
        tagsCount: blogData.tags?.length || 0,
        hasImage: !!blogData.featuredImageFile
      });

      let response;
      if (isEditMode && blogId) {
        // Update existing blog
        response = await API.updateBlog(blogId, blogData);
        if (response.success) {
          toast.success('Blog updated successfully! It will be reviewed by admin.');
          router.push('/pro/my-blogs');
        } else {
          toast.error(response.message || 'Failed to update blog');
        }
      } else {
        // Create new blog
        response = await API.createBlog(blogData);
        if (response.success) {
          toast.success('Blog submitted successfully! It will be reviewed by admin.');
          // Refresh blog count after successful submission
          fetchCurrentMonthBlogCount();
          router.push('/pro/my-blogs');
        } else {
          toast.error(response.message || 'Failed to submit blog');
        }
      }
    } catch (error) {
      console.error('Error submitting blog:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data
      });
      const errorData = error?.response?.data;
      const errorResponse = error?.response;

      // Handle validation errors from backend
      if (errorData?.error) {
        // Check for validation errors
        if (errorData.error.includes('metaTitle') && errorData.error.includes('longer than')) {
          toast.error('Meta Title must be 60 characters or less');
        } else if (errorData.error.includes('metaDescription') && errorData.error.includes('longer than')) {
          toast.error('Meta Description must be 160 characters or less');
        } else if (errorData.error.includes('validation failed')) {
          // Extract field name from validation error
          const fieldMatch = errorData.error.match(/`(\w+)`/);
          const fieldName = fieldMatch ? fieldMatch[1] : 'field';
          toast.error(`Validation error: ${errorData.error}`);
        } else {
          toast.error(errorData.error || errorData.message || 'Validation error occurred');
        }
        return;
      }

      // Handle 400 Bad Request (validation errors)
      if (errorResponse?.status === 400) {
        const errorMsg = errorData?.message || errorData?.error || 'Please check all required fields';
        toast.error(errorMsg);
        return;
      }

      // Handle 403 Forbidden
      if (errorResponse?.status === 403) {
        if (errorData?.error === 'NO_PRO_SUBSCRIPTION' ||
          errorData?.error === 'SUBSCRIPTION_EXPIRED' ||
          errorData?.error === 'SUBSCRIPTION_NOT_ACTIVE' ||
          errorData?.error === 'NOT_PRO_99_PLAN' ||
          errorData?.error === 'NO_ACTIVE_PRO_99_SUBSCRIPTION') {
          const errorMsg = errorData?.message || 'Something went wrong with your request. Please try again.';
          toast.error(errorMsg, { autoClose: 5000 });
        } else if (errorData?.message?.includes('pending')) {
          // Blog is not pending, can't edit
          toast.error(errorData.message || 'You can only edit blogs that are pending review');
          router.push('/pro/my-blogs');
        } else if (errorData?.message?.includes('monthly limit') || errorData?.message?.includes('monthly')) {
          toast.error(errorData.message || 'You have reached the monthly limit of 10 blogs', { autoClose: 5000 });
        } else {
          // Show the actual error message from backend
          const errorMsg = errorData?.message || errorData?.error || 'Access denied. Please check your subscription status.';
          toast.error(errorMsg, { autoClose: 5000 });
          console.error('403 Error details:', errorData);
        }
        return;
      }

      // Handle 500 Server Error
      if (errorResponse?.status === 500) {
        toast.error(errorData?.message || errorData?.error || 'Server error. Please try again later.');
        return;
      }

      // Handle network errors
      if (!errorResponse) {
        toast.error('Network error. Please check your internet connection and try again.');
        return;
      }

      // Show backend error message if available
      const errorMessage = errorData?.message || errorData?.error || error?.message || (isEditMode ? 'Failed to update blog' : 'Failed to submit blog');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };



  // Show loading while fetching blog for edit
  if (loadingBlog) {
    return (
      <>
        <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark py-4 lg:py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400">Loading blog...</div>
          </div>
        </div>
        <UnifiedFooter />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{isEditMode ? 'Edit Blog' : 'Create Blog'} - AajExam</title>
      </Head>
      <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark py-4 lg:py-8 px-4">
        <div className="container mx-auto py-0 px-0 lg:px-10">
          {/* Header */}
          <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl xl:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? '✏️ Edit Blog' : '✍️ Create New Blog'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isEditMode
                  ? 'Update your blog content and resubmit for review'
                  : 'Share your knowledge with the community'}
              </p>
            </div>
          </div>

          {/* Monthly Blog Limit Info (only for new blogs) */}
          {!isEditMode && (
            <div className={`mb-4 lg:mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border ${!blogCount.canAddMore
              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
              : 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${!blogCount.canAddMore
                    ? 'text-red-800 dark:text-red-300'
                    : 'text-primary-800 dark:text-primary-300'
                    }`}>
                    Monthly Blog Limit
                  </p>
                  <p className={`text-xs mt-1 ${!blogCount.canAddMore
                    ? 'text-primary-600 dark:text-red-400'
                    : 'text-primary-700 dark:text-primary-400'
                    }`}>
                    {blogCount.currentCount} / {blogCount.limit} blogs this month
                    {blogCount.canAddMore && ` (${blogCount.remaining} remaining)`}
                  </p>
                </div>
                {!blogCount.canAddMore && (
                  <span className="text-primary-600 dark:text-red-400 font-semibold text-sm">
                    Limit Reached
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 mb-10 lg:mb-2">
            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <FaImage className="inline mr-2 text-primary-500" />
                Featured Image <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              {previewImage ? (
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                      title="Remove Image"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-3 w-full py-2 px-4 bg-red-50 dark:bg-red-900/20 text-primary-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    Remove Image
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-300 ${isDragging
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600 bg-gray-50 dark:bg-gray-900/50'
                    }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="featured-image-input"
                  />
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4 shadow-lg">
                      <FaUpload className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isDragging ? 'Drop your image here' : 'Upload Featured Image'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Drag and drop an image, or click to browse
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Recommended: 1200x630px • Max size: 5MB • JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter blog title..."
              />
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              {loading ? (
                <div className="text-gray-500">Loading categories...</div>
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <CustomEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your blog content here..."
                minHeight="400px"
                toolbarButtons="all"
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt (Optional)
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Brief summary of your blog..."
              />
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter tags separated by commas (e.g., education, learning, tips)"
              />
            </div>

            {/* Meta Title */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Title (Optional)
                <span className="text-xs text-gray-500 ml-2">
                  {formData.metaTitle.length}/60 characters
                </span>
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                maxLength={60}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${formData.metaTitle.length > 60
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                  }`}
                placeholder="SEO meta title (auto-generated from title if not provided)"
              />
              {formData.metaTitle.length > 60 && (
                <p className="text-red-500 text-xs mt-1">Meta Title must be 60 characters or less</p>
              )}
            </div>

            {/* Meta Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description (Optional)
                <span className="text-xs text-gray-500 ml-2">
                  {formData.metaDescription.length}/160 characters
                </span>
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                maxLength={160}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${formData.metaDescription.length > 160
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                  }`}
                placeholder="SEO meta description (auto-generated from content if not provided)"
              />
              {formData.metaDescription.length > 160 && (
                <p className="text-red-500 text-xs mt-1">Meta Description must be 160 characters or less</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (!isEditMode && !blogCount.canAddMore)}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isEditMode && !blogCount.canAddMore
                  ? 'Monthly Limit Reached'
                  : submitting
                    ? (isEditMode ? 'Updating...' : 'Submitting...')
                    : (isEditMode ? 'Update Blog' : 'Submit Blog')}
              </button>
            </div>
          </form>
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default CreateBlogPage;

