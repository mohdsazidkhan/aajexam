'use client';
import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, ChevronDown, ChevronUp, PlayCircle, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Seo from '../components/Seo';
import SubscriptionGuard from '../components/SubscriptionGuard';
import { DashboardSkeleton } from '../components/skeletons/PrivateSkeletons';
import { motion, AnimatePresence } from 'framer-motion';

// --- Subject Accordion Item ---
const SubjectAccordion = ({ subject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAllDone = subject.completedTopics === subject.totalTopics && subject.totalTopics > 0;

  return (
    <Card padded={false} className="overflow-hidden mb-4 border-2 border-border-primary border-b-4 hover:border-violet-300 dark:hover:border-violet-700 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-background-surface hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isAllDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'}`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-black text-content-primary">{subject.name}</h3>
            <p className="text-xs font-bold text-content-muted mt-0.5">
              {subject.completedTopics} of {subject.totalTopics} topics completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress circle */}
          <div className="hidden sm:flex items-center justify-center relative w-10 h-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-200 dark:text-slate-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${isAllDone ? 'text-emerald-500' : 'text-violet-500'}`} strokeWidth="3" strokeDasharray={`${subject.totalTopics ? (subject.completedTopics / subject.totalTopics) * 100 : 0}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-content-muted" /> : <ChevronDown className="w-5 h-5 text-content-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border-primary">
            <div className="p-2 sm:p-4 bg-slate-50/50 dark:bg-slate-900/20">
              {subject.topics.length === 0 ? (
                <p className="text-sm text-content-muted text-center py-4 font-bold">No topics mapped yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {subject.topics.map(topic => (
                    <div key={topic._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        {topic.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-bold ${topic.isCompleted ? 'text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-300 dark:decoration-emerald-700/50' : 'text-content-primary'}`}>
                          {topic.name}
                        </span>
                      </div>

                      {!topic.isCompleted && (
                        <Link href={`/quizzes?topic=${topic.slug}`}>
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
                            <PlayCircle className="w-3 h-3" /> Practice
                          </button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};


const SyllabusTrackerPage = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [trackerData, setTrackerData] = useState(null);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // 1. Fetch available exams for the dropdown
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.request('/api/real-exams/all-exams');
        if (res?.success) setExams(res.data || []);
      } catch (e) {
        console.error('Failed to load exams', e);
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  // 2. Fetch tracker data when an exam is selected
  useEffect(() => {
    if (!selectedExam) {
      setTrackerData(null);
      return;
    }
    const fetchTracker = async () => {
      setLoadingData(true);
      try {
        const res = await API.request(`/api/syllabus-tracker/${selectedExam}`);
        if (res?.success) {
          setTrackerData(res.data);
        } else {
          setTrackerData(null);
        }
      } catch (e) {
        console.error('Failed to load syllabus', e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchTracker();
  }, [selectedExam]);

  if (loadingExams) return (
    <div className="min-h-screen pb-24 font-outfit">
      <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6"><DashboardSkeleton /></div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 font-outfit">
      <Seo
        title="Syllabus Tracker (PRO) | AajExam"
        description="Auto-track your exam syllabus completion based on quizzes you practice."
        noIndex={true}
      />

      <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6 space-y-6">
        <SubscriptionGuard message="Syllabus Tracker is a PRO feature. Upgrade to auto-track your exam completion!">

          <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-stretch sm:items-center gap-3">

            <div className="space-y-1">
              <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-content-primary flex items-center gap-2">
                <Layers className="w-6 h-6 text-violet-500" /> Syllabus Tracker
              </h1>
              <p className="text-sm font-bold text-content-muted">Auto-tracks topics as you complete quizzes!</p>
            </div>

            {/* ── Exam Selection ── */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Target className="w-4 h-4 text-slate-400" />
              </div>
              <select
                value={selectedExam}
                onChange={e => setSelectedExam(e.target.value)}
                className="w-full appearance-none bg-background-surface border border-border-primary text-content-primary text-sm font-bold rounded-xl py-3 pl-10 pr-10 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="">Select Exam to Track</option>
                {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* ── Data View ── */}
          {selectedExam && loadingData ? (
            <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div>
          ) : selectedExam && trackerData ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Progress Header */}
              <Card className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-10 border-b-8 border-violet-500">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-violet-500" strokeWidth="3.5" strokeDasharray={`${trackerData.overallProgress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-content-primary">{trackerData.overallProgress}%</span>
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-xl sm:text-2xl font-black text-content-primary mb-1">Overall Progress</h2>
                  <p className="text-sm font-bold text-content-muted">
                    You have mastered <strong className="text-emerald-500">{trackerData.completedTopics}</strong> out of <strong>{trackerData.totalTopics}</strong> topics for this exam.
                  </p>
                  {trackerData.overallProgress === 100 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-black uppercase">
                      <CheckCircle2 className="w-4 h-4" /> Syllabus Completed!
                    </div>
                  )}
                </div>
              </Card>

              {/* Accordions */}
              <div>
                <h3 className="text-sm font-black text-content-primary uppercase mb-3 px-1">Subjects</h3>
                {trackerData.syllabus.length === 0 ? (
                  <div className="text-center py-10 bg-background-surface rounded-2xl border-2 border-dashed border-border-primary">
                    <p className="text-sm font-bold text-content-muted">No syllabus data found for this exam.</p>
                  </div>
                ) : (
                  trackerData.syllabus.map(subject => (
                    <SubjectAccordion key={subject._id} subject={subject} />
                  ))
                )}
              </div>

            </motion.div>
          ) : !selectedExam ? (
            <div className="py-20 text-center space-y-4">
              <Layers className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-content-muted">Select an exam above to view its syllabus tracker.</p>
            </div>
          ) : null}

        </SubscriptionGuard>
      </div>
    </div>
  );
};

export default SyllabusTrackerPage;
