'use client';

import React from 'react';
import Link from 'next/link';
import {
    BookOpen,
    HelpCircle,
    Zap,
    ArrowRight,
    Lightbulb,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyDoseCard({ data, loading }) {
    if (loading) return <DailyDoseSkeleton />;
    if (!data) return null;

    const { featuredMaterial, questionOfDay, factOfDay, targetExam } = data;

    return (
        <div className="relative group">
            {/* Main Container */}
            <div className="bg-background-surface rounded-[2.5rem] border-2 border-b-8 border-border-secondary overflow-hidden shadow-xl transition-all hover:translate-y-[-4px] active:translate-y-[2px] active:border-b-4">

                {/* Header Section */}
                <div className="p-8 bg-gradient-to-br from-primary-500 to-primary-600 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-20 lg:w-32 h-20 lg:h-32 text-white rotate-12" />
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white shadow-inner-duo">
                                <Lightbulb className="w-7 h-7 fill-current" />
                            </div>
                            <div>
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1">Today's Pick</p>
                                <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tighter text-white">Daily Dose</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-start lg:self-center">
                            <span className="text-[10px] font-black px-4 py-2 bg-white/15 backdrop-blur-md text-white border border-white/20 rounded-xl uppercase tracking-widest">
                                TARGET EXAM: {targetExam}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Featured Material Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-700 dark:text-primary-500">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-black text-content-secondary uppercase tracking-[0.2em]">Featured Article</h4>
                            </div>

                            {featuredMaterial ? (
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-[2rem] border-2 border-b-6 border-primary-100 dark:border-primary-900/30 group/card cursor-pointer transition-all"
                                >
                                    <h5 className="text-lg font-black text-content-primary mb-2 group-hover/card:text-primary-700 transition-colors uppercase tracking-tight">
                                        {featuredMaterial.title}
                                    </h5>
                                    <p className="text-sm font-bold text-content-secondary line-clamp-2 mb-6 leading-relaxed">
                                        {featuredMaterial.description}
                                    </p>
                                    <Link
                                        href={`/study-hub?id=${featuredMaterial._id}`}
                                        className="inline-flex items-center gap-3 py-3 px-6 bg-primary-500 text-white text-[10px] font-black rounded-xl border-b-4 border-primary-700 hover:brightness-110 active:border-b-0 uppercase tracking-widest transition-all"
                                    >
                                        START READING <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center p-6 bg-background-page rounded-[2rem] border-2 border-dashed border-border-primary">
                                    <p className="text-xs font-black text-content-muted uppercase tracking-widest text-center">No featured material available for today</p>
                                </div>
                            )}
                        </div>

                        {/* Question of the Day Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-black text-content-secondary uppercase tracking-[0.2em]">Quiz of the Day</h4>
                            </div>

                            {questionOfDay ? (
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="p-6 bg-purple-50 dark:bg-purple-900/10 rounded-[2rem] border-2 border-b-6 border-purple-100 dark:border-purple-900/30 transition-all"
                                >
                                    <p className="text-base font-black text-content-primary mb-6 line-clamp-3 leading-relaxed uppercase tracking-tight">
                                        {questionOfDay.questionText}
                                    </p>
                                    <Link
                                        href={`/quiz/${questionOfDay.quiz}`}
                                        className="inline-flex w-full items-center justify-center gap-3 py-4 bg-purple-500 text-white text-[10px] font-black rounded-xl border-b-4 border-purple-700 hover:brightness-110 active:border-b-0 uppercase tracking-widest transition-all"
                                    >
                                        START QUIZ
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center p-6 bg-background-page rounded-[2rem] border-2 border-dashed border-border-primary">
                                    <div className="p-3 bg-background-page rounded-full mb-2">
                                        <Sparkles className="w-5 h-5 text-content-muted" />
                                    </div>
                                    <p className="text-xs font-black text-content-muted uppercase tracking-widest text-center">New quizzes coming soon</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fact of the Day Footer */}
                    <div className="mt-10 pt-8 border-t-2 border-border-secondary flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.3em]">Did you know?</span>
                        </div>
                        <p className="text-xs font-black text-content-secondary uppercase tracking-widest leading-relaxed max-w-2xl px-4 italic">
                            &ldquo;{factOfDay}&rdquo;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DailyDoseSkeleton() {
    return (
        <div className="w-full h-80 bg-background-page animate-pulse rounded-[2.5rem] border-2 border-border-primary" />
    );
}


