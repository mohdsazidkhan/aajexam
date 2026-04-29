import React from 'react';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import { FaMosque, FaCheckCircle, FaBookOpen } from 'react-icons/fa';
import config from '../lib/config/appConfig';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

export default function HalalDisclaimer() {
    return (
        <MobileAppWrapper title="Halal Disclaimer">
            <Seo
                title="Halal Disclaimer & Ethical Guidelines | AajExam"
                description="AajExam's commitment to Halal and ethical educational practices in line with Islamic Shariah guidelines for content, payments and the refer & earn program."
                canonical="/halal-disclaimer"
                keywords={['aajexam halal disclaimer', 'halal edtech', 'ethical education', 'islamic shariah education']}
                schemas={generateBreadcrumbSchema([
                  { name: 'Home', url: '/' },
                  { name: 'Halal Disclaimer', url: '/halal-disclaimer' }
                ])}
            />

            <div className="min-h-screen  font-outfit relative overflow-hidden">
                {/* Background atmosphere */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6 my-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-4 md:p-8 lg:p-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <div className="text-center mb-12">
                            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-duo-secondary">
                                <FaMosque className="text-white text-3xl" />
                            </div>
                            <h1 className="text-2xl lg:text-4xl xl:text-6xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter leading-tight">Halal Disclaimer</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">With Qur&apos;an & Hadith Evidence</p>
                        </div>

                        <div className="space-y-12 relative z-10">
                            <p className="text-lg lg:text-xl leading-relaxed text-center font-bold text-slate-600 dark:text-slate-400">
                                We at AajExam are committed to ensuring that our platform aligns with the ethical and spiritual guidelines of Islamic Shariah, offering educational quizzes in a way that is Halal, transparent, and fair.
                            </p>

                            <section className="bg-slate-50 dark:bg-slate-800/50 p-4 lg:p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800">
                                <h2 className="text-md md:text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                                    <div className="w-2 h-10 bg-emerald-500 rounded-full" />
                                    Why AajExam is Halal
                                </h2>

                                <div className="space-y-10">
                                    {[
                                        {
                                            title: '1. No Gambling (Maisir)',
                                            evidence: '"O you who have believed, indeed intoxicants, gambling... are but defilement from the work of Satan..." (Surah Al-Ma\'idah 5:90)',
                                            desc: 'Our app does not involve any gambling or games of chance. All quizzes are skill-based, and no random prize draws exist.'
                                        },
                                        {
                                            title: '2. Legitimate Service',
                                            evidence: '"The Prophet ï·º forbade the selling of what is not in your possession." (Bukhari 2087)',
                                            desc: 'Users pay for educational access. We provide real, structured value in return â€” not speculative or deceptive gains.'
                                        },
                                        {
                                            title: '3. Rewards Based on Effort',
                                            evidence: '"And that there is not for man except that [good] for which he strives." (Surah An-Najm 53:39)',
                                            desc: 'Referral rewards are earned by genuinely inviting friends who benefit from AajExam and choose to upgrade to PRO. Compensation is tied to real effort, not chance.'
                                        },
                                        {
                                            title: '4. No Gharar (Uncertainty)',
                                            evidence: null,
                                            desc: 'All subscription plans, access levels, and referral reward conditions are clearly stated. No user is misled about what they are paying for or what they will earn.'
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="relative pl-8 border-l-4 border-emerald-500/20">
                                            <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight flex items-center gap-2">
                                                <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                                                {item.title}
                                            </h3>
                                            {item.evidence && (
                                                <p className="italic mb-3 text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed block bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    {item.evidence}
                                                </p>
                                            )}
                                            <p className="text-slate-600 dark:text-slate-400 font-bold">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Conclusion</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg font-bold leading-relaxed mb-8">
                                    The AajExam model is designed to be educational, rewarding, and fully Halal, offering transparency and merit-based rewards.
                                </p>
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        For Shariah-related inquiries:<br />
                                        <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{config.SUPPORT_EMAIL || 'support@mohdsazidkhan.com'}</strong>
                                    </p>
                                    <button
                                        onClick={() => (window.location.href = '/')}
                                        className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0 transition-all"
                                    >
                                        Back to Home
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </MobileAppWrapper>
    );
}

