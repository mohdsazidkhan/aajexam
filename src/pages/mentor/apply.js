'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Users, Plus, X, Send } from 'lucide-react';
import API from '../../lib/api';
import { toast } from 'react-hot-toast';
import Seo from '../../components/Seo';

export default function MentorApply() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    examsCleared: [{ examName: '', year: '', rank: '', score: '', attempt: 1 }],
    strategy: '',
    tips: [''],
    dailyRoutine: '',
    booksRecommended: [''],
    preparationMonths: '',
    specialization: [''],
  });

  const addExam = () => setForm(f => ({ ...f, examsCleared: [...f.examsCleared, { examName: '', year: '', rank: '', score: '', attempt: 1 }] }));
  const removeExam = (i) => setForm(f => ({ ...f, examsCleared: f.examsCleared.filter((_, j) => j !== i) }));
  const updateExam = (i, field, val) => setForm(f => ({ ...f, examsCleared: f.examsCleared.map((e, j) => j === i ? { ...e, [field]: val } : e) }));

  const addField = (field) => setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  const removeField = (field, i) => setForm(f => ({ ...f, [field]: f[field].filter((_, j) => j !== i) }));
  const updateField = (field, i, val) => setForm(f => ({ ...f, [field]: f[field].map((v, j) => j === i ? val : v) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.strategy.trim()) return toast.error('Please share your preparation strategy');
    if (!form.examsCleared[0]?.examName) return toast.error('Please add at least one exam');

    setLoading(true);
    try {
      const payload = {
        ...form,
        examsCleared: form.examsCleared.filter(e => e.examName).map(e => ({ ...e, year: Number(e.year), rank: e.rank ? Number(e.rank) : undefined, score: e.score ? Number(e.score) : undefined, attempt: Number(e.attempt) })),
        tips: form.tips.filter(t => t.trim()),
        booksRecommended: form.booksRecommended.filter(b => b.trim()),
        specialization: form.specialization.filter(s => s.trim()),
        preparationMonths: Number(form.preparationMonths) || 0,
      };
      const res = await API.request('/api/mentor/apply', { method: 'POST', body: JSON.stringify(payload) });
      if (res?.success) {
        toast.success('Application submitted! We will review it soon.');
        router.push('/mentors');
      } else {
        toast.error(res?.message || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white dark:bg-slate-800 rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-200 dark:border-slate-700";
  const labelClass = "text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 block";

  return (
    <div className="min-h-screen pb-24">
      <Seo
        title="Become a Mentor – Help Aspirants on AajExam"
        description="Cleared a government exam? Apply to become an AajExam mentor and help fellow aspirants with strategy, study plans and doubt-clearing."
        canonical="/mentor/apply"
      />
      <div className="max-w-2xl mx-auto py-4 lg:py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase">Become a Mentor</h1>
            <p className="text-xs text-slate-400 font-bold">Share your exam success story and help others</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exams Cleared */}
          <div>
            <label className={labelClass}>Exams Cleared *</label>
            <div className="space-y-3">
              {form.examsCleared.map((exam, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-start p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input placeholder="Exam name *" value={exam.examName} onChange={e => updateExam(i, 'examName', e.target.value)} className={`${inputClass} flex-1 min-w-[150px]`} />
                  <input type="number" placeholder="Year *" value={exam.year} onChange={e => updateExam(i, 'year', e.target.value)} className={`${inputClass} w-24`} />
                  <input type="number" placeholder="Rank" value={exam.rank} onChange={e => updateExam(i, 'rank', e.target.value)} className={`${inputClass} w-24`} />
                  <input type="number" placeholder="Score" value={exam.score} onChange={e => updateExam(i, 'score', e.target.value)} className={`${inputClass} w-24`} />
                  {form.examsCleared.length > 1 && (
                    <button type="button" onClick={() => removeExam(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addExam} className="mt-2 flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700">
              <Plus className="w-3 h-3" /> Add another exam
            </button>
          </div>

          {/* Strategy */}
          <div>
            <label className={labelClass}>Preparation Strategy *</label>
            <textarea rows={4} placeholder="Describe your preparation strategy in detail..." value={form.strategy} onChange={e => setForm(f => ({ ...f, strategy: e.target.value }))} className={inputClass} />
          </div>

          {/* Daily Routine */}
          <div>
            <label className={labelClass}>Daily Routine</label>
            <textarea rows={3} placeholder="Describe your daily study routine..." value={form.dailyRoutine} onChange={e => setForm(f => ({ ...f, dailyRoutine: e.target.value }))} className={inputClass} />
          </div>

          {/* Preparation Months */}
          <div>
            <label className={labelClass}>Months of Preparation</label>
            <input type="number" placeholder="e.g. 12" value={form.preparationMonths} onChange={e => setForm(f => ({ ...f, preparationMonths: e.target.value }))} className={`${inputClass} w-32`} />
          </div>

          {/* Tips */}
          <div>
            <label className={labelClass}>Tips for Students</label>
            {form.tips.map((tip, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder={`Tip ${i + 1}`} value={tip} onChange={e => updateField('tips', i, e.target.value)} className={`${inputClass} flex-1`} />
                {form.tips.length > 1 && <button type="button" onClick={() => removeField('tips', i)} className="p-2 text-rose-500"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            <button type="button" onClick={() => addField('tips')} className="flex items-center gap-1 text-xs font-bold text-primary-600"><Plus className="w-3 h-3" /> Add tip</button>
          </div>

          {/* Books */}
          <div>
            <label className={labelClass}>Books Recommended</label>
            {form.booksRecommended.map((book, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder={`Book ${i + 1}`} value={book} onChange={e => updateField('booksRecommended', i, e.target.value)} className={`${inputClass} flex-1`} />
                {form.booksRecommended.length > 1 && <button type="button" onClick={() => removeField('booksRecommended', i)} className="p-2 text-rose-500"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            <button type="button" onClick={() => addField('booksRecommended')} className="flex items-center gap-1 text-xs font-bold text-primary-600"><Plus className="w-3 h-3" /> Add book</button>
          </div>

          {/* Specialization */}
          <div>
            <label className={labelClass}>Specialization</label>
            {form.specialization.map((spec, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder={`e.g. Mathematics, Reasoning`} value={spec} onChange={e => updateField('specialization', i, e.target.value)} className={`${inputClass} flex-1`} />
                {form.specialization.length > 1 && <button type="button" onClick={() => removeField('specialization', i)} className="p-2 text-rose-500"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            <button type="button" onClick={() => addField('specialization')} className="flex items-center gap-1 text-xs font-bold text-primary-600"><Plus className="w-3 h-3" /> Add specialization</button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black py-3 px-8 rounded-2xl transition-all shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50">
            <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
