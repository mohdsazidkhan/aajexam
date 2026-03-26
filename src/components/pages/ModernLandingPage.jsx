'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FaTrophy, FaStar, FaBrain, FaChartLine, FaBook, FaGraduationCap, FaQuestionCircle, FaNewspaper,
    FaArrowRight, FaPlay, FaUsers, FaCheckCircle, FaLightbulb,
    FaChevronDown, FaChevronUp, FaMobileAlt, FaDownload, FaGoogle,
    FaFire, FaGem, FaShieldAlt, FaRupeeSign, FaLevelUpAlt, FaUserGraduate
} from "react-icons/fa";
import UnifiedNavbar from "../UnifiedNavbar";
import UnifiedFooter from "../UnifiedFooter";
import MobileAppWrapper from "../MobileAppWrapper";
import config from '../../lib/config/appConfig';
import API from '../../lib/api';
import LivePrizePool from "../LivePrizePool";
import MonthlyWinnersDisplay from "../MonthlyWinnersDisplay";
import EducationalContent from "../EducationalContent";

const ModernLandingPage = ({ educationalContent }) => {
    const [stats, setStats] = useState({
        activeStudents: "10K+",
        levels: "10",
        quizCategories: "15+",
        subcategories: "100+",
        totalQuizzes: "2,000+",
        totalQuestions: "12,000+",
        quizzesTaken: "5K+",
        totalExams: "50+",
        monthlyPrizePool: 0,
        activeProUsers: 0
    });

    const [openFaq, setOpenFaq] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/home");
            return;
        }

        fetchStats();
    }, [router]);

    const fetchStats = async () => {
        try {
            const statsRes = await API.getPublicLandingStats();
            if (statsRes.success) {
                const formatNumber = (num) => {
                    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
                    return num.toString();
                };

                setStats({
                    activeStudents: formatNumber(statsRes.data.activeStudents),
                    levels: statsRes.data.levels,
                    quizCategories: formatNumber(statsRes.data.quizCategories),
                    subcategories: formatNumber(statsRes.data.subcategories),
                    totalQuizzes: formatNumber(statsRes.data.totalQuizzes),
                    totalQuestions: formatNumber(statsRes.data.totalQuestions),
                    quizzesTaken: formatNumber(statsRes.data.quizzesTaken),
                    totalExams: statsRes.data.totalExams,
                    monthlyPrizePool: statsRes.data.activeProUsers * config.QUIZ_CONFIG.PRIZE_PER_PRO,
                    activeProUsers: statsRes.data.activeProUsers
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const contentCards = [
        {
            title: "Categories",
            description: "Browse by subject",
            icon: FaBook,
            gradient: "from-primary-500 to-secondary-600",
            hoverColor: "indigo",
            link: "/categories",
            count: stats.quizCategories
        },
        {
            title: "Levels",
            description: "10-level system",
            icon: FaTrophy,
            gradient: "from-primary-500 to-primary-600",
            hoverColor: "yellow",
            link: "/levels",
            count: "10"
        },
        {
            title: "Quizzes",
            description: "Practice tests",
            icon: FaQuestionCircle,
            gradient: "from-secondary-500 to-cyan-600",
            hoverColor: "blue",
            link: "/quizzes",
            count: stats.totalQuizzes
        },
        {
            title: "Govt. Exams",
            description: "Real exam prep",
            icon: FaGraduationCap,
            gradient: "from-green-500 to-emerald-600",
            hoverColor: "green",
            link: "/exams",
            count: stats.totalExams
        },
        {
            title: "Articles",
            description: "Educational blogs",
            icon: FaNewspaper,
            gradient: "from-pink-500 to-rose-600",
            hoverColor: "pink",
            link: "/articles",
            count: "90+"
        },
    ];

    const features = [
        {
            icon: FaTrophy,
            title: "Daily & Weekly Challenges",
            description: "Win quick rewards with our new daily and weekly prize pools"
        },
        {
            icon: FaRupeeSign,
            title: "Challenge Rewards",
            description: "Daily, Weekly & Monthly rewards for top performers from dynamic prize pools"
        },
        {
            icon: FaChartLine,
            title: "Performance Analytics",
            description: "Track your progress with detailed insights and recommendations"
        },
        {
            icon: FaMobileAlt,
            title: "Mobile App",
            description: "Learn on-the-go with our Android and iOS applications"
        },
        {
            icon: FaShieldAlt,
            title: "Expert Content",
            description: "Curated by subject matter experts and verified educators"
        }
    ];

    const faqs = [
        {
            question: "How does the level system work?",
            answer: "Start at Level 1 (Rookie) and progress through 10 levels by completing quizzes with high accuracy. Each level requires a specific number of high-score quizzes to unlock the next level."
        },
        {
            question: "Are the quizzes free?",
            answer: "Yes! We offer a free tier with access to quizzes. The Pro subscription unlocks advanced features, more quizzes, and exclusive content."
        },
        {
            question: "How do I win rewards?",
            answer: `Reach Level ${config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} to unlock competitions. Complete the required number of high-score quizzes (≥${config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% accuracy) for Daily, Weekly, or Monthly challenges to qualify for prize pools!`
        },
        {
            question: "Can I practice for specific government exams?",
            answer: "Absolutely! We have dedicated sections for SSC, UPSC, Banking, Railway, and other government exams with real exam patterns and previous year questions."
        },
        {
            question: "Is there a mobile app?",
            answer: "Yes! Download our app from Google Play Store for Android. iOS version coming soon."
        },
        {
            question: "How does the referral program work?",
            answer: "Invite friends using your unique referral code. Earn rewards when they purchase subscriptions."
        }
    ];

    return (
        <MobileAppWrapper title="AajExam" showHeader={false}>
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <UnifiedNavbar isLandingPage={true} />

                {/* Hero Section - Modern Split Layout */}
                <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-red-900/20 pt-5 pb-5 lg:pt-10 lg:pb-10">
                    {/* Animated Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-primary-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>

                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">

                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 via-red-500 to-primary-500 text-white rounded-full text-sm font-bold mb-3 shadow-lg animate-bounce">
                                <FaFire className="w-4 h-4" />
                                <span>Join {stats.activeStudents} Active Learners!</span>
                            </div>

                            <h1 className="text-2xl lg:text-3xl xl:text-4xl lg:text-6xl font-extrabold mb-3 leading-tight">
                                <span className="text-primary-600 via-primary-500 text-primary-600 dark:text-primary-400 dark:via-primary-400 dark:to-red-400">
                                    Daily, Weekly & Monthly Challenges
                                </span>{" "}
                                <span className="text-gray-900 dark:text-white">
                                    Win Real Rewards
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-2 mx-auto lg:mx-0">
                                Practice with {stats.totalQuizzes} quizzes across {stats.quizCategories} categories.
                                Compete on multiple leaderboards and win from active prize pools every day, week, and month!
                            </p>
                            {/* Live Prize Pool Component */}
                            <div className="mt-5 mb-5 mx-auto lg:mx-0">
                                <LivePrizePool isLandingPage={true} />
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                                <Link
                                    href="/register"
                                    className="mx-auto lg:mx-0
             inline-flex items-center justify-center
             min-h-[48px] min-w-[48px]
             px-8 py-4
             bg-gradient-to-r from-primary-600 to-secondary-600
             text-white rounded-xl
             font-bold text-lg
             hover:from-primary-700 hover:to-secondary-700
             transition-all duration-300
             transform hover:scale-105
             shadow-xl
             touch-manipulation"
                                    aria-label="Start learning for free"
                                >
                                    <span>Start Learning Free</span>
                                    <FaArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                                </Link>

                                <button
                                    onClick={() => document.getElementById('content-explorer')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-8 py-4 border-2 border-indigo-600 text-primary-600 dark:text-red-400 dark:border-indigo-400 rounded-xl font-bold text-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all duration-300 flex items-center justify-center"
                                >
                                    <FaPlay className="mr-2" />
                                    <span>Explore Content</span>
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <FaCheckCircle className="text-green-500" />
                                    <span>100% Free to Start</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCheckCircle className="text-green-500" />
                                    <span>No Credit Card Required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCheckCircle className="text-green-500" />
                                    <span>Expert-Curated Content</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Monthly Winners Section */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-5 lg:py-10 px-4 sm:px-6 lg:px-10">
                    <div className="container mx-auto mb-8 sm:mb-12">
                        <MonthlyWinnersDisplay />
                    </div>
                </div>

                {/* Educational Content for SEO - positioned specifically after winners */}
                <EducationalContent content={educationalContent} />



                {/* Content Explorer */}
                <section id="content-explorer" className="py-16 md:py-24 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                                <span className="text-transparent text-primary-600 via-primary-500 text-primary-600 dark:text-primary-400 dark:via-primary-400 dark:text-red-400">
                                    Explore Our Content
                                </span>
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mx-auto">
                                Thousands of quizzes, exams, and articles to boost your knowledge
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {contentCards.map((card, idx) => (
                                card.comingSoon ? (
                                    <div key={idx} className={`group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-${card.hoverColor}-500 cursor-not-allowed opacity-75`}>
                                        <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                            <card.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className={`text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center group-hover:text-${card.hoverColor}-600 dark:group-hover:text-${card.hoverColor}-400 transition-colors`}>
                                            {card.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-center mb-3 text-sm">
                                            {card.description}
                                        </p>
                                        <div className={`text-center text-${card.hoverColor}-600 dark:text-${card.hoverColor}-400 font-semibold text-sm`}>
                                            Coming Soon
                                        </div>
                                    </div>
                                ) : (
                                    <Link key={idx} href={card.link}>
                                        <div className={`group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-${card.hoverColor}-500 cursor-pointer`}>
                                            <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                                <card.icon className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className={`text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center group-hover:text-${card.hoverColor}-600 dark:group-hover:text-${card.hoverColor}-400 transition-colors`}>
                                                {card.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-center mb-3 text-sm">
                                                {card.description}
                                            </p>
                                            <div className={`text-center text-${card.hoverColor}-600 dark:text-${card.hoverColor}-400 font-semibold text-sm mb-2`}>
                                                {card.count} available
                                            </div>
                                            <div className={`flex items-center justify-center text-${card.hoverColor}-600 dark:text-${card.hoverColor}-400 font-semibold group-hover:gap-2 transition-all`}>
                                                <span>Explore</span>
                                                <FaArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                                <span className="text-transparent text-primary-600 via-primary-500 text-primary-600 dark:text-primary-400 dark:via-primary-400 dark:text-red-400">
                                    How It Works
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Start your journey in 4 simple steps
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { num: "1", icon: FaUserGraduate, title: "Sign Up Free", desc: "Create your account in seconds" },
                                { num: "2", icon: FaLevelUpAlt, title: "Choose Level", desc: "Start at your skill level" },
                                { num: "3", icon: FaBrain, title: "Take Quizzes", desc: "Practice and improve daily" },
                                { num: "4", icon: FaTrophy, title: "Win Rewards", desc: "Win prizes daily, weekly & monthly" }
                            ].map((step, idx) => (
                                <div key={idx} className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl text-center transform hover:scale-105 transition-all duration-300">
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {step.num}
                                    </div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <step.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                                <span className="text-transparent text-primary-600 via-primary-500 text-primary-600 dark:text-primary-400 dark:via-primary-400 dark:text-red-400">
                                    Why Choose AajExam?
                                </span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center mb-4">
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                                <span className="text-transparent text-primary-600 via-primary-500 text-primary-600 dark:text-primary-400 dark:via-primary-400 dark:text-red-400">
                                    Success Stories
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Hear from students who achieved their goals
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    name: "Annu",
                                    level: "Level 10 - Legend",
                                    quote: "AajExam helped me crack SSC CGL! The level-based system kept me motivated throughout my preparation.",
                                    rating: 5
                                },
                                {
                                    name: "Doli",
                                    level: "Level 10 - Legend",
                                    quote: "The monthly rewards program is amazing! I won ₹1500 last month while preparing for banking exams.",
                                    rating: 5
                                },
                                {
                                    name: "Devanshu Tiwari",
                                    level: "Level 10 - Legend",
                                    quote: "Best platform for government exam preparation. Real exam patterns and detailed analytics helped me improve significantly.",
                                    rating: 5
                                }
                            ].map((testimonial, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <FaStar key={i} className="text-primary-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.level}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mobile App Section */}
                <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-indigo-900/20 dark:to-red-900/20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-400 to-secondary-500 text-white rounded-full text-sm font-bold mb-6">
                                    <FaMobileAlt className="w-4 h-4" />
                                    <span>Now on Play Store!</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6">
                                    <span className="text-transparent text-primary-600 via-primary-500 text-primary-600 dark:text-primary-400 dark:via-primary-400 dark:text-red-400">
                                        Learn Anywhere, Anytime
                                    </span>
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                    Download our mobile app and take your preparation on the go. Practice quizzes, track progress, and compete with friends - all from your smartphone!
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {[
                                        { icon: FaBrain, text: "Offline Mode" },
                                        { icon: FaChartLine, text: "Progress Tracking" },
                                        { icon: FaTrophy, text: "Leaderboards" },
                                        { icon: FaUsers, text: "Social Features" }
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                                                <feature.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href="https://play.google.com/store/apps/details?id=com.subgapp"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl font-bold hover:from-gray-700 hover:to-gray-900 transition-all duration-300 shadow-lg"
                                >
                                    <FaGoogle className="w-6 h-6" />
                                    <div className="text-left">
                                        <div className="text-xs">GET IT ON</div>
                                        <div className="text-lg">Google Play</div>
                                    </div>
                                    <FaDownload className="w-5 h-5" />
                                </a>
                            </div>

                            <div className="relative">
                                <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-xl text-gray-900 dark:text-white">AajExam</div>
                                            <FaMobileAlt className="text-primary-600 text-2xl" />
                                        </div>
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg"></div>
                                                    <div className="flex-1">
                                                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Referral Program */}
                <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="bg-gradient-to-r from-primary-400 text-secondary-500 to-secondary-500 dark:from-primary-600 dark:via-primary-500 dark:to-secondary-600 rounded-3xl p-8 md:p-12 shadow-2xl">
                            <div className="text-center mb-12">
                                <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <FaGem className="text-4xl text-primary-500 dark:text-secondary-400" />
                                </div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                                    Refer & Earn!
                                </h2>
                                <p className="text-xl text-white mx-auto">
                                    Share your referral code and earn wallet rewards when friends join and subscribe
                                </p>
                            </div>

                            <div className="grid grid-cols-1 mb-8">
                                {[
                                    { emoji: "👑", amount: `₹${config.QUIZ_CONFIG.REFERRAL_REWARD_PRO}`, label: `₹${config.SUBSCRIPTION_PLANS.PRO.price} Plan Purchase` }
                                ].map((reward, idx) => (
                                    <div key={idx} className="bg-white/20 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-6 text-center border-2 border-white/30 dark:border-white/20">
                                        <div className="text-4xl mb-3">{reward.emoji}</div>
                                        <div className="text-3xl font-bold text-white mb-2">{reward.amount}</div>
                                        <div className="text-white text-sm">{reward.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center">
                                <Link href="/register">
                                    <button className="px-8 py-4 bg-white dark:bg-gray-900 text-primary-600 dark:text-secondary-400 rounded-xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-xl">
                                        Get Your Referral Code
                                    </button>
                                </Link>
                                <p className="text-white mt-4 text-sm">Minimum withdrawal: ₹{process.env.NEXT_PUBLIC_MIN_WITHDRAW_AMOUNT || '1000'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contribute Section */}
                <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-500 to-secondary-600 dark:from-primary-400 dark:via-primary-400 dark:to-red-400">
                                    Contribute & Grow
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mx-auto">
                                Share your knowledge and help others learn by contributing to our platform
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Create Blog/Articles */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-500 group">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <FaNewspaper className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                                    Create Articles
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                                    Write educational articles and share your knowledge with the community
                                </p>

                                {/* Share Knowledge Badge */}
                                <div className="bg-gradient-to-r from-secondary-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold text-center mb-6 flex items-center justify-center gap-2">
                                    <FaLightbulb className="w-4 h-4" />
                                    <span>Share Your Expertise</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Contribute educational articles</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Help the community learn</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Build your reputation</span>
                                    </li>
                                </ul>

                                <Link href="/register">
                                    <button className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-600 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                                        <span>Start Writing</span>
                                        <FaArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>

                            {/* Create Quizzes - With Earning */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-secondary-500 group">
                                <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <FaQuestionCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                                    Create Quizzes
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                                    Design quality quizzes and help others test their knowledge
                                </p>

                                {/* Share Knowledge Badge */}
                                <div className="bg-gradient-to-r from-secondary-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold text-center mb-6 flex items-center justify-center gap-2">
                                    <FaLightbulb className="w-4 h-4" />
                                    <span>Share Your Knowledge</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Create quality quizzes for others</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Top quizzes get featured</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Help students prepare</span>
                                    </li>
                                </ul>

                                <Link href="/register">
                                    <button className="w-full px-6 py-3 bg-gradient-to-r from-secondary-600 to-cyan-600 text-white rounded-xl font-bold hover:from-secondary-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                                        <span>Create Quiz</span>
                                        <FaArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>

                            {/* Share Questions in Community - No Earning */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 group">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <FaUsers className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                                    Community Questions
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                                    Share public questions and help the community grow together
                                </p>

                                {/* Free Badge */}
                                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold text-center mb-6 flex items-center justify-center gap-2">
                                    <FaLightbulb className="w-4 h-4" />
                                    <span>Share Knowledge</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span>Build your profile</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span>Help fellow students</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FaCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                        <span>Earn community badges</span>
                                    </li>
                                </ul>

                                <Link href="/register">
                                    <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                                        <span>Post Question</span>
                                        <FaArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-12 text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                All contributions are reviewed by our team to ensure quality and accuracy
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-4xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                                <span className="text-transparent text-primary-600 via-primary-500 text-primary-600 dark:text-primary-400 dark:via-primary-400 dark:text-red-400">
                                    Frequently Asked Questions
                                </span>
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleFaq(idx)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <span className="font-semibold text-lg text-gray-900 dark:text-white">{faq.question}</span>
                                        {openFaq === idx ? (
                                            <FaChevronUp className="text-primary-600 dark:text-red-400" />
                                        ) : (
                                            <FaChevronDown className="text-gray-400" />
                                        )}
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-10 text-center">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-xl text-white/90 mb-8 mx-auto">
                            Join thousands of students preparing for government exams. Start learning today!
                        </p>
                        <Link href="/register">
                            <button className="px-10 py-5 bg-white text-primary-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                                Get Started - It's Free!
                            </button>
                        </Link>
                        <p className="text-white/80 mt-4 text-sm">No credit card required • Free forever plan available</p>
                    </div>
                </section>

                <UnifiedFooter />
            </div>
        </MobileAppWrapper>
    );
};

export default ModernLandingPage;
