'use client';

import React from 'react';
import {
    GraduationCap,
    Users,
    TrendingUp,
    Zap,
    BookOpen,
    Trophy,
    Target,
    Lightbulb,
    Rocket,
    ShieldCheck,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const EducationalContent = ({ content }) => {
    const defaultContent = {
        platformPurpose: "AajExam is India's premier online platform for government exam preparation, offering comprehensive practice tests designed specifically for aspirants preparing for competitive examinations. Our platform combines cutting-edge technology with expert-curated content to provide an unparalleled learning experience.",
        targetAudience: "Our platform is designed for students and professionals preparing for various government competitive exams including SSC, UPSC, Banking exams, Railway Recruitment Board (RRB), State Public Service Commissions, and other central and state government recruitment examinations.",
        educationalBenefits: "Regular practice through our exam platform offers numerous educational benefits that directly impact your exam performance. Our scientifically designed tests help improve knowledge retention through spaced repetition and enhance time management skills.",
        learningMethodology: "AajExam employs a structured preparation methodology that mirrors the journey from beginner to expert. Each stage is carefully calibrated to match your growing competence, with tests becoming progressively more challenging as you advance."
    };

    const data = content || defaultContent;

    const features = [
        {
            icon: Rocket,
            title: "Exam Preparation",
            description: "Structured preparation path for SSC, UPSC, Banking & Railway exams.",
            color: "text-primary-600",
            bg: "bg-primary-50 dark:bg-primary-900/10"
        },
        {
            icon: BookOpen,
            title: "Knowledge Codex",
            description: "Full syllabus infiltration for SSC, UPSC, Banking, and Railways.",
            color: "text-primary-600",
            bg: "bg-primary-50 dark:bg-primary-900/10"
        },
        {
            icon: TrendingUp,
            title: "Data Analytics",
            description: "Live performance Stats and precision accuracy mapping.",
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/10"
        },
        {
            icon: Trophy,
            title: "Sector Rewards",
            description: "Dominate the leaderboards and claim monthly recruitment bonuses.",
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/10"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <section className="font-outfit overflow-hidden py-24 px-4  dark:">
            <div className="mx-auto space-y-24">

                {/* Header Section */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-background-surface-secondary border-2 border-border-primary"
                    >
                        <Zap className="w-4 h-4 text-primary-600 fill-current" />
                        <span className="text-[10px] font-black text-content-secondary uppercase tracking-[0.3em]">Operational Briefing</span>
                    </motion.div>

                    <div className="space-y-2">
                        <h1 className="text-xl lg:text-5xl font-black text-content-primary uppercase tracking-tighter leading-none">
                            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-500">AajExam</span> Matrix
                        </h1>
                        <p className="text-sm lg:text-xl font-bold text-content-secondary dark:text-slate-500 max-w-2xl mx-auto uppercase tracking-widest">
                            High-Precision Preparation for Global Competitive Dominance
                        </p>
                    </div>
                </div>

                {/* Core Intel Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {[
                        { title: "Mission Objective", content: data.platformPurpose, icon: Target, color: "primary" },
                        { title: "Target Users", content: data.targetAudience, icon: Users, color: "secondary" },
                        { title: "Tactical Benefits", content: data.educationalBenefits, icon: Sparkles, color: "emerald" },
                        { title: "Study Methodology", content: data.learningMethodology, icon: ShieldCheck, color: "purple" }
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -8 }}
                            className="bg-background-surface p-10 rounded-[2.5rem] border-2 border-b-10 border-border-primary shadow-duo transition-all"
                        >
                            <div className="flex items-start gap-6">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border-2 border-slate-50 dark:border-slate-700 shadow-inner bg-slate-50 dark:bg-slate-950`}>
                                    <card.icon className={`w-8 h-8 text-${card.color}-500`} />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-md md:text-xl lg:text-2xl font-black text-content-primary uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm font-bold text-content-secondary dark:text-slate-500 leading-relaxed uppercase tracking-wide">
                                        {card.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Features Matrix */}
                <div className="space-y-12">
                    <div className="text-center">
                        <h2 className="text-xl lg:text-xl lg:text-3xl font-black text-content-primary uppercase tracking-tight">Platform Sub-Systems</h2>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                                className={`bg-background-surface border-2 border-b-8 border-border-primary bg-white dark:bg-slate-900 shadow-duo flex flex-col items-center text-center space-y-6 group`}
                            >
                                <div className={`w-20 h-20 rounded-[2rem] ${feature.bg} flex items-center justify-center transition-transform group-hover:rotate-12`}>
                                    <feature.icon className={`w-10 h-10 ${feature.color}`} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black text-content-primary uppercase tracking-tight">
                                        {feature.title}
                                    </h4>
                                    <p className="text-[10px] font-bold text-content-secondary dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Final Directive */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative p-12 bg-gradient-to-r from-primary-600 to-primary-600 rounded-[3rem] text-white border-b-12 border-primary-800 shadow-2xl overflow-hidden group cursor-pointer"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-white/20 transition-all" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h2 className="text-xl lg:text-3xl font-black uppercase tracking-tighter">Enlist in the Elite</h2>
                            <p className="text-sm font-bold text-white/80 uppercase tracking-widest max-w-xl">
                                Join 100,000+ candidates already optimizing their cerebral performance. Your government recruitment mission begins now.
                            </p>
                        </div>
                        <button className="px-10 py-5 bg-white text-primary-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-duo hover:translate-y-1 transition-all flex items-center gap-4">
                            Access Terminal <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default EducationalContent;


