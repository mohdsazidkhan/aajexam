'use client';
import Select from '../../components/common/ui/Select';
import { ListPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, ChevronDown, ChevronUp, PlayCircle, BookOpen, Layers } from 'lucide-react';
import Link from '@/components/common/AppLink';
import API from '../../lib/api';
import useTargetExamsVersion from '../../hooks/useTargetExamsVersion';
import Card from '../../components/common/ui/Card';
import PageHero from '../../components/common/ui/PageHero';
import Seo from '../../components/common/Seo';
import SubscriptionGuard from '../../components/student/SubscriptionGuard';
import { m as motion, AnimatePresence } from 'framer-motion';
import useTranslate from '../../hooks/useTranslate';
import useRequireLogin from '../../hooks/useRequireLogin';

// --- Tracker Skeleton (matches the loaded data view) ---
const Sh = ({ className = '' }) => (
  <div className={`container mx-auto animate-pulse bg-primary-500/15 dark:bg-primary-500/20 rounded-lg xl:rounded-xl ${className}`} />
);

const TrackerSkeleton = () => (
  <div className="space-y-6">
    <Card className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
      <Sh className="w-32 h-32 rounded-full flex-shrink-0" />
      <div className="flex-1 w-full space-y-3 text-center md:text-left">
        <Sh className="h-6 w-40 mx-auto md:mx-0" />
        <Sh className="h-4 w-full max-w-xs mx-auto md:mx-0" />
      </div>
    </Card>

    <div className="space-y-3">
      <Sh className="h-4 w-24" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-border-primary mb-4">
          <div className="flex items-center gap-4">
            <Sh className="w-12 h-12 rounded-2xl flex-shrink-0" />
            <div className="space-y-2">
              <Sh className="h-4 w-32" />
              <Sh className="h-3 w-24" />
            </div>
          </div>
          <Sh className="w-10 h-10 rounded-full hidden sm:block" />
        </div>
      ))}
    </div>
  </div>
);

// --- Subject Accordion Item ---
const SubjectAccordion = ({ subject }) => {
  const { translate, translateData } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const isAllDone = subject.completedTopics === subject.totalTopics && subject.totalTopics > 0;

  return (
    <Card as="section" padded={false} className="overflow-hidden mb-3 hover:-translate-y-0.5 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-background-surface dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div style={{ borderRadius: 14 }} className={`w-12 h-12 flex items-center justify-center flex-shrink-0 ${isAllDone ? 'text-on-primary bg-primary-600' : 'text-on-primary bg-primary-600'}`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-bold text-content-primary">{translateData(subject.name)}</h3>
            <p className="text-xs font-bold text-content-muted mt-0.5">
              {translate('{done} of {total} topics completed', { done: subject.completedTopics, total: subject.totalTopics })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress circle */}
          <div className="hidden sm:flex items-center justify-center relative w-10 h-10">
            <svg className="w-full h-full transform" viewBox="0 0 36 36">
              <path className="text-slate-200 dark:text-slate-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${isAllDone ? 'text-primary-600' : 'text-primary-500'}`} strokeWidth="3" strokeDasharray={`${subject.totalTopics ? (subject.completedTopics / subject.totalTopics) * 100 : 0}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5 text-content-muted" /> : <ChevronDown className="w-5 h-5 text-content-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border-primary">
            <div className="p-2 sm:p-4 dark:bg-white/5">
              {subject.topics.length === 0 ? (
                <p className="text-sm text-content-muted text-center py-4 font-bold">{translate('No topics mapped yet.')}</p>
              ) : (
                <div className="space-y-1.5">
                  {subject.topics.map(topic => (
                    <div key={topic._id} className="flex items-center justify-between p-3 border border-transparent hover:border-primary-200 dark:hover:border-white/15 hover:bg-background-surface dark:hover:bg-slate-800 transition-colors" style={{ borderRadius: 10 }}>
                      <div className="flex items-center gap-3">
                        {topic.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-bold ${topic.isCompleted ? 'text-primary-600 line-through decoration-primary-300 dark:decoration-primary-700/50' : 'text-content-primary'}`}>
                          {translateData(topic.name)}
                        </span>
                      </div>

                      {!topic.isCompleted && (
                        <Link href={`/quizzes?topic=${topic.slug}`}>
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-on-primary text-[10px] font-bold uppercase hover:brightness-105 transition-all bg-primary-600">
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
  useRequireLogin();
  const { translate, rich, translateData } = useTranslate();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [trackerData, setTrackerData] = useState(null);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const targetVersion = useTargetExamsVersion();

  // 1. Fetch available exams for the dropdown (limited to the user's target exams, if any)
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.getAllExams({ forUser: true });
        if (res?.success) setExams(res.data || []);
      } catch (e) {
        console.error('Failed to load exams', e);
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, [targetVersion]);

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
    <div className="min-h-screen pb-8 xl:pb-16 font-outfit">
      <div className="py-2 xl:py-4"><ListPageSkeleton chips={4} rows={5} /></div>
    </div>
  );

  return (
    <div className="min-h-screen pb-8 xl:pb-16 font-outfit">
      <Seo
        title="Syllabus Tracker (PRO) | AajExam"
        description="Auto-track your exam syllabus completion based on quizzes you practice."
        noIndex={true}
      />

      <div className="py-4 xl:py-6 space-y-6">
        <SubscriptionGuard message="Syllabus Tracker is a PRO feature. Upgrade to auto-track your exam completion!">

          <PageHero
            icon={Layers}
            eyebrow="Syllabus Tracker"
            title="Syllabus Tracker"
            actions={
              <div className="relative w-full xl:w-72">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Target className="w-4 h-4 text-content-muted" />
                </div>
                <Select
                  value={selectedExam}
                  onChange={e => setSelectedExam(e.target.value)}
                  className="w-full appearance-none bg-background-surface border border-border-primary text-content-primary text-sm font-bold rounded-lg xl:rounded-xl py-3 pl-10 pr-10 outline-none focus:border-primary-600 cursor-pointer"
                >
                  <option value="">{translate('Select Exam to Track')}</option>
                  {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </Select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-content-muted" />
                </div>
              </div>
            }
          />

          {/* ── Data View ── */}
          {selectedExam && loadingData ? (
            <TrackerSkeleton />
          ) : selectedExam && trackerData ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Progress Header */}
              <Card as="section" className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg className="w-full h-full transform" viewBox="0 0 36 36">
                    <path className="text-slate-100 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-primary-600" strokeWidth="3.5" strokeDasharray={`${trackerData.overallProgress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-outfit text-primary-600">{trackerData.overallProgress}%</span>
                  </div>
                </div>
                <section className="text-center md:text-left flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-content-primary mb-1">{translate('Overall Progress')}</h2>
                  <p className="text-sm font-bold text-content-muted">
                    {rich('You have mastered <0></0> out of <1></1> topics for this exam.', [() => <strong className="text-primary-600">{trackerData.completedTopics}</strong>, () => <strong>{trackerData.totalTopics}</strong>])}
                  </p>
                  {trackerData.overallProgress === 100 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-primary-600">
                      <CheckCircle2 className="w-4 h-4" /> Syllabus Completed!
                    </div>
                  )}
                </section>
              </Card>

              {/* Accordions */}
              <div>
                <h3 className="flex items-center gap-2.5 text-sm font-bold text-content-primary uppercase mb-3 px-1 pb-2 border-b border-dashed border-primary-300/70 dark:border-white/15"><span className="w-8 h-8 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 10 }}><BookOpen className="w-4 h-4" /></span>{translate('Subjects')}</h3>
                {trackerData.syllabus.length === 0 ? (
                  <div className="text-center py-10 bg-background-surface border border-dashed border-primary-300 dark:border-slate-700" style={{ borderRadius: 16 }}>
                    <p className="text-sm font-bold text-content-muted">{translate('No syllabus data found for this exam.')}</p>
                  </div>
                ) : (
                  trackerData.syllabus.map(subject => (
                    <SubjectAccordion key={subject._id} subject={subject} />
                  ))
                )}
              </div>

            </motion.div>
          ) : !selectedExam ? (
            <div className="py-20 text-center space-y-2 xl:space-y-4">
              <Layers className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-content-muted">{translate('Select an exam above to view its syllabus tracker.')}</p>
            </div>
          ) : null}

        </SubscriptionGuard>
      </div>
    </div>
  );
};

export default SyllabusTrackerPage;
