'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import API from '../../../lib/api';
import CustomEditor from '../../CustomEditor';
import Loading from '../../Loading';
import { getCurrentUser } from '../../../utils/authUtils';
import { useSSR } from '../../../hooks/useSSR';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminBlogForm = () => {
  const router = useRouter();
  const { id } = router.query;
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    exam: '',
    tags: '',
    featuredImage: '',
    featuredImageAlt: '',
    metaTitle: '',
    metaDescription: '',
    isFeatured: false,
    isPinned: false,
    status: 'draft'
  });

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = getCurrentUser();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await API.getAdminExams();
      setExams(response.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.getAdminBlog(id);
      const blog = response.blog;
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        exam: blog.exam?._id || '',
        tags: blog.tags?.join(', ') || '',
        featuredImage: blog.featuredImage || '',
        featuredImageAlt: blog.featuredImageAlt || '',
        metaTitle: blog.metaTitle || '',
        metaDescription: (blog.metaDescription || '').substring(0, 160),
        isFeatured: blog.isFeatured || false,
        isPinned: blog.isPinned || false,
        status: blog.status || 'draft'
      });
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('Failed to load blog');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) fetchBlog();
  }, [isEdit, fetchBlog]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const isContentEmpty = (content) => {
    if (!content) return true;
    return content.replace(/<[^>]*>/g, '').trim() === '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, featuredImageFile: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isContentEmpty(formData.content)) {
      setError('Content is required');
      return;
    }
    if (!formData.exam) {
      setError('Please select an exam');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        metaDescription: (formData.metaDescription || '').substring(0, 160)
      };

      if (formData.featuredImageFile) {
        blogData.featuredImageFile = formData.featuredImageFile;
      }

      if (isEdit) {
        await API.updateBlog(id, blogData);
        toast.success('Blog updated successfully');
      } else {
        await API.createBlog(blogData);
        toast.success('Blog created successfully');
      }

      router.push('/admin/blogs');
    } catch (err) {
      console.error('Error saving blog:', err);
      setError(err.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return (title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  if (loading && isEdit) {
    return (<div className="adminContent w-full mx-auto p-4">
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading blog..." />
            </div>
          </div>
    );
  }

  return (<div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => router.push('/admin/blogs')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-none italic">
                  {isEdit ? 'EDIT' : 'CREATE'} <span className="text-indigo-600">BLOG</span>
                </h1>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                  {isEdit ? 'Update your blog post' : 'Write and publish a new blog post'}
                </p>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blog Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Blog Details</h2>
              <div className="grid grid-cols-1 gap-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter blog title" />
                  {formData.title && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>URL Slug:</strong> <code className="text-blue-600 dark:text-blue-400">/blog/{generateSlug(formData.title)}</code>
                      </p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Content *</label>
                  <CustomEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your blog content here..."
                    minHeight="200px"
                    toolbarButtons="all"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Excerpt</label>
                  <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of the blog" />
                </div>

                {/* Exam Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Exam *</label>
                    <select name="exam" value={formData.exam} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                      <option value="">Select an exam</option>
                      {exams.map(exam => (
                        <option key={exam._id} value={exam._id}>{exam.name} ({exam.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Tags</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Tags separated by commas" />
                  </div>
                </div>
              </div>
            </div>

            {/* Media & SEO */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Media & SEO</h2>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Featured Image</label>
                  <input type="file" accept="image/*" onChange={handleFileChange}
                    className="w-full text-sm text-gray-900 dark:text-gray-200" />
                  <p className="text-xs text-gray-500 mt-1">Optional: You can also paste a hosted image URL below.</p>
                  <input type="url" name="featuredImage" value={formData.featuredImage} onChange={handleChange}
                    className="mt-2 w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/image.jpg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Image Alt Text</label>
                  <input type="text" name="featuredImageAlt" value={formData.featuredImageAlt} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the image for accessibility" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Meta Title</label>
                  <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} maxLength={60}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="SEO title (max 60 characters)" />
                  <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Meta Description</label>
                  <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} maxLength={160} rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="SEO description (max 160 characters)" />
                  <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Featured Blog</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="isPinned" checked={formData.isPinned} onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Pinned Blog</label>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => router.push('/admin/blogs')}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                Cancel
              </button>
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : isEdit ? 'Update Blog' : 'Create Blog'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AdminBlogForm;
