'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  ArrowLeft,
  GraduationCap,
  Building,
  Target,
  Zap,
  Star,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

import API from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import ProgressBar from '../../../components/ui/ProgressBar';
import Skeleton from '../../../components/Skeleton';

const CategoryExams = ({ initialCategory = null, initialExams = [], initialError = '', seo, categoryId }) => {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [exams, setExams] = useState(initialExams);
  const [loading, setLoading] = useState(!initialExams.length && !initialError);
  const [error, setError] = useState(initialError);

  const fetchCategoryAndExams = useCallback(async () => {
    if (!categoryId) return;
    try {
      setLoading(true);
      const res = await API.getExamsByCategory(categoryId);
      if (res?.success) {
        setExams(res.data || []);
        if (res.category) setCategory(res.category);
      } else {
        setError('Failed to load exams.');
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (!initialExams.length && !initialError) fetchCategoryAndExams();
  }, [initialExams.length, initialError, fetchCategoryAndExams]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in py-10">
        <Skeleton height="200px" borderRadius="1.5rem" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" borderRadius="1.5rem" />)}
        </div>
      </div>
    );
  }

  const categoryName = category?.name || 'Government Exams';

  return (
    <div className="space-y-10 animate-fade-in font-outfit">
      <Head>
        <title>{seo?.title || `${categoryName} - AajExam`}</title>
      </Head>

      {/* --- Header Section --- */}
      <section className="space-y-6">
        <button
          onClick={() => router.push('/govt-exams')}
          className="group flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-duo border-2 border-b-4 border-slate-200 dark:border-slate-800 active:translate-y-1 active:border-b-0 transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </button>

        <div className="bg-slate-950 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-14 shadow-2xl relative overflow-hidden border-2 border-b-[12px] border-slate-800">
          {/* Background atmosphere */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary-400">
              <Target className="w-3 h-3" />
              {category?.type || 'Competitive'} Category
            </div>
            <h1 className="text-2xl lg:text-4xl xl:text-6xl font-black text-white uppercase tracking-tighter leading-none">{categoryName}</h1>
            <p className="text-lg font-bold text-slate-400 max-w-2xl leading-relaxed">
              {category?.description || 'Everything you need to master exams in this category. Start your journey today!'}
            </p>
          </div>
          <Building className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 -rotate-12 pointer-events-none" />
        </div>
      </section>

      {/* --- Exams List --- */}
      <section className="space-y-8">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Available Exams</h2>
          <span className="bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border-2 border-slate-50 dark:border-slate-800">
            {exams.length} TOTAL
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
          {exams.map((exam, idx) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div
                onClick={() => router.push(`/govt-exams/exam/${exam._id}`)}
                className="group flex items-center gap-3 lg:gap-6 p-4 lg:p-8 bg-white dark:bg-slate-900 border-2 border-b-8 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl hover:border-primary-500 transition-all cursor-pointer active:translate-y-1 active:border-b-2"
              >
                <div className="w-10 lg:w-20 h-10 lg:h-20 bg-primary-500 rounded-[2rem] flex items-center justify-center text-white font-black text-xl lg:text-3xl group-hover:scale-110 transition-transform shadow-duo-secondary border-b-8 border-primary-700">
                  {exam.code?.[0] || 'E'}
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary-600 transition-colors">
                    {exam.name}
                  </h3>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Zap className="w-3.5 h-3.5 fill-slate-400 stroke-none" />
                      {exam.testCount || 0} Tests
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Star className="w-3.5 h-3.5 fill-slate-400 stroke-none" />
                      {exam.patternCount || 0} Patterns
                    </span>
                  </div>
                </div>

                <div className="w-8 lg:w-12 h-8 lg:h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-duo border-2 border-slate-100 dark:border-slate-800">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {exams.length === 0 && (
          <div className="py-24 text-center space-y-6 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
              <Info className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-black text-slate-400 uppercase tracking-tight">No exams found</h3>
              <p className="text-slate-400 font-bold mt-2">Try another category or search in the Study Hub.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryExams;

import dbConnect from '../../../lib/db';
import Exam from '../../../models/Exam';
import ExamCategory from '../../../models/ExamCategory';
import ExamPattern from '../../../models/ExamPattern';
import PracticeTest from '../../../models/PracticeTest';

export async function getServerSideProps({ params }) {
  const categoryId = params?.categoryId;
  if (!categoryId) return { notFound: true };

  try {
    await dbConnect();
    const examsDocs = await Exam.find({ category: categoryId, isActive: true }).sort({ name: 1 }).lean();
    const examIds = examsDocs.map(e => e._id);

    let exams = [];
    let category = null;

    if (examIds.length > 0) {
      const [patterns, tests] = await Promise.all([
        ExamPattern.aggregate([{ $match: { exam: { $in: examIds } } }, { $group: { _id: '$exam', total: { $sum: 1 } } }]),
        PracticeTest.aggregate([
          { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
          { $unwind: '$pattern' },
          { $match: { 'pattern.exam': { $in: examIds } } },
          { $group: { _id: '$pattern.exam', total: { $sum: 1 } } }
        ])
      ]);

      const patternMap = Object.fromEntries(patterns.map(i => [i._id.toString(), i.total]));
      const testMap = Object.fromEntries(tests.map(i => [i._id.toString(), i.total]));

      exams = examsDocs.map(e => ({
        ...JSON.parse(JSON.stringify(e)),
        patternCount: patternMap[e._id.toString()] || 0,
        testCount: testMap[e._id.toString()] || 0
      }));

      category = JSON.parse(JSON.stringify(await ExamCategory.findById(categoryId).lean()));
    } else {
      category = JSON.parse(JSON.stringify(await ExamCategory.findById(categoryId).lean()));
    }

    if (!category && exams.length === 0) return { notFound: true };

    return { props: { categoryId, initialCategory: category, initialExams: exams } };
  } catch (error) {
    console.error('Data pre-render error:', error);
    return { props: { initialError: 'Failed to load data.' } };
  }
}
