'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  ArrowLeft,
  Clock,
  Trophy,
  List,
  Bookmark,
  CircleCheck,
  ChevronRight,
  ShieldCheck,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

import API from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import ProgressBar from '../../../components/ui/ProgressBar';
import Skeleton from '../../../components/Skeleton';

const ExamDetails = ({ initialExam = null, initialPatterns = [], initialError = '', seo, examId }) => {
  const router = useRouter();
  const [exam, setExam] = useState(initialExam);
  const [patterns, setPatterns] = useState(initialPatterns);
  const [loading, setLoading] = useState(!initialPatterns.length && !initialError);
  const [error, setError] = useState(initialError);

  const fetchExamAndPatterns = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      const res = await API.getPatternsByExam(examId);
      if (res?.success) {
        setPatterns(res.data || []);
        if (res.exam) setExam(res.exam);
      } else {
        setError('Failed to load patterns.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (!initialPatterns.length && !initialError) fetchExamAndPatterns();
  }, [initialPatterns.length, initialError, fetchExamAndPatterns]);

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in py-10">
        <Skeleton height="150px" borderRadius="1.5rem" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} height="100px" borderRadius="1.5rem" />)}
        </div>
      </div>
    );
  }

  const examName = exam?.name || 'Government Exam';

  return (
    <div className="space-y-8 animate-fade-in">
      <Head>
        <title>{seo?.title || `${examName} - Patterns | AajExam`}</title>
      </Head>

      {/* --- Breadcrumbs & Back --- */}
      <section className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="font-black">
          <ArrowLeft className="w-5 h-5" />
          GO BACK
        </Button>
      </section>

      {/* --- Exam Hero Card --- */}
      <Card className="bg-gradient-to-br from-primary-500 to-indigo-600 text-white border-none shadow-duo-primary overflow-hidden relative">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" />
            Verified Exam Board
          </div>
          <h1 className="text-xl md:text-2xl lg:text-4xl font-black font-outfit uppercase tracking-tight">{examName}</h1>
          {exam?.code && <p className="text-primary-100 font-black text-lg opacity-80 decoration-primary-300 underline-offset-4">Board Code: {exam.code}</p>}
        </div>
        <Target className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/10 -rotate-12" />
      </Card>

      {/* --- Patterns Overview --- */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg md:text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 font-outfit uppercase tracking-wide">Exam Stages</h2>
          <span className="bg-primary-100 dark:bg-primary-900/30 px-4 py-1 rounded-full text-sm font-black text-primary-600 dark:text-primary-400">
            {patterns.length} MODULES
          </span>
        </div>

        <div className="space-y-4">
          {patterns.map((pattern, idx) => (
            <motion.div
              key={pattern._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group border-2 hover:border-primary-500 transition-all p-0 overflow-hidden shadow-md">
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Info Indicator */}
                  <div className="w-full lg:w-48 bg-gray-50 dark:bg-slate-700/50 p-6 flex flex-col items-center justify-center border-r-0 lg:border-r border-gray-100 dark:border-slate-700 gap-2">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-primary-500 shadow-sm border border-gray-100 dark:border-slate-600">
                      <CircleCheck className="w-8 h-8" />
                    </div>
                    <span className="font-black text-xs text-gray-400 uppercase tracking-widest">Stage {idx + 1}</span>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 p-5 lg:p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 font-outfit uppercase">{pattern.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">{pattern.description || 'Complete this stage to unlock advanced modules.'}</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase leading-none">
                          <Clock className="w-3 h-3" />
                          {formatDuration(pattern.duration || 60)}
                        </div>
                        <div className="flex items-center gap-1 bg-accent-orange/10 px-3 py-1 rounded-full text-[10px] font-black text-accent-orange uppercase leading-none">
                          <Trophy className="w-3 h-3" />
                          {pattern.totalMarks || 100} Marks
                        </div>
                      </div>
                    </div>

                    {/* Sections Preview */}
                    {pattern.sections && pattern.sections.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {pattern.sections.slice(0, 4).map((section, sidx) => (
                          <div key={sidx} className="bg-gray-50 dark:bg-slate-900/50 px-3 py-2 rounded-xl flex items-center justify-between border border-gray-100 dark:border-slate-800">
                            <span className="text-[10px] font-black text-gray-500 uppercase truncate">{section.name || 'Module'}</span>
                            <span className="text-[10px] font-black text-primary-500">{section.totalQuestions}Q</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <ProgressBar progress={0} color="primary" height="h-2" />
                      </div>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => router.push(`/govt-exams/pattern/${pattern._id}/tests`)}
                        className="whitespace-nowrap px-8"
                      >
                        PRACTICE <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExamDetails;

import dbConnect from '../../../lib/db';
import Exam from '../../../models/Exam';
import ExamPattern from '../../../models/ExamPattern';
import PracticeTest from '../../../models/PracticeTest';

export async function getServerSideProps({ params }) {
  const examId = params?.examId;
  if (!examId) return { notFound: true };

  try {
    await dbConnect();
    const patternsDocs = await ExamPattern.find({ exam: examId }).populate('exam', 'name code description').sort({ title: 1 }).lean();
    const patternIds = patternsDocs.map(p => p._id);

    let patterns = [];
    let exam = null;

    if (patternIds.length > 0) {
      const testCounts = await PracticeTest.aggregate([
        { $match: { examPattern: { $in: patternIds } } },
        { $group: { _id: '$examPattern', total: { $sum: 1 } } }
      ]);
      const testMap = Object.fromEntries(testCounts.map(i => [i._id.toString(), i.total]));

      patterns = patternsDocs.map(p => ({
        ...JSON.parse(JSON.stringify(p)),
        testCount: testMap[p._id.toString()] || 0
      }));
      exam = patterns[0]?.exam || null;
    } else {
      exam = JSON.parse(JSON.stringify(await Exam.findById(examId).lean()));
    }

    if (!exam && patterns.length === 0) return { notFound: true };

    return { props: { examId, initialExam: exam, initialPatterns: patterns } };
  } catch (error) {
    console.error('Data pre-render error:', error);
    return { props: { initialError: 'Failed to load data.' } };
  }
}
