'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, FileText, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import API from '../../../lib/api';
import Card from '../../ui/Card';
import Loading from '../../Loading';

const SHIFTS = ['', 'Morning', 'Afternoon', 'Evening', 'Shift 1', 'Shift 2', 'Shift 3'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const emptyQuestion = () => ({
    questionText: '',
    questionImage: '',
    options: ['', '', '', ''],
    optionImages: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    section: '',
    difficulty: 'medium',
    tags: []
});

async function uploadImageFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'aajexam/pyq');
    const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
    const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
    });
    const data = await res.json();
    if (!res.ok || !data?.url) throw new Error(data?.message || data?.error || 'Upload failed');
    return data.url;
}

export default function AdminPYQForm({ mode = 'create', pyqId = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === 'edit');
    const [saving, setSaving] = useState(false);
    const [exams, setExams] = useState([]);
    const [patterns, setPatterns] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');

    const [form, setForm] = useState({
        title: '',
        pyqYear: new Date().getFullYear(),
        pyqShift: '',
        pyqExamName: '',
        examPattern: '',
        duration: 60,
        totalMarks: 100,
        isFree: true,
        questions: [emptyQuestion()]
    });

    // Load exams once
    useEffect(() => {
        (async () => {
            try {
                const res = await API.request('/api/real-exams/all-exams');
                if (res?.success) setExams(res.data || []);
            } catch (e) { }
        })();
    }, []);

    // Load PYQ for edit
    useEffect(() => {
        if (mode !== 'edit' || !pyqId) return;
        (async () => {
            try {
                const res = await API.request(`/api/admin/pyq/${pyqId}`);
                if (res?.success) {
                    const d = res.data;
                    setForm({
                        title: d.title || '',
                        pyqYear: d.pyqYear || new Date().getFullYear(),
                        pyqShift: d.pyqShift || '',
                        pyqExamName: d.pyqExamName || '',
                        examPattern: d.examPattern?._id || d.examPattern || '',
                        duration: d.duration || 60,
                        totalMarks: d.totalMarks || 100,
                        isFree: d.isFree ?? true,
                        questions: (d.questions || []).map(q => {
                            const opts = q.options?.length ? [...q.options] : ['', '', '', ''];
                            const optImgs = Array.from({ length: opts.length }, (_, i) => q.optionImages?.[i] || '');
                            return {
                                questionText: q.questionText || '',
                                questionImage: q.questionImage || '',
                                options: opts,
                                optionImages: optImgs,
                                correctAnswerIndex: q.correctAnswerIndex ?? 0,
                                explanation: q.explanation || '',
                                section: q.section || '',
                                difficulty: q.difficulty || 'medium',
                                tags: q.tags || []
                            };
                        })
                    });
                    setSelectedExam(d.examPattern?.exam?._id || '');
                }
            } catch (e) { toast.error('Failed to load PYQ'); } finally { setLoading(false); }
        })();
    }, [mode, pyqId]);

    // Load patterns when exam changes
    useEffect(() => {
        if (!selectedExam) { setPatterns([]); return; }
        (async () => {
            try {
                const res = await API.request(`/api/real-exams/exams/${selectedExam}/patterns`);
                if (res?.success) setPatterns(res.data || []);
            } catch (e) { }
        })();
    }, [selectedExam]);

    const onPatternChange = (patternId) => {
        const p = patterns.find(x => x._id === patternId);
        setForm(f => ({
            ...f,
            examPattern: patternId,
            duration: p?.duration || f.duration,
            totalMarks: p?.totalMarks || f.totalMarks
        }));
    };

    const updateQuestion = (i, patch) => setForm(f => {
        const qs = [...f.questions];
        qs[i] = { ...qs[i], ...patch };
        return { ...f, questions: qs };
    });

    const updateOption = (qi, oi, val) => setForm(f => {
        const qs = [...f.questions];
        const opts = [...qs[qi].options];
        opts[oi] = val;
        qs[qi] = { ...qs[qi], options: opts };
        return { ...f, questions: qs };
    });

    const addOption = (qi) => setForm(f => {
        const qs = [...f.questions];
        qs[qi] = {
            ...qs[qi],
            options: [...qs[qi].options, ''],
            optionImages: [...(qs[qi].optionImages || []), '']
        };
        return { ...f, questions: qs };
    });

    const removeOption = (qi, oi) => setForm(f => {
        const qs = [...f.questions];
        const opts = qs[qi].options.filter((_, idx) => idx !== oi);
        const optImgs = (qs[qi].optionImages || []).filter((_, idx) => idx !== oi);
        let correctIdx = qs[qi].correctAnswerIndex;
        if (correctIdx === oi) correctIdx = 0;
        else if (correctIdx > oi) correctIdx -= 1;
        qs[qi] = { ...qs[qi], options: opts, optionImages: optImgs, correctAnswerIndex: correctIdx };
        return { ...f, questions: qs };
    });

    const updateOptionImage = (qi, oi, url) => setForm(f => {
        const qs = [...f.questions];
        const optImgs = [...(qs[qi].optionImages || [])];
        while (optImgs.length < qs[qi].options.length) optImgs.push('');
        optImgs[oi] = url;
        qs[qi] = { ...qs[qi], optionImages: optImgs };
        return { ...f, questions: qs };
    });

    const handleQuestionImageUpload = async (qi, file) => {
        if (!file) return;
        try {
            const url = await uploadImageFile(file);
            updateQuestion(qi, { questionImage: url });
            toast.success('Image uploaded');
        } catch (e) { toast.error(e.message || 'Upload failed'); }
    };

    const handleOptionImageUpload = async (qi, oi, file) => {
        if (!file) return;
        try {
            const url = await uploadImageFile(file);
            updateOptionImage(qi, oi, url);
            toast.success('Image uploaded');
        } catch (e) { toast.error(e.message || 'Upload failed'); }
    };

    const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
    const removeQuestion = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));

    const currentPattern = patterns.find(p => p._id === form.examPattern);
    const sectionOptions = currentPattern?.sections?.map(s => s.name) || [];

    const validate = () => {
        if (!form.title.trim()) return 'Title is required';
        if (!form.examPattern) return 'Select an exam pattern';
        if (!form.pyqYear) return 'Year is required';
        if (!form.questions.length) return 'Add at least one question';
        for (let i = 0; i < form.questions.length; i++) {
            const q = form.questions[i];
            if (!q.questionText.trim()) return `Question ${i + 1}: text missing`;
            if (q.options.length < 2) return `Question ${i + 1}: need at least 2 options`;
            if (q.options.some(o => !o.trim())) return `Question ${i + 1}: blank option`;
            if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) return `Question ${i + 1}: invalid correct answer`;
            if (!q.section.trim()) return `Question ${i + 1}: section required`;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { toast.error(err); return; }

        setSaving(true);
        try {
            const payload = {
                ...form,
                pyqYear: Number(form.pyqYear),
                duration: Number(form.duration),
                totalMarks: Number(form.totalMarks)
            };
            const endpoint = mode === 'edit' ? `/api/admin/pyq/${pyqId}` : '/api/admin/pyq';
            const method = mode === 'edit' ? 'PUT' : 'POST';
            const res = await API.request(endpoint, { method, body: JSON.stringify(payload) });
            if (res?.success) {
                toast.success(mode === 'edit' ? 'PYQ updated' : 'PYQ created');
                router.push('/admin/pyq');
            } else {
                toast.error(res?.message || res?.error || 'Failed');
            }
        } catch (e) {
            toast.error(e?.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

    return (
        <div className="min-h-screen pb-24">
            <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6 space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/admin/pyq')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"><ArrowLeft className="w-5 h-5" /></button>
                        <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary-500" /> {mode === 'edit' ? 'Edit PYQ' : 'New PYQ Paper'}
                        </h1>
                    </div>
                    <button onClick={handleSubmit} disabled={saving} className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Paper meta */}
                    <Card className="p-5 lg:p-6 space-y-5">
                        <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Paper Details</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500"
                                    placeholder="e.g., SSC CGL 2023 Tier 1 - Morning Shift" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">PYQ Exam Name</label>
                                <input type="text" value={form.pyqExamName} onChange={e => setForm({ ...form, pyqExamName: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500"
                                    placeholder="e.g., SSC CGL Tier 1" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Year *</label>
                                <input type="number" min="2000" max="2100" value={form.pyqYear} onChange={e => setForm({ ...form, pyqYear: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Shift</label>
                                <select value={form.pyqShift} onChange={e => setForm({ ...form, pyqShift: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500">
                                    {SHIFTS.map(s => <option key={s} value={s}>{s || '— none —'}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Exam *</label>
                                <select value={selectedExam} onChange={e => { setSelectedExam(e.target.value); setForm(f => ({ ...f, examPattern: '' })); }}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500">
                                    <option value="">Select Exam</option>
                                    {exams.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Pattern *</label>
                                <select value={form.examPattern} onChange={e => onPatternChange(e.target.value)} disabled={!patterns.length}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500 disabled:opacity-50">
                                    <option value="">{patterns.length ? 'Select Pattern' : 'Select exam first'}</option>
                                    {patterns.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Duration (min) *</label>
                                <input type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Total Marks *</label>
                                <input type="number" min="0" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500" />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })}
                                className="w-5 h-5 rounded text-primary-500 border-slate-300" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Free for all students</span>
                            <span className="text-xs text-slate-400">({form.isFree ? 'anyone can attempt' : 'pro only'})</span>
                        </label>
                    </Card>

                    {/* Questions */}
                    <Card className="p-5 lg:p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Questions ({form.questions.length})</h2>
                            <button type="button" onClick={addQuestion} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Question
                            </button>
                        </div>

                        <div className="space-y-5">
                            {form.questions.map((q, qi) => (
                                <div key={qi} className="p-4 border-2 border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-primary-500">Q{qi + 1}</span>
                                        {form.questions.length > 1 && (
                                            <button type="button" onClick={() => removeQuestion(qi)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                                        )}
                                    </div>

                                    <textarea value={q.questionText} onChange={e => updateQuestion(qi, { questionText: e.target.value })} rows={2}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary-500"
                                        placeholder="Question text..." />

                                    {/* Question image */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {q.questionImage ? (
                                            <div className="relative inline-block">
                                                <img src={q.questionImage} alt="" className="h-20 rounded-lg border border-slate-200 dark:border-slate-700 object-contain bg-white" />
                                                <button type="button" onClick={() => updateQuestion(qi, { questionImage: '' })}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                                <Upload className="w-3 h-3" /> Question Image
                                                <input type="file" accept="image/*" className="hidden"
                                                    onChange={e => handleQuestionImageUpload(qi, e.target.files?.[0])} />
                                            </label>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Options (click circle to mark correct)</p>
                                        {q.options.map((opt, oi) => {
                                            const optImg = q.optionImages?.[oi] || '';
                                            return (
                                            <div key={oi} className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => updateQuestion(qi, { correctAnswerIndex: oi })}
                                                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-black ${q.correctAnswerIndex === oi ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                                                    {String.fromCharCode(65 + oi)}
                                                </button>
                                                <input type="text" value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary-500"
                                                    placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                                                {optImg ? (
                                                    <button type="button" onClick={() => updateOptionImage(qi, oi, '')} className="p-1.5 hover:bg-red-50 rounded-lg" title="Remove image">
                                                        <X className="w-3.5 h-3.5 text-red-400" />
                                                    </button>
                                                ) : (
                                                    <label className="cursor-pointer p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Upload option image">
                                                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                                                        <input type="file" accept="image/*" className="hidden"
                                                            onChange={e => handleOptionImageUpload(qi, oi, e.target.files?.[0])} />
                                                    </label>
                                                )}
                                                {q.options.length > 2 && (
                                                    <button type="button" onClick={() => removeOption(qi, oi)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                                                )}
                                            </div>
                                            {optImg && (
                                                <img src={optImg} alt="" className="ml-8 h-16 rounded border border-slate-200 dark:border-slate-700 object-contain bg-white" />
                                            )}
                                            </div>
                                            );
                                        })}
                                        {q.options.length < 6 && (
                                            <button type="button" onClick={() => addOption(qi)} className="text-[10px] font-bold text-primary-500 hover:underline">+ Add option</button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Section *</label>
                                            {sectionOptions.length > 0 ? (
                                                <select value={q.section} onChange={e => updateQuestion(qi, { section: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary-500">
                                                    <option value="">Select section</option>
                                                    {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            ) : (
                                                <input type="text" value={q.section} onChange={e => updateQuestion(qi, { section: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary-500"
                                                    placeholder="e.g., General Awareness" />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Difficulty</label>
                                            <select value={q.difficulty} onChange={e => updateQuestion(qi, { difficulty: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary-500">
                                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Explanation</label>
                                        <textarea value={q.explanation} onChange={e => updateQuestion(qi, { explanation: e.target.value })} rows={2}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary-500"
                                            placeholder="Why is this the correct answer?" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => router.push('/admin/pyq')} className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : (mode === 'edit' ? 'Update PYQ' : 'Create PYQ')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
