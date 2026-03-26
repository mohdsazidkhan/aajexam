import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaShieldAlt, FaCheckCircle, FaUserGraduate, FaBook, FaAward, FaHandshake } from 'react-icons/fa';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import { generateBreadcrumbSchema } from '../utils/schema';
import { getCanonicalUrl } from '../utils/seo';

export default function EditorialPolicy() {
    const router = useRouter();
    const canonicalUrl = getCanonicalUrl(router.asPath);

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Editorial Policy' }
    ]);

    return (
        <MobileAppWrapper title="Editorial Policy">
            <Head>
                <title>Editorial Policy - Content Quality Standards | AajExam</title>
                <meta name="description" content="Learn about AajExam's editorial policy, content creation standards, quality assurance processes, and commitment to accurate, high-quality government exam preparation materials for SSC, UPSC, Banking, and Railway exams." />
                <meta name="keywords" content="editorial policy, content quality, exam preparation standards, educational integrity, AajExam standards" />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content="Editorial Policy - AajExam" />
                <meta property="og:description" content="Our commitment to delivering accurate, high-quality government exam preparation content through rigorous editorial standards." />
                <meta property="og:image" content="https://aajexam.com/logo.png" />
                <meta name="robots" content="index, follow" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>

            <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
                <div className="container mx-auto px-4 lg:px-10 py-8">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaShieldAlt className="text-white text-4xl" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-4">
                            Editorial Policy
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Our Commitment to Quality, Accuracy, and Educational Excellence
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Last Updated: February 12, 2026
                        </p>
                    </div>

                    {/* Mission Statement */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            AajExam is committed to providing accurate, comprehensive, and high-quality educational content for government competitive exam preparation. Our editorial policy ensures that every quiz question, study material, and educational resource meets the highest standards of accuracy, relevance, and pedagogical effectiveness.
                        </p>
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                            We understand that our users trust us with their exam preparation, and we take this responsibility seriously. Our editorial team works diligently to ensure that all content is factually correct, up-to-date with current exam patterns, and aligned with official syllabus of SSC, UPSC, Banking, Railway, and other government examinations.
                        </p>
                    </div>

                    {/* Content Creation Process */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <FaBook className="text-white text-2xl" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Content Creation Process</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">1</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Expert Content Development</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        All quiz questions and study materials are created by subject matter experts with extensive experience in government exam preparation. Our content creators include former government exam toppers, experienced educators, and subject specialists with advanced degrees in their respective fields.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">2</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Multi-Level Review</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Every piece of content undergoes a rigorous multi-level review process. After initial creation, content is reviewed by at least two independent subject experts to verify accuracy, relevance, and alignment with current exam patterns. This ensures that errors are caught and corrected before publication.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">3</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Fact-Checking and Verification</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        All factual information, dates, statistics, and current affairs content is cross-verified with authoritative sources including official government publications, NCERT textbooks, reputable news agencies, and official exam conducting authority notifications. We maintain a comprehensive reference library for verification purposes.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">4</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Regular Updates</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        We continuously monitor changes in exam patterns, syllabus updates, and current affairs developments. Our content is regularly updated to reflect the latest information and ensure relevance. Major updates are implemented quarterly, while current affairs content is updated weekly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quality Standards */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <FaAward className="text-white text-2xl" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Quality Standards</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <FaCheckCircle className="text-blue-600 text-xl" />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Accuracy</h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    All content must be factually accurate and verified against authoritative sources. Zero tolerance for misinformation.
                                </p>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <FaCheckCircle className="text-green-600 text-xl" />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Relevance</h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Content must align with current exam patterns and syllabus of target government examinations.
                                </p>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <FaCheckCircle className="text-purple-600 text-xl" />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Clarity</h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Questions and explanations must be clear, unambiguous, and easily understandable by target audience.
                                </p>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <FaCheckCircle className="text-yellow-600 text-xl" />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Difficulty Calibration</h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Questions must be appropriately calibrated to match the difficulty level of their assigned level.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* User Feedback */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
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
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
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
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-6 lg:p-8 mb-8">
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

                    {/* Contact */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-3xl p-8">
                            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                                Questions About Our Editorial Policy?
                            </h2>
                            <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
                                Contact our editorial team at: <strong>support@mohdsazidkhan.com</strong>
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-300 transform hover:scale-105"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <UnifiedFooter />
        </MobileAppWrapper>
    );
}

export async function getStaticProps() {
    return {
        props: {},
        revalidate: 86400
    };
}
