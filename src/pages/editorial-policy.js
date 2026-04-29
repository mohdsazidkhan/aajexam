import { useRouter } from 'next/router';
import { FaShieldAlt, FaCheckCircle, FaUserGraduate, FaBook, FaAward, FaHandshake } from 'react-icons/fa';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

export default function EditorialPolicy() {
    const router = useRouter();

    return (
        <MobileAppWrapper title="Editorial Policy">
            <Seo
                title="Editorial Policy & Content Standards | AajExam"
                description="AajExam's editorial policy: how we research, source, fact-check and verify practice tests, previous year question papers (PYQs), quizzes and study notes for SSC, UPSC, Banking, Railway and State PSC exams."
                canonical="/editorial-policy"
                keywords={['aajexam editorial policy', 'content quality', 'fact checking', 'educational integrity']}
                schemas={generateBreadcrumbSchema([
                  { name: 'Home', url: '/' },
                  { name: 'Editorial Policy', url: '/editorial-policy' }
                ])}
            />

            <div className="min-h-screen ">
                <div className="container mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaShieldAlt className="text-white text-4xl" />
                        </div>
                        <h1 className="text-2xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-700 bg-clip-text text-transparent mb-4">
                            Editorial Policy
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Our Commitment to Quality, Accuracy, and Educational Excellence
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Last Updated: 1st April 2026
                        </p>
                    </div>

                    {/* Mission Statement */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary-500 rounded-full" />
                            Our Mission
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-md lg:text-xl font-bold leading-relaxed">
                            <p>
                                AajExam is committed to providing accurate, comprehensive, and high-quality educational content for government competitive exam preparation. Our editorial policy ensures that every quiz question, study material, and educational resource meets the highest standards of accuracy, relevance, and pedagogical effectiveness.
                            </p>
                            <p>
                                We understand that our users trust us with their exam preparation, and we take this responsibility seriously. Our editorial team works diligently to ensure that all content is factually correct, up-to-date with current exam patterns, and aligned with official syllabus of SSC, UPSC, Banking, Railway, and other government examinations.
                            </p>
                        </div>
                    </div>

                    {/* Content Creation Process */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-16 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-500 rounded-[1.5rem] flex items-center justify-center shadow-duo border-b-4 border-primary-700">
                                <FaBook className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Creation Process</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                            {[
                                { step: 1, title: 'Expert Development', desc: 'Questions created by subject matter experts with extensive experience in government exams.', color: 'bg-primary-500' },
                                { step: 2, title: 'Multi-Level Review', desc: 'Every piece of content undergoes rigorous review by independent subject experts.', color: 'bg-emerald-500' },
                                { step: 3, title: 'Verification', desc: 'Factual information cross-verified with authoritative sources and government publications.', color: 'bg-purple-500' },
                                { step: 4, title: 'Regular Updates', desc: 'Continuous monitoring and updating of syllabus changes and current affairs.', color: 'bg-primary-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all">
                                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-2xl shadow-duo border-b-4 border-black/20`}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quality Standards */}
                    <div className="bg-slate-950 rounded-[3rem] p-4 md:p-8 lg:p-12 mb-16 border-2 border-b-[12px] border-slate-800 shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32" />
                        <h2 className="text-xl lg:text-4xl font-black text-white mb-12 uppercase tracking-tight relative z-10">Quality Standards</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                            {[
                                { title: 'Accuracy', desc: 'Zero tolerance for misinformation', color: 'bg-primary-500' },
                                { title: 'Relevance', desc: 'Aligned with current exam patterns', color: 'bg-emerald-500' },
                                { title: 'Clarity', desc: 'Unambiguous and easily understood', color: 'bg-purple-500' },
                                { title: 'Calibration', desc: 'Appropriately calibrated difficulty', color: 'bg-primary-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-duo-secondary">
                                        <FaCheckCircle className="text-white text-lg" />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{item.title}</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User Feedback */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 lg:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-primary-500 rounded-xl flex items-center justify-center">
                                <FaHandshake className="text-white text-2xl" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">User Feedback Integration</h2>
                        </div>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                            <p>
                                We value feedback from our user community. If you encounter any errors, outdated information, or have suggestions for improvement, we encourage you to report them through our feedback system. Every report is reviewed by our editorial team within 48 hours.
                            </p>
                            <p>
                                Verified errors are corrected immediately, and users who report valid issues are acknowledged in our monthly community updates. This collaborative approach helps us maintain the highest quality standards and ensures our content remains accurate and relevant.
                            </p>
                        </div>
                    </div>

                    {/* Corrections Policy */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Corrections and Updates Policy</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                            <p>
                                When errors are identified, we implement corrections immediately. For minor factual errors, corrections are made silently with internal documentation. For significant errors that may have affected user learning, we:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Immediately correct the content</li>
                                <li>Notify affected users via email when possible</li>
                                <li>Document the correction in our internal quality log</li>
                                <li>Analyze the root cause to prevent similar errors in the future</li>
                            </ul>
                            <p className="mt-4">
                                Major content updates, such as changes in exam patterns or syllabus revisions, are announced through our platform notifications and email newsletters to ensure all users are aware of the changes.
                            </p>
                        </div>
                    </div>

                    {/* Ethical Standards */}
                    <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-3xl p-4 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Ethical Standards</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                            <p>
                                AajExam is committed to maintaining the highest ethical standards in educational content creation:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>No Plagiarism:</strong> All content is original or properly attributed. We do not copy questions from other sources without proper licensing.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>Transparency:</strong> We clearly disclose our content creation process, review mechanisms, and update schedules.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>No Misleading Claims:</strong> We do not make false promises about exam success or guaranteed results. Our platform provides practice and preparation tools, but success depends on individual effort.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>Respect for Intellectual Property:</strong> We respect copyright laws and obtain proper permissions for any third-party content used on our platform.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <div className="bg-primary-500 rounded-[3rem] p-4 md:p-8 lg:p-12 border-b-[12px] border-primary-700 shadow-duo-primary">
                            <h2 className="text-2xl lg:text-5xl font-black mb-6 text-white uppercase tracking-tighter">
                                Questions About Our Policy?
                            </h2>
                            <p className="text-md md:text-xl lg:text-2xl font-bold mb-10 text-white/90 uppercase tracking-widest text-xs">
                                Contact our editorial team at: <strong>support@mohdsazidkhan.com</strong>
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-white text-primary-600 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 transition-all shadow-xl active:translate-y-1 active:shadow-none"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MobileAppWrapper>
    );
}

export async function getStaticProps() {
    return {
        props: {},
        revalidate: 86400
    };
}

