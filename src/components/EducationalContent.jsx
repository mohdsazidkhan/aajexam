import React from 'react';
import { FaGraduationCap, FaUsers, FaChartLine, FaRocket, FaBook, FaTrophy, FaBullseye, FaLightbulb } from 'react-icons/fa';

const EducationalContent = ({ content }) => {
    // Use default content if API fails
    const defaultContent = {
        platformPurpose: "AajExam is India's premier online platform for government exam preparation, offering comprehensive practice tests and quizzes designed specifically for aspirants preparing for competitive examinations. Our platform combines cutting-edge technology with expert-curated content to provide an unparalleled learning experience. We understand the challenges faced by government exam aspirants and have created a systematic approach to help you achieve your career goals through consistent practice and performance tracking.",

        targetAudience: "Our platform is designed for students and professionals preparing for various government competitive exams including SSC (Staff Selection Commission), UPSC (Union Public Service Commission), Banking exams (IBPS, SBI), Railway Recruitment Board (RRB), State Public Service Commissions, and other central and state government recruitment examinations. Whether you're a fresh graduate or a working professional looking to transition into government service, AajExam provides the tools and resources you need to succeed.",

        educationalBenefits: "Regular practice through our quiz platform offers numerous educational benefits that directly impact your exam performance. Our scientifically designed quizzes help improve knowledge retention through spaced repetition, enhance time management skills crucial for competitive exams, build confidence through progressive difficulty levels, and identify weak areas that need focused attention. The platform tracks your performance metrics including accuracy rates, speed, and topic-wise strengths, enabling data-driven preparation strategies.",

        learningMethodology: "AajExam employs a unique 10-level progression system that mirrors the journey from beginner to expert. Each level is carefully calibrated to match your growing competence, with quizzes becoming progressively more challenging as you advance. Our methodology is based on three core principles: consistent practice (regular quiz attempts build muscle memory and reduce exam anxiety), performance analytics (detailed insights help you understand your strengths and weaknesses), and competitive learning (leaderboards and monthly challenges motivate continuous improvement)."
    };

    const data = content || defaultContent;

    const features = [
        {
            icon: <FaRocket className="text-4xl text-orange-700 dark:text-yellow-400" />,
            title: "Level-Based Progression",
            description: "Advance through 10 carefully designed levels from beginner to expert"
        },
        {
            icon: <FaBook className="text-4xl text-blue-600 dark:text-blue-400" />,
            title: "Comprehensive Coverage",
            description: "Complete syllabus coverage for SSC, UPSC, Banking, and Railway exams"
        },
        {
            icon: <FaChartLine className="text-4xl text-green-600 dark:text-green-400" />,
            title: "Performance Analytics",
            description: "Track your progress with detailed insights and performance metrics"
        },
        {
            icon: <FaTrophy className="text-4xl text-orange-700 dark:text-yellow-400" />,
            title: "Monthly Rewards",
            description: "Compete on leaderboards and win exciting rewards every month"
        }
    ];

    return (
        <section className="educational-content bg-gradient-to-br from-yellow-50 via-blue-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-5 lg: py-20 px-4">
            <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                {/* Main Heading with Gradient */}
                <div className="text-center mb-8 lg:mb-16 animate-fade-in">
                    <div className="inline-block mb-0 lg:mb-4">
                        <FaGraduationCap className="text-3xl lg:text-6xl text-orange-700 dark:text-yellow-400 mx-auto mb-4" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold bg-gradient-to-r from-yellow-600 to-red-600 dark:from-yellow-400 dark:to-red-400 bg-clip-text text-transparent mb-4">
                        Exam Preparation & Quiz Platform
                    </h1>
                    <p className="text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 font-medium">
                        Your Complete Solution for Competitive Exam Success
                    </p>
                </div>

                {/* Content Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Platform Purpose Card */}
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg mr-4">
                                <FaBullseye className="text-3xl text-orange-700 dark:text-yellow-400" />
                            </div>
                            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                About AajExam Platform
                            </h2>
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {data.platformPurpose}
                        </p>
                    </div>

                    {/* Target Audience Card */}
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                                <FaUsers className="text-3xl text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                Who Should Use This Platform?
                            </h2>
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {data.targetAudience}
                        </p>
                    </div>

                    {/* Educational Benefits Card */}
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mr-4">
                                <FaLightbulb className="text-3xl text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                Educational Benefits
                            </h2>
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {data.educationalBenefits}
                        </p>
                    </div>

                    {/* Learning Methodology Card */}
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                                <FaChartLine className="text-3xl text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                Our Learning Methodology
                            </h2>
                        </div>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            {data.learningMethodology}
                        </p>
                    </div>
                </div>

                {/* Platform Features Section */}
                <div className="mt-8 lg:mt-16">
                    <h2 className="text-2xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6 lg:mb-12">
                        Platform Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-gray-200 dark:border-gray-700"
                            >
                                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-8 lg:mt-16 text-center bg-gradient-to-r from-yellow-600 to-red-600 dark:from-yellow-500 dark:to-red-500 rounded-2xl p-5 lg:p-10 shadow-2xl">
                    <p className="text-sm md:text-lg lg:text-xl xl:text-2xl text-white font-medium leading-relaxed">
                        Join thousands of successful candidates who have achieved their government job dreams through AajExam.
                        Start your preparation journey today and experience the difference that structured, data-driven practice can make.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default EducationalContent;
