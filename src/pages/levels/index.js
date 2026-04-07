import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaTrophy, FaGraduationCap, FaChartLine, FaBook, FaStar, FaRocket, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import api from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import UnifiedFooter from '../../components/UnifiedFooter';
import AuthorBio from '../../components/AuthorBio';
import { generateCourseSchema, generateBreadcrumbSchema } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';
import dbConnect from '../../lib/db';
import LevelModel from '../../models/Level';

export default function LevelsOverview({ initialLevels = [] }) {
    const router = useRouter();
    const canonicalUrl = getCanonicalUrl(router.asPath);
    const [levels, setLevels] = useState(initialLevels);
    const [loading, setLoading] = useState(initialLevels.length === 0);

    useEffect(() => {
        if (initialLevels.length === 0) {
            fetchLevels();
        }
    }, []);

    const fetchLevels = async () => {
        try {
            setLoading(true);
            const response = await api.getPublicLevels();
            if (response.success) {
                setLevels(response.data);
            }
        } catch (error) {
            console.error('Error fetching levels:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconForLevel = (iconName) => {
        const icons = {
            'school': FaGraduationCap,
            'star': FaStar,
            'rocket-launch': FaRocket,
            'psychology': FaChartLine,
            'trending-up': FaChartLine,
            'emoji-events': FaTrophy,
            'diamond': FaStar,
            'workspace-premium': FaStar,
            'auto-awesome': FaStar,
            'auto-fix-high': FaStar,
            'celebration': FaTrophy
        };
        return icons[iconName] || FaInfoCircle;
    };

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Levels', url: '/levels' },
        { name: 'Overview' }
    ]);

    return (
        <MobileAppWrapper title="Level System Overview">
            <Head>
                <title>10-Level Progression System - Government Exam Preparation | AajExam</title>
                <meta name="description" content="Understand AajExam's unique 10-level progression system for government exam preparation. From Starter to Legend, each level builds your skills for SSC, UPSC, Banking, and Railway exams through structured practice." />
                <meta name="keywords" content="level system, exam preparation levels, SSC preparation stages, UPSC study progression, government exam learning path, quiz difficulty levels" />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content="10-Level Progression System - AajExam" />
                <meta property="og:description" content="Master government exams through our structured 10-level system. Each level builds essential skills for competitive examination success." />
                <meta property="og:image" content="https://aajexam.com/logo.png" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
                {levels.map((lvl) => (
                    <script
                        key={lvl.levelNumber}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(generateCourseSchema({
                                number: lvl.levelNumber,
                                name: lvl.name,
                                description: lvl.description || `Master level ${lvl.levelNumber} of government exam preparation. ${lvl.quizzesRequired} quizzes required.`,
                                quizzesRequired: lvl.quizzesRequired
                            }))
                        }}
                    />
                ))}
            </Head>

            <div className="min-h-screen bg-white dark:bg-slate-950 font-outfit relative overflow-hidden">
                {/* Background atmosphere */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 lg:px-0 relative z-10 mt-4">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaTrophy className="text-white text-4xl" />
                        </div>
                        <h1 className="text-xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">
                            10-Level Progression System
                        </h1>
                        <p className="text-xl lg:text-xl lg:text-3xl font-black text-slate-600 dark:text-slate-400 max-w-3xl mx-auto uppercase tracking-widest text-xs">
                            A Structured Path to Government Exam Success
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-4 md:p-8 lg:p-12 shadow-2xl mb-8 lg:mb-16 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">
                            Understanding the Level System
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg lg:text-xl font-bold leading-relaxed">
                            <p>
                                AajExam&apos;s 10-level progression system is designed to systematically build your knowledge and skills for government competitive examinations. Each level represents a milestone in your preparation journey, with increasing difficulty and complexity that mirrors the actual exam patterns of SSC, UPSC, Banking, and Railway examinations.
                            </p>
                            <p>
                                The system ensures you develop a strong foundation before advancing to complex topics. By requiring a specific number of quiz completions at each level, we guarantee comprehensive coverage of all essential concepts and adequate practice to build confidence and accuracy.
                            </p>
                            <p>
                                This structured approach has helped thousands of students systematically prepare for their target exams, ensuring they don&apos;t miss critical topics while building the speed and accuracy required for competitive examinations.
                            </p>
                        </div>
                    </div>

                    {/* Levels Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        </div>
                    ) : levels.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-3xl">
                            <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
                            <p className="text-xl text-gray-500">No levels available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {levels.map((level) => {
                                const Icon = getIconForLevel(level.emoji);
                                return (
                                    <div
                                        key={level.levelNumber}
                                        onClick={() => router.push(`/levels/${level.levelNumber}`)}
                                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-b-8 border-slate-100 dark:border-slate-800 group active:translate-y-1 active:border-b-2 cursor-pointer"
                                    >
                                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-duo border-2 border-white dark:border-slate-800" style={{ background: level.color ? `linear-gradient(to right, ${level.color}, ${level.color}CC)` : undefined }}>
                                            <Icon className="text-white text-2xl" />
                                        </div>
                                        <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                            Level {level.levelNumber}: {level.name}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">
                                            {level.quizzesRequired === 0 ? 'Starting point' : `${level.quizzesRequired} total quizzes required`}
                                        </p>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
                                            Learn More â†’
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* How It Works */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-16 border-2 border-b-[10px] border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-10 uppercase tracking-tight relative z-10 flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary-500 rounded-full" />
                            How the System Works
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                            {[
                                { step: 1, title: 'Start at Starter', desc: 'All users begin at Level 0 (Starter). This ensures everyone builds a solid foundation regardless of their current knowledge level.', color: 'bg-primary-500' },
                                { step: 2, title: 'Complete Quizzes', desc: 'Each level requires completing a specific number of total quizzes. For example, reaching Level 5 requires completing 30 total quizzes.', color: 'bg-emerald-500' },
                                { step: 3, title: 'Auto Advancement', desc: 'Once you complete the required number of quizzes, you automatically advance to the next level. No additional tests needed.', color: 'bg-purple-500' },
                                { step: 4, title: 'Unlock Difficulty', desc: 'Each new level unlocks more challenging quizzes that cover advanced topics found in actual government exams.', color: 'bg-primary-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all">
                                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-2xl shadow-duo border-b-4 border-black/20`}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-slate-950 rounded-[3rem] p-4 md:p-8 lg:p-12 mb-16 border-2 border-b-[12px] border-slate-800 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

                        <h2 className="text-xl lg:text-4xl font-black text-white mb-12 uppercase tracking-tight relative z-10">
                            Benefits of Structured Progression
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                            {[
                                { title: 'Coverage', desc: 'Ensures foundational mastery' },
                                { title: 'Confidence', desc: 'Gradual complexity curve' },
                                { title: 'Repetition', desc: 'Guarantees concept retention' },
                                { title: 'Motivation', desc: 'Visible progress tracking' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-duo-secondary">
                                        <FaCheckCircle className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{item.title}</h3>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <div className="bg-primary-500 rounded-[3rem] p-4 md:p-8 lg:p-12 border-b-[12px] border-primary-700 shadow-duo-primary">
                            <h2 className="text-2xl lg:text-5xl font-black mb-6 text-white uppercase tracking-tighter">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="text-md md:text-xl lg:text-2xl font-bold mb-10 text-white/90 uppercase tracking-widest text-xs">
                                Begin at Level 0 and work your way to Legend status
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-white text-primary-600 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 transition-all shadow-xl active:translate-y-1 active:shadow-none"
                            >
                                Start Practicing Now
                            </button>
                        </div>
                    </div>

                    {/* Author Bio */}
                    <AuthorBio />

                    {/* Last Updated */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        Last Updated: 1st April 2026
                    </p>

                </div>
            </div>
        </MobileAppWrapper>
    );
}

export async function getStaticProps() {
    try {
        await dbConnect();
        const levels = await LevelModel.find({ isActive: true })
            .sort({ levelNumber: 1 })
            .select('levelNumber name description quizzesRequired emoji color icon')
            .lean();

        // Convert MongoDB ObjectId or Date to serializable strings if necessary
        const serializedLevels = JSON.parse(JSON.stringify(levels));

        return {
            props: {
                initialLevels: serializedLevels
            },
            revalidate: 3600 // Revalidate every hour
        };
    } catch (error) {
        console.error('Error in getStaticProps for levels:', error);
        return {
            props: {
                initialLevels: []
            },
            revalidate: 60
        };
    }
}

