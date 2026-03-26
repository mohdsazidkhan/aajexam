import React from 'react';
import Head from 'next/head';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import { FaMosque, FaCheckCircle, FaBookOpen } from 'react-icons/fa';

export default function HalalDisclaimer() {
    return (
        <MobileAppWrapper title="Halal Disclaimer">
            <Head>
                <title>Halal Disclaimer - Ethical Guidelines | SUBG QUIZ</title>
                <meta name="description" content="Learn about SUBG QUIZ's commitment to Halal and ethical educational practices in accordance with Islamic Shariah guidelines." />
                <meta name="keywords" content="halal disclaimer, ethical education, Islamic Shariah, SUBG QUIZ ethics" />
                <meta property="og:title" content="Halal Disclaimer - Ethical Guidelines | SUBG QUIZ" />
                <meta property="og:description" content="Our commitment to Halal and ethical educational practices." />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://subgquiz.com/logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Halal Disclaimer - SUBG QUIZ" />
                <meta name="twitter:description" content="Ethical and Halal educational guidelines for SUBG QUIZ." />
                <meta name="twitter:image" content="https://subgquiz.com/logo.png" />
                <meta name="robots" content="index, follow" />
            </Head>

            <div className="min-h-screen bg-subg-light dark:bg-subg-dark py-12 px-4 lg:px-10">
                <div className="container  bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 lg:p-12 border-t-8 border-green-600">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaMosque className="text-green-600 dark:text-green-400 text-4xl" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Halal Disclaimer</h1>
                        <p className="text-gray-600 dark:text-gray-400 italic">With Qur'an & Hadith Evidence</p>
                    </div>

                    <div className="space-y-8 text-gray-700 dark:text-gray-300">
                        <p className="text-lg leading-relaxed text-center font-medium">
                            We at SUBG QUIZ are committed to ensuring that our platform aligns with the ethical and spiritual guidelines of Islamic Shariah, offering educational quizzes in a way that is Halal, transparent, and fair.
                        </p>

                        <section className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl">
                            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-6 border-b border-green-200 pb-2">Why SUBG QUIZ is Halal:</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                        <FaCheckCircle className="text-green-600" />
                                        1. No Gambling (Maisir)
                                    </h3>
                                    <p className="italic mb-2 text-gray-600 dark:text-gray-400">"O you who have believed, indeed intoxicants, gambling... are but defilement from the work of Satan..." (Surah Al-Ma'idah 5:90)</p>
                                    <p>Our app does not involve any gambling or games of chance. All quizzes are skill-based, and no random prize draws exist.</p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                        <FaCheckCircle className="text-green-600" />
                                        2. Legitimate Service
                                    </h3>
                                    <p className="italic mb-2 text-gray-600 dark:text-gray-400">"The Prophet ﷺ forbade the selling of what is not in your possession." (Bukhari 2087)</p>
                                    <p>Users pay for educational access — levels, chapters, and quizzes. We provide real, structured value in return — not speculative or deceptive gains.</p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                        <FaCheckCircle className="text-green-600" />
                                        3. Rewards Based on Merit
                                    </h3>
                                    <p className="italic mb-2 text-gray-600 dark:text-gray-400">“And that there is not for man except that [good] for which he strives.” (Surah An-Najm 53:39)</p>
                                    <p>Prizes are only awarded based on quiz performance (score), time taken, and number of quizzes played. This reflects Islamic justice — reward for effort.</p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                        <FaCheckCircle className="text-green-600" />
                                        4. No Gharar (Uncertainty)
                                    </h3>
                                    <p>All subscription plans, access levels, and prize conditions are clearly stated. No user is misled or unaware of what they’re paying for.</p>
                                </div>
                            </div>
                        </section>

                        <section className="text-center pt-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Conclusion</h2>
                            <p className="leading-relaxed">
                                The SUBG QUIZ model is designed to be educational, rewarding, and fully Halal, offering transparency and merit-based rewards.
                            </p>
                            <p className="mt-6 text-sm">For Shariah-related inquiries, email: <strong>support@mohdsazidkhan.com</strong></p>
                        </section>
                    </div>
                </div>
            </div>
            <UnifiedFooter />
        </MobileAppWrapper>
    );
}
