'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

import API from '../../../lib/api';
import Sidebar from '../../Sidebar';
import { AdminFormSkeleton } from '../../admin/Skeletons';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const EMPTY_FEATURE = { title: '', description: '', icon: '' };
const EMPTY_STORY = { studentName: '', achievement: '', testimonial: '' };

const inputClass = "w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 dark:bg-black dark:text-white";
const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase";

export default function HomepageContentPage() {
  const [formData, setFormData] = useState({
    platformPurpose: '',
    targetAudience: '',
    educationalBenefits: '',
    learningMethodology: '',
    keyFeatures: [],
    successStories: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.request('/api/public/homepage-content');
        if (res?.success && res.data) {
          const d = res.data;
          setFormData({
            platformPurpose: d.platformPurpose || '',
            targetAudience: d.targetAudience || '',
            educationalBenefits: d.educationalBenefits || '',
            learningMethodology: d.learningMethodology || '',
            keyFeatures: d.keyFeatures || [],
            successStories: d.successStories || []
          });
        }
      } catch (e) {
        // ignore — form just starts empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateListItem = (listKey, idx, field, value) => {
    setFormData((prev) => {
      const list = [...prev[listKey]];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [listKey]: list };
    });
  };

  const addListItem = (listKey, empty) => {
    setFormData((prev) => ({ ...prev, [listKey]: [...prev[listKey], { ...empty }] }));
  };

  const removeListItem = (listKey, idx) => {
    setFormData((prev) => ({ ...prev, [listKey]: prev[listKey].filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.request('/api/admin/homepage-content', { method: 'POST', body: JSON.stringify(formData) });
      if (res?.success) {
        toast.success('Homepage content published');
      } else {
        toast.error(res?.message || 'Failed to save');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  useAdminMobileHeader({ title: 'Homepage Content' });

  if (loading) {
    return (
      <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
        <Sidebar />
        <div className="adminContent w-full mx-auto">
          <div className="flex items-center justify-center h-64">
            <AdminFormSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">Homepage / About Content</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publishing here saves a new active version of the platform's marketing copy (used by the About page's data API).
            Saving does not require existing pages to be rebuilt.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">Platform Copy</h2>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className={labelClass}>Platform Purpose *</label>
                <textarea name="platformPurpose" value={formData.platformPurpose} onChange={handleChange} required maxLength={2000} rows={3}
                  className={inputClass} placeholder="What is AajExam for?" />
              </div>
              <div>
                <label className={labelClass}>Target Audience *</label>
                <textarea name="targetAudience" value={formData.targetAudience} onChange={handleChange} required maxLength={1000} rows={3}
                  className={inputClass} placeholder="Who is this platform for?" />
              </div>
              <div>
                <label className={labelClass}>Educational Benefits *</label>
                <textarea name="educationalBenefits" value={formData.educationalBenefits} onChange={handleChange} required maxLength={2000} rows={3}
                  className={inputClass} placeholder="What does a student gain?" />
              </div>
              <div>
                <label className={labelClass}>Learning Methodology *</label>
                <textarea name="learningMethodology" value={formData.learningMethodology} onChange={handleChange} required maxLength={2000} rows={3}
                  className={inputClass} placeholder="How does the platform teach?" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">Key Features</h2>
              <button type="button" onClick={() => addListItem('keyFeatures', EMPTY_FEATURE)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 rounded-lg text-xs font-bold">
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </button>
            </div>
            <div className="space-y-4">
              {formData.keyFeatures.map((f, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-start border-b border-slate-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                  <input type="text" value={f.title} onChange={(e) => updateListItem('keyFeatures', idx, 'title', e.target.value)} placeholder="Title" required className={inputClass} />
                  <input type="text" value={f.description} onChange={(e) => updateListItem('keyFeatures', idx, 'description', e.target.value)} placeholder="Description" required className={inputClass} />
                  <button type="button" onClick={() => removeListItem('keyFeatures', idx)} className="p-2.5 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all justify-self-start sm:justify-self-auto">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.keyFeatures.length === 0 && <p className="text-xs text-slate-400">No features added yet.</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">Success Stories</h2>
              <button type="button" onClick={() => addListItem('successStories', EMPTY_STORY)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 rounded-lg text-xs font-bold">
                <Plus className="w-3.5 h-3.5" /> Add Story
              </button>
            </div>
            <div className="space-y-4">
              {formData.successStories.map((s, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-3 border-b border-slate-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                    <input type="text" value={s.studentName} onChange={(e) => updateListItem('successStories', idx, 'studentName', e.target.value)} placeholder="Student name" required className={inputClass} />
                    <input type="text" value={s.achievement} onChange={(e) => updateListItem('successStories', idx, 'achievement', e.target.value)} placeholder="Achievement (e.g. SSC CGL 2025)" required className={inputClass} />
                    <button type="button" onClick={() => removeListItem('successStories', idx)} className="p-2.5 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all justify-self-start sm:justify-self-auto">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea value={s.testimonial} onChange={(e) => updateListItem('successStories', idx, 'testimonial', e.target.value)} placeholder="Testimonial" required rows={2} className={inputClass} />
                </div>
              ))}
              {formData.successStories.length === 0 && <p className="text-xs text-slate-400">No success stories added yet.</p>}
            </div>
          </div>

          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish'}
          </button>
        </form>
      </div>
    </div>
  );
}
