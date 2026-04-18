'use client';
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, BarChart3, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Head from 'next/head';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';

const ReadinessPage = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.request('/api/real-exams/all-exams');
        if (res?.success) setExams(res.data || []);
      } catch (e) { } finally { setLoading(false); }
    };
    fetchExams();
  }, []);

  const analyzeReadiness = async () => {
    if (!selectedExam) return;
    setAnalyzing(true);
    try {
      const res = await API.request(`/api/readiness/${selectedExam}`);
      if (res?.success) setReadiness(res.data);
    } catch (e) { } finally { setAnalyzing(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  const readinessColor = (r) => r >= 70 ? 'emerald' : r >= 40 ? 'yellow' : 'red';

  return (
    <div className="min-h-screen pb-24">
      <Head><title>Exam Readiness - AajExam</title></Head>
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><Target className="w-6 h-6 text-primary-500" /> Exam Readiness</h1>
          <p className="text-sm font-bold text-slate-400">How prepared are you?</p>
        </div>

        <Card className="p-4 flex items-center gap-3">
          <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none">
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <button onClick={analyzeReadiness} disabled={!selectedExam || analyzing}
            className="px-6 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 disabled:opacity-50">
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </Card>

        {readiness && (
          <div className="space-y-4">
            {/* Main Score */}
            <Card className={`p-8 text-center bg-${readinessColor(readiness.readiness)}-50 dark:bg-${readinessColor(readiness.readiness)}-900/20`}>
              <p className={`text-6xl font-black text-${readinessColor(readiness.readiness)}-500`}>{readiness.readiness}%</p>
              <p className="text-sm font-bold text-slate-500 mt-2">Exam Readiness Score</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {readiness.trend > 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                <span className={`text-xs font-bold ${readiness.trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{readiness.trend > 0 ? '+' : ''}{readiness.trend}% trend</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">{readiness.recommendation}</p>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="p-3 text-center"><p className="text-xl font-black text-slate-700 dark:text-white">{readiness.totalAttempts}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Total Attempts</p></Card>
              <Card className="p-3 text-center"><p className="text-xl font-black text-blue-500">{readiness.avgQuizScore}%</p><p className="text-[9px] font-bold text-slate-400 uppercase">Avg Quiz</p></Card>
              <Card className="p-3 text-center"><p className="text-xl font-black text-purple-500">{readiness.avgTestScore}%</p><p className="text-[9px] font-bold text-slate-400 uppercase">Avg Test</p></Card>
              <Card className="p-3 text-center"><p className="text-xl font-black text-slate-600">{readiness.totalQuizAttempts + readiness.totalTestAttempts}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Tests Done</p></Card>
            </div>

            {/* Weak Subjects */}
            {readiness.weakSubjects?.length > 0 && (
              <Card className="p-4 space-y-2">
                <h3 className="text-sm font-black text-red-500 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Weak Subjects (Below 50%)</h3>
                {readiness.weakSubjects.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.subject}</span>
                    <span className="text-xs font-black text-red-500">{s.accuracy}%</span>
                  </div>
                ))}
              </Card>
            )}

            {/* Strong Subjects */}
            {readiness.strongSubjects?.length > 0 && (
              <Card className="p-4 space-y-2">
                <h3 className="text-sm font-black text-emerald-500 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Strong Subjects (Above 70%)</h3>
                {readiness.strongSubjects.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.subject}</span>
                    <span className="text-xs font-black text-emerald-500">{s.accuracy}%</span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {!readiness && !analyzing && (
          <Card className="p-8 text-center space-y-4">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-xl font-black text-slate-400">Select an Exam</h2>
            <p className="text-sm text-slate-400">Choose your target exam to see your readiness score based on your quiz and test history.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReadinessPage;
