import React from 'react';
import Head from 'next/head';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import { FaExclamationTriangle, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';

export default function Disclaimer() {
    return (
        <MobileAppWrapper title="Disclaimer">
            <Head>
                <title>Disclaimer - Legal Information | AajExam</title>
                <meta name="description" content="Read the legal disclaimer for AajExam. Information about accuracy of content, external links, and the educational nature of our platform." />
                <meta name="keywords" content="disclaimer, legal, AajExam disclaimer, educational disclaimer" />
                <meta property="og:title" content="Disclaimer - AajExam" />
                <meta property="og:description" content="Legal information regarding the accuracy and educational nature of AajExam content." />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://aajexam.com/logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Disclaimer - AajExam" />
                <meta name="twitter:description" content="Legal disclaimer for the AajExam educational platform." />
                <meta name="twitter:image" content="https://aajexam.com/logo.png" />
                <meta name="robots" content="index, follow" />
            </Head>

            <div className="min-h-screen bg-subg-light dark:bg-subg-dark py-12 px-4 lg:px-10">
                <div className="container  bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 lg:p-12">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-4xl" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Disclaimer</h1>
                        <p className="text-gray-500 dark:text-gray-400">Last Updated: February 27, 2026</p>
                    </div>

                    <div className="space-y-8 text-gray-700 dark:text-gray-300">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <FaInfoCircle className="text-blue-500 text-xl" />
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">General Information</h2>
                            </div>
                            <p className="leading-relaxed">
                                The information provided by AajExam ("we," "us," or "our") on our website and mobile application is for general educational purposes only. All information on the platform is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <FaShieldAlt className="text-green-500 text-xl" />
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Educational Nature</h2>
                            </div>
                            <p className="leading-relaxed">
                                AajExam is an educational platform designed to help users prepare for government competitive exams. While our quizzes are based on historical exam patterns and expert research, they do not guarantee success in any official examination. Your performance on AajExam is an indicator of practice levels and should not be taken as a final prediction of official exam results.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">External Links Disclaimer</h2>
                            <p className="leading-relaxed">
                                Our platform may contain links to external websites that are not provided or maintained by or in any way affiliated with AajExam. Please note that AajExam does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Errors and Omissions Disclaimer</h2>
                            <p className="leading-relaxed">
                                While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, AajExam is not responsible for any errors or omissions, or for the results obtained from the use of this information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
                            <p className="leading-relaxed">
                                If you have any questions regarding this disclaimer, please contact us at: <strong>support@mohdsazidkhan.com</strong>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <UnifiedFooter />
        </MobileAppWrapper>
    );
}
