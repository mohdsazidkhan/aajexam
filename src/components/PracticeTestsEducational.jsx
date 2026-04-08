import React from 'react';
import { FaGraduationCap, FaChartLine, FaTrophy, FaBook, FaCheckCircle, FaRocket, FaBullseye, FaLightbulb, FaClock, FaUsers } from 'react-icons/fa';

const PracticeTestsEducational = ({ levels }) => {
    return (
        <section className="practice-tests-educational bg-white dark:bg-slate-900 py-20 px-4 font-outfit">
            <div className="container mx-auto max-w-6xl">
                {/* Main Heading with Icon */}
                <div className="text-center mb-20 animate-bounce-in">
                    <div className="inline-block mb-6">
                        <div className="w-24 h-24 bg-primary-500 rounded-[2rem] flex items-center justify-center shadow-duo-primary border-4 border-white dark:border-slate-800 rotate-3">
                            <FaTrophy className="text-4xl text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white mb-3 lg:mb-6 uppercase tracking-tighter">
                        Practice <span className="text-primary-700 dark:text-primary-500">Missions</span>
                    </h1>
                    <p className="text-xs lg:text-sm font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed">
                        Master your exams with our unique 10-level progression system designed for focused students.
                    </p>
                </div>

                {/* Educational Content Cards */}
                <div className="space-y-12 mb-20">
                    {/* About Practice Test System */}
                    <div className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 lg:p-14 shadow-2xl border-4 border-b-[12px] border-slate-100 dark:border-slate-700 transition-all hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative z-10">
                            <div className="bg-primary-500 p-8 rounded-[2rem] shadow-duo-primary border-4 border-white dark:border-slate-800 -rotate-3 group-hover:-rotate-6 transition-transform">
                                <FaBook className="text-4xl text-white" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 transition-colors group-hover:text-primary-700 dark:text-primary-500">
                                    The Academy Protocol
                                </h2>
                                <div className="space-y-6 text-sm lg:text-base font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
                                    <p>
                                        AajExam represents a revolutionary approach to government exam preparation, designed for students targeting competitive examinations. Our 10-level progression ensures you develop the skill set required to excel.
                                    </p>
                                    <p>
                                        The foundation lies in progressive difficulty. Our level-based approach ensures a strong foundation before advancing to more complex topics.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Learning Methodology */}
                    <div className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 lg:p-14 shadow-2xl border-4 border-b-[12px] border-slate-100 dark:border-slate-700 transition-all hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative z-10">
                            <div className="bg-primary-500 p-8 rounded-[2rem] shadow-duo-secondary border-4 border-white dark:border-slate-800 rotate-3 group-hover:rotate-6 transition-transform">
                                <FaChartLine className="text-4xl text-white" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 transition-colors group-hover:text-primary-700 dark:text-primary-500">
                                    Adaptive Training
                                </h2>
                                <div className="space-y-6 text-sm lg:text-base font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
                                    <p>
                                        The AajExam system is built on three pillars: consistent practice, deep analytics, and social competition. We encourage daily engagement through portioned quiz sets.
                                    </p>
                                    <p>
                                        Performance analytics provide insights into your weaknesses. Our system monitors accuracy and speed, enabling data-driven decisions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exam Coverage */}
                    <div className="group bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-10 lg:p-14 shadow-xl border-4 border-b-[12px] border-slate-100 dark:border-slate-800 transition-all hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-24 lg:w-48 h-24 lg:h-48 bg-primary-500/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 relative z-10">
                            <div className="bg-primary-500 p-8 rounded-[2rem] shadow-duo-primary border-4 border-white dark:border-slate-800 -rotate-3 group-hover:-rotate-6 transition-transform">
                                <FaGraduationCap className="text-4xl text-white" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 transition-colors group-hover:text-primary-700 dark:text-primary-500">
                                    Syllabus Intelligence
                                </h2>
                                <div className="space-y-6 text-sm lg:text-base font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
                                    <p>
                                        Our tests cover the syllabus of major government competitive examinations including SSC CGL, UPSC Prelims, Banking exams, and Railway Recruitment Board examinations.
                                    </p>
                                    <p>
                                        The question bank is continuously updated to reflect changes in patterns. Our team of subject matter experts reviews content to maintain accuracy and relevance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preparation Tips Section */}
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-4 md:p-8 lg:p-12 border-4 border-b-[16px] border-slate-100 dark:border-slate-700 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
                    <div className="text-center mb-4 lg:mb-8 relative z-10">
                        <h2 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            Student <span className="text-primary-700 dark:text-primary-500">Playbook</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] mt-4">Essential Strategies for Success</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                        {[
                            { title: "Daily Mission", text: "Attempt missions daily to build consistency and momentum.", color: "primary" },
                            { title: "Review Mistakes", text: "Analyze every attempt to understand concepts better.", color: "secondary" },
                            { title: "Accuracy First", text: "Prioritize accuracy over speed initially.", color: "green" },
                            { title: "Watch Progress", text: "Use analytics to identify weak spots.", color: "purple" },
                            { title: "Social Learning", text: "Compete on leaderboards to stay motivated.", color: "slate" },
                            { title: "Recharge", text: "Take scheduled breaks to maintain focus.", color: "primary" },
                        ].map((tip, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-4 lg:p-8 rounded-[2.5rem] border-4 border-b-[8px] border-slate-100 dark:border-slate-800 shadow-xl transition-all hover:-translate-y-2 group/tip active:translate-y-0 active:border-b-4">
                                <h3 className={`inline-flex px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white mb-6 shadow-duo-${tip.color} bg-${tip.color}-500 transform -rotate-2 group-hover/tip:rotate-0 transition-transform`}>
                                    {tip.title}
                                </h3>
                                <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                                    {tip.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PracticeTestsEducational;


