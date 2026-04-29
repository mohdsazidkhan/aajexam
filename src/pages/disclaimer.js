import React from 'react';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import { FaExclamationTriangle, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

export default function Disclaimer() {
    return (
        <MobileAppWrapper title="Disclaimer">
            <Seo
                title="Disclaimer | AajExam"
                description="Legal disclaimer for AajExam covering accuracy of content, external links and the educational nature of our practice tests, PYQs and quizzes."
                canonical="/disclaimer"
                keywords={['aajexam disclaimer', 'educational disclaimer', 'legal disclaimer']}
                schemas={generateBreadcrumbSchema([
                  { name: 'Home', url: '/' },
                  { name: 'Disclaimer', url: '/disclaimer' }
                ])}
            />

            <div className="min-h-screen  font-outfit relative overflow-hidden">
                {/* Background atmosphere */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6 my-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-4 md:p-8 lg:p-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <div className="text-center mb-12">
                            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-duo-primary">
                                <FaExclamationTriangle className="text-white text-3xl" />
                            </div>
                            <h1 className="text-2xl lg:text-4xl xl:text-6xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Disclaimer</h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last Updated: February 27, 2026</p>
                        </div>

                        <div className="space-y-12 relative z-10">
                            {[
                                {
                                    icon: FaInfoCircle,
                                    color: 'bg-primary-500',
                                    title: 'General Information',
                                    content: 'The information provided by AajExam ("we," "us," or "our") on our website and mobile application is for general educational purposes only. All information on the platform is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.'
                                },
                                {
                                    icon: FaShieldAlt,
                                    color: 'bg-emerald-500',
                                    title: 'Educational Nature',
                                    content: 'AajExam is an educational platform designed to help users prepare for government competitive exams. While our quizzes are based on historical exam patterns and expert research, they do not guarantee success in any official examination. Your performance on AajExam is an indicator of practice levels and should not be taken as a final prediction of official exam results.'
                                }
                            ].map((section, idx) => (section &&
                                <section key={idx}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-10 h-10 ${section.color} rounded-xl flex items-center justify-center shadow-duo text-white`}>
                                            <section.icon className="text-xl" />
                                        </div>
                                        <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{section.title}</h2>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg font-bold leading-relaxed">
                                        {section.content}
                                    </p>
                                </section>
                            ))}

                            <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                                <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">External Links Disclaimer</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                    Our platform may contain links to external websites that are not provided or maintained by or in any way affiliated with AajExam. Please note that AajExam does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Errors and Omissions Disclaimer</h2>
                                <p className="text-slate-600 dark:text-slate-400 text-lg font-bold leading-relaxed">
                                    While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, AajExam is not responsible for any errors or omissions, or for the results obtained from the use of this information.
                                </p>
                            </section>

                            <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Contact Us</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">
                                    If you have any questions regarding this disclaimer, please contact us at:<br />
                                    <strong className="text-primary-600 dark:text-primary-400 block mt-2 text-xl">support@mohdsazidkhan.com</strong>
                                </p>
                                <button
                                    onClick={() => (window.location.href = '/')}
                                    className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0 transition-all"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MobileAppWrapper>
    );
}

