'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import API from '../../lib/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { isAuthenticated } from '../../lib/utils/authUtils';
import {
  ArrowLeft,
  Send,
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  CheckCircle
} from 'lucide-react';

const AskQuestionPage = () => {
  const router = useRouter();
  const authenticated = isAuthenticated();

  const [exams, setExams] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    question: '',
    exam: '',
    explanation: '',
    image: null,
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });

  useEffect(() => {
    if (!authenticated) {
      router.push('/login');
      return;
    }
    fetchExams();
  }, [authenticated]);

  const fetchExams = async () => {
    try {
      const examRes = await API.getPublicExams({ limit: 500 });
      setExams(examRes.data?.exams || examRes.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleOptionChange = (index, field, value) => {
    setForm(prev => {
      const options = [...prev.options];
      options[index] = { ...options[index], [field]: value };
      // If marking as correct, unmark others
      if (field === 'isCorrect' && value) {
        options.forEach((opt, i) => {
          if (i !== index) opt.isCorrect = false;
        });
      }
      return { ...prev, options };
    });
  };

  const addOption = () => {
    if (form.options.length >= 6) return;
    setForm(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) return;
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'community-questions');

      const res = await API.request('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.success && res.url) {
        setForm(prev => ({ ...prev, image: res.url }));
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.question.trim()) {
      setError('Please enter your question');
      return;
    }
    if (!form.exam) {
      setError('Please select an exam');
      return;
    }

    // Filter out empty options
    const validOptions = form.options.filter(opt => opt.text.trim());

    try {
      setSubmitting(true);
      const res = await API.createCommunityQuestion({
        question: form.question.trim(),
        exam: form.exam,
        explanation: form.explanation.trim(),
        image: form.image,
        options: validOptions.length > 0 ? validOptions : []
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/community-questions');
        }, 1500);
      }
    } catch (err) {
      console.error('Error posting question:', err);
      setError(err.message || 'Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full" radius="2xl">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-content-primary uppercase mb-2">Question Posted!</h2>
          <p className="text-sm text-content-muted">Redirecting to community questions...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/community-questions">
            <button className="p-2 rounded-xl border-2 border-border-primary text-content-muted hover:border-primary-500 hover:text-primary-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-content-primary uppercase tracking-tight">
              Post a Question
            </h1>
            <p className="text-xs text-content-muted mt-0.5">Share with the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Exam Selection */}
          <Card className="mb-4" radius="2xl">
            <h3 className="text-xs font-black text-content-muted uppercase tracking-wider mb-3">Select Exam</h3>
            <select
              value={form.exam}
              onChange={(e) => handleChange('exam', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border-primary bg-background-surface text-sm font-semibold text-content-primary focus:outline-none focus:border-primary-500 transition-colors"
              required
            >
              <option value="">Select Exam</option>
              {exams.map(exam => (
                <option key={exam._id} value={exam._id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </Card>

          {/* Question */}
          <Card className="mb-4" radius="2xl">
            <h3 className="text-xs font-black text-content-muted uppercase tracking-wider mb-3">Your Question</h3>
            <textarea
              value={form.question}
              onChange={(e) => handleChange('question', e.target.value)}
              placeholder="Type your question here..."
              rows={4}
              maxLength={2000}
              required
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border-primary bg-background-surface text-sm font-semibold text-content-primary placeholder:text-content-muted focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
            <p className="text-[10px] text-content-muted text-right mt-1">
              {form.question.length}/2000
            </p>

            {/* Image Upload */}
            <div className="mt-3">
              {form.image ? (
                <div className="relative inline-block">
                  <img src={form.image} alt="Uploaded" className="max-h-40 rounded-xl border-2 border-border-primary" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, image: null }))}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-border-primary text-content-muted text-xs font-bold cursor-pointer hover:border-primary-500 hover:text-primary-500 transition-colors">
                  <ImageIcon className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Add Image (optional)'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </Card>

          {/* Options (MCQ) */}
          <Card className="mb-4" radius="2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-content-muted uppercase tracking-wider">Options (Optional)</h3>
              {form.options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-black text-content-muted w-5">{String.fromCharCode(65 + i)}.</span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(i, 'text', e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-border-primary bg-background-surface text-sm font-semibold text-content-primary placeholder:text-content-muted focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleOptionChange(i, 'isCorrect', !opt.isCorrect)}
                    className={`p-2 rounded-xl border-2 text-xs font-bold transition-colors ${
                      opt.isCorrect
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                        : 'border-border-primary text-content-muted hover:border-emerald-400'
                    }`}
                    title="Mark as correct answer"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  {form.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="p-2 rounded-xl border-2 border-border-primary text-content-muted hover:border-rose-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Explanation */}
          <Card className="mb-6" radius="2xl">
            <h3 className="text-xs font-black text-content-muted uppercase tracking-wider mb-3">Explanation (Optional)</h3>
            <textarea
              value={form.explanation}
              onChange={(e) => handleChange('explanation', e.target.value)}
              placeholder="Add an explanation for the answer..."
              rows={3}
              maxLength={3000}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border-primary bg-background-surface text-sm font-semibold text-content-primary placeholder:text-content-muted focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </Card>

          {/* Submit */}
          <Button
            variant="primary"
            size="md"
            fullWidth
            icon={Send}
            disabled={submitting || !form.question.trim() || !form.exam}
            onClick={handleSubmit}
          >
            {submitting ? 'Posting...' : 'Post Question'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AskQuestionPage;
