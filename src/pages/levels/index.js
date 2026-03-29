import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaTrophy, FaGraduationCap, FaChartLine, FaBook, FaStar, FaRocket, FaInfoCircle } from 'react-icons/fa';
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

            <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark">
                <div className="container mx-auto px-4 lg:px-10 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaTrophy className="text-white text-4xl" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-700 bg-clip-text text-transparent mb-4">
                            10-Level Progression System
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            A Structured Path to Government Exam Success
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-12">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">
                            Understanding the Level System
                        </h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                            <p>
                                AajExam's 10-level progression system is designed to systematically build your knowledge and skills for government competitive examinations. Each level represents a milestone in your preparation journey, with increasing difficulty and complexity that mirrors the actual exam patterns of SSC, UPSC, Banking, and Railway examinations.
                            </p>
                            <p>
                                The system ensures you develop a strong foundation before advancing to complex topics. By requiring a specific number of quiz completions at each level, we guarantee comprehensive coverage of all essential concepts and adequate practice to build confidence and accuracy.
                            </p>
                            <p>
                                This structured approach has helped thousands of students systematically prepare for their target exams, ensuring they don't miss critical topics while building the speed and accuracy required for competitive examinations.
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {levels.map((level) => {
                                const Icon = getIconForLevel(level.emoji);
                                return (
                                    <div
                                        key={level.levelNumber}
                                        onClick={() => router.push(`/levels/${level.levelNumber}`)}
                                        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                                    >
                                        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-primary-500 rounded-xl flex items-center justify-center mb-4" style={{ background: level.color ? `linear-gradient(to right, ${level.color}, ${level.color}CC)` : undefined }}>
                                            <Icon className="text-white text-2xl" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                            Level {level.levelNumber}: {level.name}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            {level.quizzesRequired === 0 ? 'Starting point' : `${level.quizzesRequired} total quizzes required`}
                                        </p>
                                        <button className="text-secondary-600 dark:text-secondary-400 font-semibold hover:underline">
                                            Learn More →
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* How It Works */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-12">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">
                            How the Progression System Works
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Start at Your Current Level</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        All users begin at Level 0 (Starter). This ensures everyone builds a solid foundation regardless of their current knowledge level.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Complete Required Quizzes</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Each level requires completing a specific number of total quizzes. For example, reaching Level 5 requires completing 30 total quizzes across all previous levels.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Automatic Level Advancement</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Once you complete the required number of quizzes, you automatically advance to the next level. There are no additional tests or requirements.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                                    4
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Access Higher Difficulty Content</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Each new level unlocks more challenging quizzes that cover advanced topics and complex question patterns found in actual government exams.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-gradient-to-r from-secondary-50 to-purple-50 dark:from-secondary-900/20 dark:to-purple-900/20 rounded-3xl p-6 lg:p-8 mb-12">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">
                            Benefits of Structured Progression
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">✓</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Comprehensive Coverage</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Ensures you don't skip important foundational topics</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">✓</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Gradual Difficulty Increase</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Builds confidence through manageable progression</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">✓</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Adequate Practice</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Guarantees sufficient repetition for concept mastery</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">✓</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Clear Milestones</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Provides motivation through visible progress tracking</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-primary-100 to-red-100 dark:from-primary-800 dark:to-red-800 rounded-3xl p-8">
                            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
                                Begin at Level 0 and work your way to Legend status
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                            >
                                Start Practicing Now
                            </button>
                        </div>
                    </div>

                    {/* Author Bio */}
                    <AuthorBio />

                    {/* Last Updated */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        Last Updated: February 12, 2026
                    </p>

                </div>
            </div>
            <UnifiedFooter />
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
