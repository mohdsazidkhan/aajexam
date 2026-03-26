'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router'; // Pages Router
import Link from 'next/link';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Sidebar from '../../Sidebar';
import CustomEditor from '../../CustomEditor';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSelector } from 'react-redux';
import { safeLocalStorage } from '../../../lib/utils/storage';

const AdminArticleForm = () => {
  const router = useRouter();
  const { id } = router.query;
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: '',
    featuredImageAlt: '',
    metaTitle: '',
    metaDescription: '',
    isFeatured: false,
    isPinned: false,
    status: 'draft',
    rewardTier: ''
  });

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const user = (() => {
    const raw = safeLocalStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
  })();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const generateSlug = (title) => {
    return (title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  useEffect(() => {
    fetchCategories();
  }, []);



  const fetchCategories = async () => {
    try {
      // Fetch all categories without pagination limit
      const response = await API.getAdminCategories({ limit: 100, page: 1 });
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback: try without params
      try {
        const fallbackResponse = await API.getAdminCategories();
        setCategories(fallbackResponse.categories || []);
      } catch (fallbackErr) {
        console.error('Error fetching categories (fallback):', fallbackErr);
        setCategories([]);
      }
    }
  };



  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.getAdminArticle(id);
      const article = response.article;

      // Truncate metaDescription to 160 characters if it exceeds the limit
      const metaDescription = article.metaDescription || '';
      const truncatedMetaDescription = metaDescription.length > 160
        ? metaDescription.substring(0, 160).trim()
        : metaDescription;

      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category?._id || '',
        tags: article.tags?.join(', ') || '',
        featuredImage: article.featuredImage || '',
        featuredImageAlt: article.featuredImageAlt || '',
        metaTitle: article.metaTitle || '',
        metaDescription: truncatedMetaDescription,
        isFeatured: article.isFeatured || false,
        isPinned: article.isPinned || false,
        status: article.status || 'draft',
        rewardTier: article.rewardTier || ''
      });
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchArticle();
    }
  }, [isEdit, fetchArticle]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  // Helper function to check if content is empty (only whitespace or empty tags)
  const isContentEmpty = (content) => {
    if (!content) return true;
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      featuredImageFile: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate content
    if (isContentEmpty(formData.content)) {
      setError('Content is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Truncate metaDescription to 160 characters if it exceeds the limit
      const truncatedMetaDescription = formData.metaDescription
        ? formData.metaDescription.substring(0, 160).trim()
        : '';

      const articleData = {
        ...formData,
        slug: generateSlug(formData.title),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        metaDescription: truncatedMetaDescription,
        // Only include rewardTier if status is approved
        rewardTier: formData.status === 'approved' ? formData.rewardTier : undefined
      };

      // Validate reward tier when approving
      if (formData.status === 'approved' && !formData.rewardTier) {
        setError('Please select a reward tier before approving the blog.');
        setLoading(false);
        return;
      }
      // Keep file separate from URL field to avoid conflicts
      if (formData.featuredImageFile) {
        articleData.featuredImageFile = formData.featuredImageFile;
      }

      if (isEdit) {
        await API.updateArticle(id, articleData);
      } else {
        await API.createArticle(articleData);
      }

      router.push('/admin/articles');
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.message || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <AdminMobileAppWrapper title={isEdit ? "Edit Article" : "Create Article"}>
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && <Sidebar />}
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-3">
                <Loading size="md" color="yellow" message="Loading article..." />
              </div>
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title={isEdit ? "Edit Article" : "Create Article"}>
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? '✏️ Edit Article' : '📝 Create New Article'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEdit ? 'Update your article content and settings' : 'Write and publish a new article'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Article Details
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter article title"
                  />
                  {formData.title && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>URL Slug:</strong> <code className="text-secondary-600 dark:text-secondary-400">
                          /articles/{formData.title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-')
                            .trim('-')}
                        </code>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        This will be the article's URL. If a similar title exists, a number will be added to make it unique.
                      </p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <CustomEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your article content here..."
                    minHeight="200px"
                    toolbarButtons="all"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of the article"
                  />
                </div>

                {/* Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter tags separated by commas"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Separate multiple tags with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Media and SEO */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Media & SEO
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {/* Featured Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-900 dark:text-gray-200"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional: You can still paste a hosted image URL below.</p>
                  <input
                    type="url"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleChange}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Featured Image Alt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image Alt Text
                  </label>
                  <input
                    type="text"
                    name="featuredImageAlt"
                    value={formData.featuredImageAlt}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="SEO title (max 60 characters)"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="SEO description (max 160 characters)"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Article Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Featured Article
                  </label>
                </div>

                {/* Pinned */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPinned"
                    checked={formData.isPinned}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Pinned Article
                  </label>
                </div>
              </div>

              {/* Blog Reward Tier - Only show for pending/approved status */}
              {(formData.status === 'pending' || formData.status === 'approved') && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blog Reward Tier {formData.status === 'approved' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.rewardTier === 'normal'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}>
                      <input
                        type="radio"
                        name="rewardTier"
                        value="normal"
                        checked={formData.rewardTier === 'normal'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Normal Blog</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹5</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Standard quality blog post</p>
                    </label>

                    <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.rewardTier === 'good'
                      ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}>
                      <input
                        type="radio"
                        name="rewardTier"
                        value="good"
                        checked={formData.rewardTier === 'good'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Good Blog</span>
                        <span className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">₹10</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Well-written and informative</p>
                    </label>

                    <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.rewardTier === 'high'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}>
                      <input
                        type="radio"
                        name="rewardTier"
                        value="high"
                        checked={formData.rewardTier === 'high'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">High Quality</span>
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">₹15</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Exceptional quality content</p>
                    </label>
                  </div>
                  {formData.status === 'approved' && !formData.rewardTier && (
                    <p className="mt-2 text-sm text-primary-600 dark:text-red-400">
                      ⚠️ Please select a reward tier before approving. Wallet will be credited automatically.
                    </p>
                  )}
                  {formData.status === 'approved' && formData.rewardTier && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ When you save with status "Approved", ₹{formData.rewardTier === 'normal' ? '5' : formData.rewardTier === 'good' ? '10' : '15'} will be automatically credited to the author's wallet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="text-red-800 dark:text-red-200">{error}</div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/articles')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="admin"
                loading={loading}
              >
                {isEdit ? 'Update Article' : 'Create Article'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminArticleForm;




