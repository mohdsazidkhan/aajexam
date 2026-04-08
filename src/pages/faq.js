import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaQuestionCircle, FaGraduationCap, FaCreditCard, FaTrophy, FaUserShield, FaBook, FaChartLine } from 'react-icons/fa';
import MobileAppWrapper from '../components/MobileAppWrapper';
import AuthorBio from '../components/AuthorBio';
import { generateFAQSchema, generateBreadcrumbSchema } from '../utils/schema';
import { getCanonicalUrl } from '../utils/seo';

const FAQ = () => {
    const router = useRouter();
    const canonicalUrl = getCanonicalUrl(router.asPath);

    const faqs = [
        {
            category: 'General',
            icon: FaQuestionCircle,
            questions: [
                {
                    q: 'What is AajExam?',
                    a: 'AajExam is India\'s premier government exam preparation platform offering comprehensive practice tests for SSC, UPSC, Banking, Railway, and state-level competitive examinations. We provide thousands of practice tests designed to systematically improve your exam readiness.'
                },
                {
                    q: 'Who can use AajExam?',
                    a: 'Anyone aged 14 years or older can register and use AajExam. Our platform is designed for students and professionals preparing for government competitive examinations in India.'
                },
                {
                    q: 'Is AajExam free to use?',
                    a: 'Yes! We offer a Free plan that provides access to hundreds of practice tests. For additional features and premium content, we offer Pro subscription plans.'
                },
                {
                    q: 'What exams does AajExam cover?',
                    a: 'We cover all major government competitive exams including SSC (CGL, CHSL, MTS), UPSC (Prelims, Mains), Banking (IBPS PO, Clerk, SBI), Railway (RRB NTPC, Group D), and various state-level examinations. Our question bank includes General Intelligence & Reasoning, Quantitative Aptitude, English Language, General Awareness, and Current Affairs.'
                }
            ]
        },
        {
            category: 'Exam Preparation',
            icon: FaGraduationCap,
            questions: [
                {
                    q: 'How does the exam preparation system work?',
                    a: 'Our platform offers structured practice tests that cover the full syllabus of major government exams. Tests are organized by exam type, subject, and difficulty. You can track your progress through detailed analytics and improve systematically.'
                },
                {
                    q: 'Can I retake tests?',
                    a: 'Yes! You can retake tests to improve your understanding and scores. However, only your first attempt counts toward leaderboard rankings to maintain fairness.'
                },
                {
                    q: 'How are practice tests structured?',
                    a: 'Each practice test contains multiple-choice questions covering specific topics or exam patterns. Tests are timed to simulate real exam conditions. After completion, you receive detailed performance analytics including accuracy rate, time management, topic-wise breakdown, and comparative rankings.'
                }
            ]
        },
        {
            category: 'Subscriptions & Payments',
            icon: FaCreditCard,
            questions: [
                {
                    q: 'What are the different subscription plans?',
                    a: 'We offer Free and Pro plans. The Free plan gives access to free practice tests for all exams. The Pro plan unlocks all premium tests, detailed score analysis, section-wise tracking, and additional features. Visit our pricing page for current rates.'
                },
                {
                    q: 'Are subscription fees refundable?',
                    a: 'No. All subscription fees are non-refundable as stated in our Terms & Conditions. This policy applies regardless of usage, performance, or account status changes.'
                },
                {
                    q: 'How do I upgrade my subscription?',
                    a: 'You can upgrade your subscription anytime through your account dashboard. The upgrade takes effect immediately, and you\'ll gain access to premium content right away.'
                },
                {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major payment methods through our secure payment partner PayU, including credit/debit cards, UPI, net banking, and digital wallets.'
                }
            ]
        },
        {
            category: 'Monthly Recognition Program',
            icon: FaTrophy,
            questions: [
                {
                    q: 'How does the monthly recognition program work?',
                    a: 'Our monthly program recognizes top performers who demonstrate exceptional dedication and accuracy. Eligible PRO users who achieve top scores win prizes from a dynamic prize pool. Eligibility requires an active PRO subscription and consistent high-accuracy performance in the current month.'
                },
                {
                    q: 'When are monthly recognitions distributed?',
                    a: 'Recognition is processed within 7 business days after the month ends. Winners are notified via email and must provide verified bank details for payout processing.'
                },
                {
                    q: 'Do my achievements carry over to the next month?',
                    a: 'No. All monthly progress metrics reset on the 1st of each month. Each month is an independent recognition period. However, your overall progress and total test count are permanent.'
                },
                {
                    q: 'Can I be disqualified from recognition?',
                    a: 'Yes. We maintain strict anti-fraud measures. Any attempt to cheat, use automated tools, create multiple accounts, or manipulate the system will result in immediate disqualification and permanent account suspension.'
                }
            ]
        },
        {
            category: 'Account & Privacy',
            icon: FaUserShield,
            questions: [
                {
                    q: 'How is my personal data protected?',
                    a: 'We use industry-standard security measures including HTTPS encryption, hashed passwords, and secure data storage. We never sell your personal information to third parties. Read our Privacy Policy for complete details on data collection and usage.'
                },
                {
                    q: 'Can I delete my account?',
                    a: 'Yes. You can request account deletion by contacting our support team at support@mohdsazidkhan.com. Note that some data may be retained for legal compliance and fraud prevention as outlined in our Privacy Policy.'
                },
                {
                    q: 'How do I reset my password?',
                    a: 'Click "Forgot Password" on the login page and follow the instructions sent to your registered email address.'
                },
                {
                    q: 'Can I change my registered email or phone number?',
                    a: 'Yes. You can update your contact information through your account settings. Email changes require verification of both old and new email addresses.'
                }
            ]
        },
        {
            category: 'Performance & Analytics',
            icon: FaChartLine,
            questions: [
                {
                    q: 'What analytics do I get access to?',
                    a: 'You receive comprehensive analytics including: overall accuracy trends, time management metrics, subject-wise performance breakdown, comparative rankings with peers, monthly performance reports, and detailed test-by-test analysis.'
                },
                {
                    q: 'How is my leaderboard rank calculated?',
                    a: 'Leaderboard rankings are based on multiple factors: number of high-score tests, overall accuracy percentage, total tests completed, and consistency of performance. The algorithm prioritizes quality (accuracy) over quantity.'
                },
                {
                    q: 'Can I see my performance history?',
                    a: 'Yes! Your dashboard provides complete performance history including all test attempts, scores, time taken, and progress over time with visual charts and graphs.'
                }
            ]
        },
        {
            category: 'Technical Support',
            icon: FaBook,
            questions: [
                {
                    q: 'What browsers are supported?',
                    a: 'AajExam works best on modern browsers including Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge. We recommend keeping your browser updated to the latest version for optimal performance.'
                },
                {
                    q: 'Is there a mobile app?',
                    a: 'Currently, AajExam is a web-based platform optimized for both desktop and mobile browsers. You can access it from any device with an internet connection.'
                },
                {
                    q: 'I\'m experiencing technical issues. What should I do?',
                    a: 'First, try clearing your browser cache and cookies, or try a different browser. If issues persist, contact our support team at support@mohdsazidkhan.com with details about the problem, your device, and browser information.'
                },
                {
                    q: 'How do I report a test error or incorrect answer?',
                    a: 'If you encounter an error in a test question or believe an answer is incorrect, please report it through the feedback option available after test completion, or email us at support@mohdsazidkhan.com with the test name and question details.'
                }
            ]
        }
    ];

    const allFAQs = faqs.flatMap(category =>
        category.questions.map(q => ({ question: q.q, answer: q.a }))
    );

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'FAQ' }
    ]);

    return (
        <MobileAppWrapper title="Frequently Asked Questions">
            <Head>
                <title>Common Questions & Help Center | AajExam</title>
                <meta name="description" content="Find answers to common questions about AajExam's government exam preparation platform, monthly rewards, and subscription plans." />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content="FAQ - Help Center | AajExam" />
                <meta property="og:description" content="Have questions about preparing for SSC, UPSC, or Banking exams? Check our frequently asked questions." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content="https://aajexam.com/logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="FAQ - AajExam" />
                <meta name="twitter:description" content="Frequently asked questions about government exam preparation on AajExam platform." />
                <meta name="twitter:image" content="https://aajexam.com/logo.png" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqs.flatMap(cat => cat.questions.map(q => ({ question: q.q, answer: q.a }))))) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>

            <div className="min-h-screen ">
                <div className="container mx-auto mt-0">
                    {/* Hero Section */}
                    <div className="text-center mb-8 lg:mb-12">
                        <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaQuestionCircle className="text-white text-3xl" />
                        </div>
                        <h1 className="text-2xl lg:text-3xl xl:text-5xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-700 bg-clip-text text-transparent mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-md lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Find answers to common questions about AajExam platform, subscriptions, and exam preparation
                        </p>
                    </div>

                    {/* FAQ Categories */}
                    {faqs.map((category, catIndex) => {
                        const Icon = category.icon;
                        return (
                            <div key={catIndex} className="mb-8 lg:mb-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <Icon className="text-white text-xl" />
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                                        {category.category}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {category.questions.map((faq, qIndex) => (
                                        <div
                                            key={qIndex}
                                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300"
                                        >
                                            <h3 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-start gap-3">
                                                <span className="text-primary-500 flex-shrink-0">Q:</span>
                                                <span>{faq.q}</span>
                                            </h3>
                                            <p className="text-md lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed pl-8">
                                                <span className="text-green-500 font-semibold">A:</span> {faq.a}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Contact Section */}
                    <div className="text-center mt-12">
                        <div className="bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-800 dark:to-purple-800 rounded-3xl p-4 lg:p-8">
                            <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                                Still Have Questions?
                            </h2>
                            <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
                                Can&apos;t find the answer you&apos;re looking for? Our support team is here to help!
                            </p>
                            <button
                                onClick={() => router.push('/contact')}
                                className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all duration-300 transform hover:scale-105"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* Author Bio */}
                    <AuthorBio />

                    {/* Last Updated */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        Last Updated: March 19, 2026
                    </p>

                </div>
            </div>
        </MobileAppWrapper>
    );
};

export default FAQ;

export async function getStaticProps() {
    return {
        props: {},
        revalidate: 86400 // Revalidate once per day
    };
}

