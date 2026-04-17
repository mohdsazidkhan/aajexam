'use client';
import React, { useState, useEffect } from 'react';
import { CalendarDays, Sparkles, CheckCircle, Clock, Target, Plus, Trash2, Play, Pause } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';

const StudyPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ examId: '', examDate: '', dailyHours: 4, weakSubjects: '', strongSubjects: '' });
  const [activePlan, setActivePlan] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, examsRes] = await Promise.all([
          API.request('/api/study-plan'),
          API.request('/api/real-exams/all-exams')
        ]);
        if (plansRes?.success) setPlans(plansRes.data || []);
        if (examsRes?.success) setExams(examsRes.data || []);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const generatePlan = async () => {
    if (!form.examId || !form.examDate || !form.dailyHours) { toast.error('Fill all required fields'); return; }
    setGenerating(true);
    try {
      const res = await API.request('/api/study-plan/generate', {
        method: 'POST',
        body: JSON.stringify({
          examId: form.examId,
          examDate: form.examDate,
          dailyHours: parseInt(form.dailyHours),
          weakSubjects: form.weakSubjects.split(',').map(s => s.trim()).filter(Boolean),
          strongSubjects: form.strongSubjects.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res?.success) {
        setPlans([res.data, ...plans]);
        setShowForm(false);
        toast.success(`Study plan generated! (${res.data.generatedBy === 'ai' ? 'AI' : 'Template'})`);
      } else toast.error(res?.message || 'Failed');
    } catch (e) { toast.error('Failed to generate plan'); } finally { setGenerating(false); }
  };

  const togglePlanStatus = async (planId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await API.request(`/api/study-plan/${planId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus, isActive: newStatus === 'active' }) });
      setPlans(plans.map(p => p._id === planId ? { ...p, status: newStatus, isActive: newStatus === 'active' } : p));
    } catch (e) { }
  };

  const deletePlan = async (planId) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await API.request(`/api/study-plan/${planId}`, { method: 'DELETE' });
      setPlans(plans.filter(p => p._id !== planId));
      toast.success('Plan deleted');
    } catch (e) { }
  };

  const completeTask = async (planId, weekIdx, taskIdx) => {
    try {
      const res = await API.request(`/api/study-plan/${planId}`, {
        method: 'PUT',
        body: JSON.stringify({ weekIndex: weekIdx, taskIndex: taskIdx })
      });
      if (res?.success) {
        setActivePlan(res.data);
        setPlans(plans.map(p => p._id === planId ? res.data : p));
      }
    } catch (e) { }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <Head><title>AI Study Planner - AajExam</title></Head>
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><CalendarDays className="w-6 h-6 text-primary-500" /> Study Planner</h1>
            <p className="text-sm font-bold text-slate-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI-powered personalized plans</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold hover:bg-primary-600">
            <Plus className="w-3 h-3 inline mr-1" /> New Plan
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Generate Study Plan</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Exam *</label>
                <select value={form.examId} onChange={e => setForm({ ...form, examId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none">
                  <option value="">Select Exam</option>
                  {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Exam Date *</label>
                <input type="date" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Daily Hours *</label>
                <input type="number" min="1" max="16" value={form.dailyHours} onChange={e => setForm({ ...form, dailyHours: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Weak Subjects (comma separated)</label>
                <input type="text" placeholder="Maths, English" value={form.weakSubjects} onChange={e => setForm({ ...form, weakSubjects: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Strong Subjects (comma separated)</label>
                <input type="text" placeholder="GK, Reasoning" value={form.strongSubjects} onChange={e => setForm({ ...form, strongSubjects: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none" />
              </div>
            </div>
            <button onClick={generatePlan} disabled={generating} className="px-6 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 disabled:opacity-50">
              {generating ? <><Sparkles className="w-4 h-4 inline mr-1 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 inline mr-1" /> Generate Plan</>}
            </button>
          </Card>
        )}

        {/* Plans List */}
        {!activePlan && plans.map((plan, i) => (
          <Card key={plan._id || i} className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">{plan.exam?.name || 'Study Plan'}</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold mt-1">
                  <span><Clock className="w-3 h-3 inline" /> {plan.dailyHours}h/day</span>
                  <span><Target className="w-3 h-3 inline" /> {plan.totalDays} days</span>
                  <span className={`px-2 py-0.5 rounded ${plan.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{plan.status}</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{plan.generatedBy === 'ai' ? 'AI' : 'Template'}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => togglePlanStatus(plan._id, plan.status)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  {plan.status === 'active' ? <Pause className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-emerald-500" />}
                </button>
                <button onClick={() => deletePlan(plan._id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${plan.completionPercentage || 0}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>{plan.completionPercentage || 0}% complete</span>
              <span>Exam: {new Date(plan.examDate).toLocaleDateString('en-IN')}</span>
            </div>
            <button onClick={() => setActivePlan(plan)} className="text-[10px] font-black text-primary-500 hover:underline">View Full Plan</button>
          </Card>
        ))}

        {/* Active Plan Detail */}
        {activePlan && (
          <div className="space-y-4">
            <button onClick={() => setActivePlan(null)} className="text-sm font-bold text-primary-500 hover:underline">Back to Plans</button>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{activePlan.exam?.name} - Weekly Schedule</h2>
            {activePlan.weeklySchedule?.map((week, wi) => (
              <Card key={wi} className="p-4 space-y-2">
                <h3 className="text-xs font-black text-slate-500 uppercase">Week {week.week}</h3>
                {week.tasks?.map((task, ti) => (
                  <div key={ti} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${task.isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    <button onClick={() => completeTask(activePlan._id, wi, ti)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.isCompleted ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                      {task.isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-xs font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        Day {task.day}: {task.subject} - {task.topic}
                      </span>
                      {task.description && <p className="text-[10px] text-slate-400">{task.description}</p>}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{task.duration}h · {task.taskType?.replace('_', ' ')}</span>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )}

        {plans.length === 0 && !showForm && (
          <Card className="p-8 text-center space-y-4">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-xl font-black text-slate-400">No Study Plans Yet</h2>
            <p className="text-sm text-slate-400">Create your first AI-powered study plan!</p>
            <button onClick={() => setShowForm(true)} className="px-6 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold">Create Plan</button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudyPlanPage;
