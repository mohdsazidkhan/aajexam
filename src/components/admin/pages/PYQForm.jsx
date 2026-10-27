'use client';
import Select from '../../common/ui/Select';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, FileText, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import API from '../../../lib/api';
import Card from '../../common/ui/Card';
import { AdminFormSkeleton } from '../Skeletons';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

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

    useAdminMobileHeader({ title: mode === 'edit' ? 'Edit PYQ' : 'New PYQ Paper' });

    if (loading) return <div className="min-h-screen flex items-center justify-center"><AdminFormSkeleton /></div>;

    return (
        <div className="min-h-screen pb-6 xl:pb-12">
            <div className="py-2.5 xl:py-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button aria-label="Back" onClick={() => router.push('/admin/pyq')} className="p-2 rounded-lg xl:rounded-xl hover:bg-background-surface-secondary transition"><ArrowLeft className="w-5 h-5" /></button>
                    </div>
                    <button onClick={handleSubmit} disabled={saving} className="px-4 py-2.5 text-on-primary rounded-lg xl:rounded-xl text-sm font-bold hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-primary-600">
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Paper meta */}
                    <Card as="section" className="space-y-3">
                        <h2 className="text-sm font-bold text-content-secondary uppercase tracking-[0.08em]">Paper Details</h2>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-[0.08em]">Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600"
                                    placeholder="e.g., SSC CGL 2023 Tier 1 - Morning Shift" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-[0.08em]">PYQ Exam Name</label>
                                <input type="text" value={form.pyqExamName} onChange={e => setForm({ ...form, pyqExamName: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600"
                                    placeholder="e.g., SSC CGL Tier 1" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-[0.08em]">Year *</label>
                                <input type="number" min="2000" max="2100" value={form.pyqYear} onChange={e => setForm({ ...form, pyqYear: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-[0.08em]">Shift</label>
                                <Select value={form.pyqShift} onChange={e => setForm({ ...form, pyqShift: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600">
                                    {SHIFTS.map(s => <option key={s} value={s}>{s || '— none —'}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-[0.08em]">Exam *</label>
                                <Select value={selectedExam} onChange={e => { setSelectedExam(e.target.value); setForm(f => ({ ...f, examPattern: '' })); }}
                                    className="w-full px-3 py-2.5 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600">
                                    <option value="">Select Exam</option>
                                    {exams.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-[0.08em]">Pattern *</label>
                                <Select value={form.examPattern} onChange={e => onPatternChange(e.target.value)} disabled={!patterns.length}
                                    className="w-full px-3 py-2.5 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600 disabled:opacity-50">
                                    <option value="">{patterns.length ? 'Select Pattern' : 'Select exam first'}</option>
                                    {patterns.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-[0.08em]">Duration (min) *</label>
                                <input type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-content-muted mb-1.5 uppercase tracking-[0.08em]">Total Marks *</label>
                                <input type="number" min="0" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600" />
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })}
                                className="w-5 h-5 rounded text-primary-600 border-border-primary" />
                            <span className="text-sm font-bold text-content-secondary">Free for all students</span>
                            <span className="text-xs text-content-muted">({form.isFree ? 'anyone can attempt' : 'pro only'})</span>
                        </label>
                    </Card>

                    {/* Questions */}
                    <Card as="section" className="space-y-3">
                        <section className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-content-secondary uppercase tracking-[0.08em]">Questions ({form.questions.length})</h2>
                            <button type="button" onClick={addQuestion} className="px-3 py-2 text-on-primary rounded-lg text-xs font-bold hover:bg-primary-600 transition flex items-center gap-1 bg-primary-600">
                                <Plus className="w-3 h-3" /> Add Question
                            </button>
                        </section>

                        <div className="space-y-3">
                            {form.questions.map((q, qi) => (
                                <div key={qi} className="p-4 border border-border-primary rounded-lg xl:rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-primary-600">Q{qi + 1}</span>
                                        {form.questions.length > 1 && (
                                            <button aria-label="Delete" type="button" onClick={() => removeQuestion(qi)} className="p-1.5 hover:bg-background-surface-secondary rounded-lg"><Trash2 className="w-4 h-4 text-content-primary" /></button>
                                        )}
                                    </div>

                                    <textarea value={q.questionText} onChange={e => updateQuestion(qi, { questionText: e.target.value })} rows={2}
                                        className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm outline-none focus:border-primary-600"
                                        placeholder="Question text..." />

                                    {/* Question image */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {q.questionImage ? (
                                            <div className="relative inline-block">
                                                <img src={q.questionImage} alt="" className="h-20 rounded-lg border border-border-primary object-contain bg-background-surface" />
                                                <button aria-label="Close" type="button" onClick={() => updateQuestion(qi, { questionImage: '' })}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-on-primary rounded-full flex items-center justify-center hover:bg-primary-800">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-background-surface-secondary hover:bg-background-surface-secondary dark:hover:bg-slate-600 rounded-lg text-[11px] font-bold text-content-secondary">
                                                <Upload className="w-3 h-3" /> Question Image
                                                <input type="file" accept="image/*" className="hidden"
                                                    onChange={e => handleQuestionImageUpload(qi, e.target.files?.[0])} />
                                            </label>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">Options (click circle to mark correct)</p>
                                        {q.options.map((opt, oi) => {
                                            const optImg = q.optionImages?.[oi] || '';
                                            return (
                                            <div key={oi} className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => updateQuestion(qi, { correctAnswerIndex: oi })}
                                                    className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold ${q.correctAnswerIndex === oi ? 'bg-primary-600 border-primary-600 text-on-primary' : 'border-border-primary text-content-muted'}`}>
                                                    {String.fromCharCode(65 + oi)}
                                                </button>
                                                <input type="text" value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-background-surface border border-border-primary rounded-lg text-sm outline-none focus:border-primary-600"
                                                    placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                                                {optImg ? (
                                                    <button type="button" onClick={() => updateOptionImage(qi, oi, '')} className="p-1.5 hover:bg-background-surface-secondary rounded-lg" title="Remove image">
                                                        <X className="w-3.5 h-3.5 text-content-primary" />
                                                    </button>
                                                ) : (
                                                    <label className="cursor-pointer p-1.5 hover:bg-background-surface-secondary rounded-lg" title="Upload option image">
                                                        <Upload className="w-3.5 h-3.5 text-content-muted" />
                                                        <input type="file" accept="image/*" className="hidden"
                                                            onChange={e => handleOptionImageUpload(qi, oi, e.target.files?.[0])} />
                                                    </label>
                                                )}
                                                {q.options.length > 2 && (
                                                    <button aria-label="Delete" type="button" onClick={() => removeOption(qi, oi)} className="p-1.5 hover:bg-background-surface-secondary rounded-lg"><Trash2 className="w-3.5 h-3.5 text-content-primary" /></button>
                                                )}
                                            </div>
                                            {optImg && (
                                                <img src={optImg} alt="" className="ml-8 h-16 rounded border border-border-primary object-contain bg-background-surface" />
                                            )}
                                            </div>
                                            );
                                        })}
                                        {q.options.length < 6 && (
                                            <button type="button" onClick={() => addOption(qi)} className="text-[10px] font-bold text-primary-600 hover:underline">+ Add option</button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-content-muted mb-1 uppercase tracking-[0.08em]">Section *</label>
                                            {sectionOptions.length > 0 ? (
                                                <Select value={q.section} onChange={e => updateQuestion(qi, { section: e.target.value })}
                                                    className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg text-sm outline-none focus:border-primary-600">
                                                    <option value="">Select section</option>
                                                    {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                                </Select>
                                            ) : (
                                                <input type="text" value={q.section} onChange={e => updateQuestion(qi, { section: e.target.value })}
                                                    className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg text-sm outline-none focus:border-primary-600"
                                                    placeholder="e.g., General Awareness" />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-content-muted mb-1 uppercase tracking-[0.08em]">Difficulty</label>
                                            <Select value={q.difficulty} onChange={e => updateQuestion(qi, { difficulty: e.target.value })}
                                                className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg text-sm outline-none focus:border-primary-600">
                                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-content-muted mb-1 uppercase tracking-[0.08em]">Explanation</label>
                                        <textarea value={q.explanation} onChange={e => updateQuestion(qi, { explanation: e.target.value })} rows={2}
                                            className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg text-sm outline-none focus:border-primary-600"
                                            placeholder="Why is this the correct answer?" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => router.push('/admin/pyq')} className="px-4 py-2.5 bg-background-surface-secondary text-content-secondary rounded-lg xl:rounded-xl text-sm font-bold hover:bg-background-surface-secondary dark:hover:bg-slate-600 transition">Cancel</button>
                        <button type="submit" disabled={saving} className="px-4 py-2.5 text-on-primary rounded-lg xl:rounded-xl text-sm font-bold hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-primary-600">
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : (mode === 'edit' ? 'Update PYQ' : 'Create PYQ')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
