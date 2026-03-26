import React from 'react';
import { FaGraduationCap, FaChartLine, FaTrophy, FaBook, FaCheckCircle, FaRocket, FaBullseye, FaLightbulb, FaClock, FaUsers } from 'react-icons/fa';

const PracticeTestsEducational = ({ levels }) => {
    return (
        <section className="practice-tests-educational bg-gradient-to-br from-yellow-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-5 lg: py-20 px-4">
            <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                {/* Main Heading with Icon */}
                <div className="text-center mb-8 lg:mb-16 animate-fade-in">
                    <div className="inline-block mb-0 lg:mb-4">
                        <FaTrophy className="text-6xl text-yellow-500 dark:text-yellow-400 mx-auto mb-4 animate-bounce" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold bg-gradient-to-r from-yellow-600 from-red-600 dark:from-yellow-400 dark:from-red-400 bg-clip-text text-transparent mb-4">
                        Government Exam Practice Tests
                    </h1>
                    <p className="text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 font-medium">
                        Comprehensive 10-Level Progression System for SSC, UPSC, Banking, Railway, and Other Competitive Examinations
                    </p>
                </div>

                {/* Educational Content Cards */}
                <div className="space-y-8 mb-16">
                    {/* About Practice Test System */}
                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-6">
                            <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-xl mr-4">
                                <FaBook className="text-4xl text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                                About Our Practice Test System
                            </h2>
                        </div>
                        <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            <p>
                                AajExam's practice test system represents a revolutionary approach to government exam preparation, designed specifically for aspirants targeting competitive examinations across India. Our unique 10-level progression system has been meticulously crafted based on extensive research into successful exam preparation methodologies and the learning patterns of thousands of successful candidates. Each level represents a carefully calibrated milestone in your journey from beginner to expert, ensuring that you develop the comprehensive skill set required to excel in highly competitive government examinations.
                            </p>
                            <p>
                                The foundation of our practice test system lies in the principle of progressive difficulty and adaptive learning. Unlike traditional study methods that present all content at once, our level-based approach ensures that you build a strong foundation before advancing to more complex topics and question patterns. This systematic progression mirrors the natural learning curve and prevents the overwhelm that many aspirants experience when preparing for multiple subjects simultaneously. Each level introduces new concepts while reinforcing previously learned material, creating a robust knowledge framework that withstands the pressure of actual examination conditions.
                            </p>
                            <p>
                                Our practice tests are designed to simulate real examination conditions as closely as possible, incorporating time constraints, question patterns, difficulty levels, and marking schemes that mirror actual government competitive exams. This realistic simulation helps you develop crucial exam-taking skills including time management, question selection strategy, accuracy under pressure, and the mental stamina required to maintain focus throughout lengthy examination sessions. Regular practice with our tests builds the muscle memory and confidence needed to perform at your peak when it matters most.
                            </p>
                        </div>
                    </div>

                    {/* Learning Methodology */}
                    <div className="group bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100 dark:border-gray-700">
                        <div className="flex items-center mb-6">
                            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-xl mr-4">
                                <FaChartLine className="text-4xl text-orange-700 dark:text-yellow-400" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                                Learning Methodology and Progression System
                            </h2>
                        </div>
                        <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            <p>
                                The AajExam 10-level progression system is built on three fundamental pillars: consistent practice, performance analytics, and competitive learning. Consistent practice forms the backbone of exam success, and our system encourages daily engagement through carefully portioned quiz sets that maintain your momentum without causing burnout. Each quiz is designed to be completed within a specific timeframe, helping you develop the time management skills essential for competitive exams where every second counts.
                            </p>
                            <p>
                                Performance analytics provide you with detailed insights into your strengths and weaknesses across different subjects and topic areas. Our advanced tracking system monitors your accuracy rates, speed, topic-wise performance, and improvement trends over time. This data-driven approach enables you to make informed decisions about where to focus your study efforts, ensuring that you allocate your preparation time most effectively. The analytics dashboard presents this information in easy-to-understand visualizations, making it simple to identify patterns and adjust your strategy accordingly.
                            </p>
                            <p>
                                Competitive learning through our leaderboard system and monthly challenges adds an element of motivation and accountability to your preparation. Competing with peers who share similar goals creates a positive pressure that drives consistent improvement. The monthly reward system recognizes and celebrates top performers, providing tangible incentives for excellence while fostering a community of serious aspirants who support and inspire each other's success.
                            </p>
                        </div>
                    </div>

                    {/* Exam Coverage */}
                    <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 dark:border-gray-700">
                        <div className="flex items-center mb-6">
                            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl mr-4">
                                <FaGraduationCap className="text-4xl text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                                Exam Coverage and Syllabus Alignment
                            </h2>
                        </div>
                        <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            <p>
                                Our practice tests comprehensively cover the syllabus of major government competitive examinations including SSC CGL (Staff Selection Commission Combined Graduate Level), UPSC Prelims (Union Public Service Commission), Banking exams (IBPS PO, SBI Clerk, RBI Assistant), Railway Recruitment Board examinations (RRB NTPC, Group D), State Public Service Commission exams, and numerous other central and state government recruitment tests. Each quiz is carefully aligned with the latest exam patterns and syllabus requirements, ensuring that your preparation remains current and relevant.
                            </p>
                            <p>
                                The question bank is continuously updated to reflect changes in exam patterns, emerging topics, and current affairs that frequently appear in competitive examinations. Our team of subject matter experts regularly reviews and refreshes content to maintain the highest standards of accuracy and relevance. This commitment to quality ensures that you're practicing with questions that truly represent what you'll encounter in your target examination, maximizing the effectiveness of every practice session.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preparation Tips Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-center mb-8">
                        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-xl mr-4">
                            <FaLightbulb className="text-4xl text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                            Preparation Tips for Success
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                        <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="flex items-start space-x-3">
                                <FaCheckCircle className="text-green-500 dark:text-green-400 text-2xl flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Daily Practice Routine</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Attempt at least 2-3 quizzes daily to build consistency and maintain momentum in your preparation journey.</p>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="flex items-start space-x-3">
                                <FaCheckCircle className="text-blue-500 dark:text-blue-400 text-2xl flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Analyze Every Attempt</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Review all incorrect answers thoroughly to understand concepts and avoid repeating the same mistakes.</p>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="flex items-start space-x-3">
                                <FaCheckCircle className="text-yellow-500 dark:text-yellow-400 text-2xl flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Focus on Accuracy First</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Prioritize accuracy over speed initially, then gradually work on improving your solving speed.</p>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="flex items-start space-x-3">
                                <FaCheckCircle className="text-yellow-500 dark:text-yellow-400 text-2xl flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Use Performance Analytics</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Regularly check your analytics dashboard to identify weak topics and adjust your study plan accordingly.</p>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="flex items-start space-x-3">
                                <FaCheckCircle className="text-red-500 dark:text-red-400 text-2xl flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Compete on Leaderboards</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Engage with the community through leaderboards to stay motivated and benchmark your progress.</p>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-gradient-to-br from-yellow-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="flex items-start space-x-3">
                                <FaCheckCircle className="text-red-500 dark:text-red-400 text-2xl flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Take Regular Breaks</h3>
                                    <p className="text-gray-700 dark:text-gray-300">Avoid burnout by taking scheduled breaks to maintain mental freshness and sustained focus.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PracticeTestsEducational;
