import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import PageHero from '@/components/common/ui/PageHero';
import { FaShieldAlt, FaCheckCircle, FaUserGraduate, FaBook, FaAward, FaHandshake } from 'react-icons/fa';
import MobileAppWrapper from '../components/common/MobileAppWrapper';
import UnifiedFooter from '../components/common/UnifiedFooter';
import Seo from '../components/common/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';
import config from '../lib/config/appConfig';

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

            <div className="min-h-screen">
                <div className="container mx-auto pt-3 xl:pt-4">
                    <div className="mb-6 xl:mb-8">
                        <PageHero
                            icon={FaShieldAlt}
                            title="Editorial Policy"
                            subtitle="Last Updated: 1st April 2026"
                        />
                    </div>

                    {/* Mission Statement */}
                    <section className="bg-background-surface rounded-3xl p-4 md:p-8 xl:p-12 mb-12 border border-border-primary relative overflow-hidden">

                        <h2 className="text-xl xl:text-4xl font-bold text-content-primary mb-8 tracking-tight flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary-600 rounded-full" />
                            Our Mission
                        </h2>
                        <div className="space-y-6 text-content-secondary text-md xl:text-xl font-bold leading-relaxed">
                            <p>
                                AajExam is committed to providing accurate, comprehensive, and high-quality educational content for government competitive exam preparation. Our editorial policy ensures that every quiz question, study material, and educational resource meets the highest standards of accuracy, relevance, and pedagogical effectiveness.
                            </p>
                            <p>
                                We understand that our users trust us with their exam preparation, and we take this responsibility seriously. Our editorial team works diligently to ensure that all content is factually correct, up-to-date with current exam patterns, and aligned with official syllabus of SSC, UPSC, Banking, Railway, and other government examinations.
                            </p>
                        </div>
                    </section>

                    {/* Content Creation Process */}
                    <section className="bg-background-surface rounded-3xl p-4 md:p-8 xl:p-12 mb-16 border border-border-primary">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-primary-600 rounded-md flex items-center justify-center border-b-2 border-primary-600">
                                <FaBook className="text-white text-2xl" />
                            </div>
                            <h2 className="text-xl xl:text-4xl font-bold text-content-primary tracking-tight">Creation Process</h2>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
                            {[
                                { step: 1, title: 'Expert Development', desc: 'Questions created by subject matter experts with extensive experience in government exams.', color: 'bg-primary-600' },
                                { step: 2, title: 'Multi-Level Review', desc: 'Every piece of content undergoes rigorous review by independent subject experts.', color: 'bg-primary-600' },
                                { step: 3, title:'Verification', desc:'Factual information cross-verified with authoritative sources and government publications.', color:'bg-primary-600'},
                                { step: 4, title: 'Regular Updates', desc: 'Continuous monitoring and updating of syllabus changes and current affairs.', color: 'bg-primary-600' }
                            ].map((item, idx) => (
                                <section key={idx} className="flex gap-6 p-6 rounded-3xl border border-border-primary hover:border-primary-500/30 transition-all">
                                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-2xl border-b-2 border-black/20`}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="text-sm xl:text-xl font-bold text-content-primary mb-2 tracking-tight">{item.title}</h3>
                                        <p className="text-content-muted font-bold">{item.desc}</p>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </section>

                    {/* Quality Standards */}
                    <section className="bg-slate-950 rounded-3xl p-4 md:p-8 xl:p-12 mb-16 border border-slate-800 relative overflow-hidden text-center">
                        <h2 className="text-xl xl:text-4xl font-bold text-white mb-12 tracking-tight relative z-10">Quality Standards</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
                            {[
                                { title: 'Accuracy', desc: 'Zero tolerance for misinformation', color: 'bg-primary-600' },
                                { title: 'Relevance', desc: 'Aligned with current exam patterns', color: 'bg-primary-600' },
                                { title:'Clarity', desc:'Unambiguous and easily understood', color:'bg-primary-600'},
                                { title: 'Calibration', desc: 'Appropriately calibrated difficulty', color: 'bg-primary-600' }
                            ].map((item, idx) => (
                                <section key={idx} className="border border-white/10 p-6 rounded-3xl flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                                        <FaCheckCircle className="text-white text-lg" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-tight mb-1">{item.title}</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.08em]">{item.desc}</p>
                                </section>
                            ))}
                        </div>
                    </section>

                    {/* User Feedback */}
                    <section className="dark:bg-black/90 rounded-3xl p-4 xl:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary-600 rounded-md xl:rounded-md flex items-center justify-center">
                                <FaHandshake className="text-white text-2xl" />
                            </div>
                            <h2 className="text-2xl xl:text-3xl font-bold text-content-primary">User Feedback Integration</h2>
                        </div>
                        <div className="space-y-2 xl:space-y-4 text-content-secondary text-lg leading-relaxed">
                            <p>
                                We value feedback from our user community. If you encounter any errors, outdated information, or have suggestions for improvement, we encourage you to report them through our feedback system. Every report is reviewed by our editorial team within 48 hours.
                            </p>
                            <p>
                                Verified errors are corrected immediately, and users who report valid issues are acknowledged in our monthly community updates. This collaborative approach helps us maintain the highest quality standards and ensures our content remains accurate and relevant.
                            </p>
                        </div>
                    </section>

                    {/* Corrections Policy */}
                    <section className="dark:bg-black/90 rounded-3xl p-4 xl:p-8 mb-8">
                        <h2 className="text-2xl xl:text-3xl font-bold text-content-primary mb-6">Corrections and Updates Policy</h2>
                        <div className="space-y-2 xl:space-y-4 text-content-secondary text-lg leading-relaxed">
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
                    </section>

                    {/* Ethical Standards */}
                    <section className="rounded-3xl p-4 xl:p-8 mb-8">
                        <h2 className="text-2xl xl:text-3xl font-bold text-content-primary mb-6">Ethical Standards</h2>
                        <div className="space-y-2 xl:space-y-4 text-content-secondary text-lg leading-relaxed">
                            <p>
                                AajExam is committed to maintaining the highest ethical standards in educational content creation:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                                    <span><strong>No Plagiarism:</strong> All content is original or properly attributed. We do not copy questions from other sources without proper licensing.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                                    <span><strong>Transparency:</strong> We clearly disclose our content creation process, review mechanisms, and update schedules.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                                    <span><strong>No Misleading Claims:</strong> We do not make false promises about exam success or guaranteed results. Our platform provides practice and preparation tools, but success depends on individual effort.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
                                    <span><strong>Respect for Intellectual Property:</strong> We respect copyright laws and obtain proper permissions for any third-party content used on our platform.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <section className="bg-primary-600 rounded-3xl p-4 md:p-8 xl:p-12 border-primary-600">
                            <h2 className="text-2xl xl:text-5xl font-bold mb-6 text-white tracking-tight">
                                Questions About Our Policy?
                            </h2>
                            <p className="text-md md:text-xl xl:text-2xl font-bold mb-10 text-white tracking-[0.08em] text-xs">
                                Contact our editorial team at: <strong>{config.CONTACT.EMAIL}</strong>
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-background-surface text-primary-600 px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.08em] text-xs hover:bg-background-surface-secondary transition-all active:translate-y-1"
                            >
                                Back to Home
                            </button>
                        </section>
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

