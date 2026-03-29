import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaUserGraduate, FaTrophy, FaCode, FaChalkboardTeacher, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import MobileAppWrapper from '../components/MobileAppWrapper';
import UnifiedFooter from '../components/UnifiedFooter';
import { generateBreadcrumbSchema } from '../utils/schema';
import { getCanonicalUrl } from '../utils/seo';

export default function AboutAuthor() {
    const router = useRouter();
    const canonicalUrl = getCanonicalUrl(router.asPath);

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'About the Founder' }
    ]);

    return (
        <MobileAppWrapper title="About the Founder">
            <Head>
                <title>About Mohd Sazid Khan - Founder of AajExam | Educational Technology Expert</title>
                <meta name="description" content="Meet Mohd Sazid Khan, founder of AajExam. Full-stack developer, UDYAM registered entrepreneur, and educational technology expert dedicated to transforming government exam preparation in India through innovative digital solutions." />
                <meta name="keywords" content="Mohd Sazid Khan, AajExam founder, educational technology, government exam platform, full-stack developer, UDYAM entrepreneur" />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content="About Mohd Sazid Khan - Founder of AajExam" />
                <meta property="og:description" content="Educational technology expert and full-stack developer transforming government exam preparation in India." />
                <meta property="og:image" content="https://aajexam.com/logo.png" />
                <meta name="robots" content="index, follow" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>

            <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark">
                <div className="container mx-auto px-4 lg:px-10 py-8">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 bg-gradient-to-r from-secondary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaUserGraduate className="text-white text-5xl" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-secondary-600 via-secondary-500 to-indigo-700 bg-clip-text text-transparent mb-4">
                            Mohd Sazid Khan
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                            Founder & CEO, AajExam
                        </p>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Full-Stack Developer | Educational Technology Expert | UDYAM Registered Entrepreneur
                        </p>
                    </div>

                    {/* About */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">About the Founder</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                            <p>
                                Mohd Sazid Khan is the founder and driving force behind AajExam, India's innovative government exam preparation platform. With a strong background in full-stack web development and a passion for educational technology, Sazid has dedicated his career to making quality exam preparation accessible to students across India.
                            </p>
                            <p>
                                As a UDYAM registered entrepreneur, Sazid combines technical expertise with business acumen to create scalable, user-friendly educational solutions. His vision is to democratize access to high-quality government exam preparation resources, ensuring that students from all backgrounds have the tools they need to succeed in competitive examinations.
                            </p>
                            <p>
                                Under his leadership, AajExam has grown to serve thousands of students preparing for SSC, UPSC, Banking, Railway, and other government examinations. The platform's unique 10-level progression system and comprehensive quiz database reflect his commitment to structured, effective learning methodologies.
                            </p>
                        </div>
                    </div>

                    {/* Expertise */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <FaCode className="text-white text-2xl" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Technical Expertise</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700">
                                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Full-Stack Development</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Expert in modern web technologies including React, Next.js, Node.js, Express, and MongoDB. Specializes in building scalable, high-performance web applications.
                                </p>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Educational Technology</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Deep understanding of learning management systems, gamification, and user engagement strategies in educational platforms.
                                </p>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">System Architecture</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Experienced in designing and implementing robust, secure, and scalable system architectures for educational platforms.
                                </p>
                            </div>

                            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700">
                                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Data Analytics</h3>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Proficient in implementing analytics systems to track user progress, identify learning patterns, and optimize educational outcomes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vision & Mission */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                                <FaTrophy className="text-white text-2xl" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Vision & Mission</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Vision</h3>
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                    To become India's most trusted and comprehensive government exam preparation platform, empowering millions of students to achieve their career goals in public service through innovative technology and quality educational content.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Mission</h3>
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                                    To provide accessible, affordable, and effective exam preparation resources that combine cutting-edge technology with proven pedagogical methods. We aim to bridge the gap between traditional coaching and modern digital learning, making quality education available to students regardless of their geographical or economic constraints.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <FaChalkboardTeacher className="text-white text-2xl" />
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Key Achievements</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">✓</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">UDYAM Registration</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Successfully registered AajExam as a UDYAM enterprise, demonstrating commitment to formal business practices and regulatory compliance.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">✓</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Platform Development</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Designed and developed the entire AajExam platform from scratch, including frontend, backend, database architecture, and deployment infrastructure.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">✓</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Content Curation</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Curated and organized 2000+ quiz questions across multiple subjects and difficulty levels, ensuring comprehensive coverage of government exam syllabus.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">✓</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">User Growth</h3>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Successfully onboarded thousands of students across India, helping them prepare effectively for various government competitive examinations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Philosophy */}
                    <div className="bg-gradient-to-r from-secondary-50 to-purple-50 dark:from-secondary-900/20 dark:to-purple-900/20 rounded-3xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Educational Philosophy</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                            <p>
                                Sazid believes that effective exam preparation requires more than just access to questions—it requires a structured, progressive learning path that builds confidence and competence systematically. This philosophy is embodied in AajExam's unique 10-level progression system.
                            </p>
                            <p>
                                He advocates for a balanced approach that combines technology-enabled convenience with pedagogically sound learning principles. The platform's features—from detailed analytics to gamified progression—reflect his belief that students learn best when they can track their progress, identify weaknesses, and receive immediate feedback.
                            </p>
                            <p>
                                Above all, Sazid is committed to maintaining the highest standards of content quality and platform integrity. He personally oversees the editorial process and ensures that all content meets rigorous accuracy and relevance standards.
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Connect with Sazid</h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a
                                href="mailto:support@mohdsazidkhan.com"
                                className="flex items-center gap-3 bg-indigo-500 text-white px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all"
                            >
                                <FaEnvelope className="text-xl" />
                                <span>Email</span>
                            </a>
                            <a
                                href="https://www.linkedin.com/in/mohd-sazid-khan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-secondary-700 text-white px-6 py-3 rounded-xl hover:bg-secondary-800 transition-all"
                            >
                                <FaLinkedin className="text-xl" />
                                <span>LinkedIn</span>
                            </a>
                            <a
                                href="https://github.com/mohdsazidkhan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all"
                            >
                                <FaGithub className="text-xl" />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-800 dark:to-purple-800 rounded-3xl p-8">
                            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                                Join Thousands of Successful Students
                            </h2>
                            <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">
                                Start your government exam preparation journey with AajExam today
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-300 transform hover:scale-105"
                            >
                                Get Started Now
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
