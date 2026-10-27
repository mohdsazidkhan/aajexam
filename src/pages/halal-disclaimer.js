import React from 'react';
import PageHero from '@/components/common/ui/PageHero';
import MobileAppWrapper from '../components/common/MobileAppWrapper';
import UnifiedFooter from '../components/common/UnifiedFooter';
import { FaMosque, FaCheckCircle, FaBookOpen } from 'react-icons/fa';
import config from '../lib/config/appConfig';
import Seo from '../components/common/Seo';
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

            <div className="min-h-screen font-outfit relative overflow-hidden">
                {/* Background atmosphere */}

                <div className="container mx-auto pt-2 xl:pt-4">
                    <PageHero
                        icon={FaMosque}
                        title="Halal Disclaimer"
                    />
                </div>
                <div className="py-0 xl:py-6 my-4">
                    <section className="bg-background-surface rounded-3xl p-4 md:p-8 xl:p-12 border border-border-primary relative overflow-hidden">


                        <div className="space-y-12 relative z-10">
                            <p className="text-lg xl:text-xl leading-relaxed text-center font-bold text-content-secondary">
                                We at AajExam are committed to ensuring that our platform aligns with the ethical and spiritual guidelines of Islamic Shariah, offering educational quizzes in a way that is Halal, transparent, and fair.
                            </p>

                            <section className="py-2">
                                <h2 className="text-md md:text-xl md:text-2xl xl:text-3xl font-bold text-content-primary mb-8 tracking-tight flex items-center gap-4">
                                    <div className="w-2 h-10 bg-primary-600 rounded-full" />
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
                                            desc: 'Users pay for educational access. We provide real, structured value in return — not speculative or deceptive gains.'
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
                                        <article key={idx} className="relative pl-8 border-l-4 border-primary-500/20">
                                            <h3 className="text-sm xl:text-xl font-bold text-content-primary mb-3 tracking-tight flex items-center gap-2">
                                                <FaCheckCircle className="text-primary-600 text-lg flex-shrink-0" />
                                                {item.title}
                                            </h3>
                                            {item.evidence && (
                                                <p className="italic mb-3 text-content-muted font-medium text-sm leading-relaxed block bg-background-surface p-4 rounded-lg xl:rounded-xl border border-border-primary">
                                                    {item.evidence}
                                                </p>
                                            )}
                                            <p className="text-content-secondary font-bold">{item.desc}</p>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section className="text-center border-t border-border-primary px-0 py-4 xl:py-8">
                                <h2 className="text-xl md:text-2xl xl:text-3xl font-bold text-content-primary mb-4 tracking-tight">Conclusion</h2>
                                <p className="text-content-secondary text-lg font-bold leading-relaxed mb-8">
                                    The AajExam model is designed to be educational, rewarding, and fully Halal, offering transparency and merit-based rewards.
                                </p>
                                <div className="space-y-6">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted">
                                        For Shariah-related inquiries:<br />
                                        <strong className="text-primary-600 text-sm">{config.CONTACT.EMAIL}</strong>
                                    </p>
                                    <button
                                        onClick={() => (window.location.href = '/')}
                                        className="bg-primary-600 hover:bg-primary-600 text-on-primary px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.08em] text-xs border-b-2 border-primary-600 active:translate-y-1 active:border-b-0 transition-all"
                                    >
                                        Back to Home
                                    </button>
                                </div>
                            </section>
                        </div>
                    </section>
                </div>
            </div>
        </MobileAppWrapper>
    );
}

