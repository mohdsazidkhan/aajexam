import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaRocket, FaBook, FaChartLine, FaTrophy, FaCheckCircle } from 'react-icons/fa';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import UnifiedFooter from '../../components/UnifiedFooter';
import AuthorBio from '../../components/AuthorBio';
import { generateCourseSchema, generateBreadcrumbSchema } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';
import dbConnect from '../../lib/db';
import LevelModel from '../../models/Level';

export default function LevelPage({ level }) {
    const router = useRouter();
    const canonicalUrl = getCanonicalUrl(router.asPath);

    // Map iconName string to actual icon component
    const iconMap = {
        'FaRocket': FaRocket,
        'FaBook': FaBook,
        'FaChartLine': FaChartLine,
        'FaTrophy': FaTrophy
    };

    const IconComponent = iconMap[level.iconName] || FaRocket;

    const courseSchema = generateCourseSchema(level);
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Levels', url: '/levels' },
        { name: `Level ${level.number}` }
    ]);

    return (
        <MobileAppWrapper title={`Level ${level.number}: ${level.name}`}>
            <Head>
                <title>{`Level ${level.number}: ${level.name} - ${level.title} | AajExam`}</title>
                <meta name="description" content={level.metaDescription} />
                <meta name="keywords" content={level.keywords} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={`Level ${level.number}: ${level.name} - AajExam`} />
                <meta property="og:description" content={level.metaDescription} />
                <meta property="og:image" content="https://subgquiz.com/logo.png" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>

            <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
                <div className="container mx-auto px-4 lg:px-10 py-8">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className={`w-20 h-20 bg-gradient-to-r ${level.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                            <IconComponent className="text-white text-4xl" />
                        </div>
                        <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-4">
                            Level {level.number}: {level.name}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            {level.subtitle}
                        </p>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                            {level.quizzesRequired === 0 ? 'Starting Point' : `${level.quizzesRequired} Total Quizzes Required`}
                        </p>
                    </div>

                    {/* Overview */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Overview</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                            {level.overview.map((para, idx) => (
                                <p key={idx}>{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Topics Covered */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Topics Covered</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {level.topics.map((topic, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Learning Outcomes</h2>
                        <div className="space-y-3">
                            {level.outcomes.map((outcome, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                                        {idx + 1}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-lg">{outcome}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exam Relevance */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Exam Relevance</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                            {level.examRelevance.map((para, idx) => (
                                <p key={idx}>{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Study Tips */}
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-6">Study Tips for This Level</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {level.studyTips.map((tip, idx) => (
                                <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700">
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{tip.title}</h3>
                                    <p className="text-gray-700 dark:text-gray-300">{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        {level.number > 0 && (
                            <button
                                onClick={() => router.push(`/levels/${level.number - 1}`)}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                                ← Previous Level
                            </button>
                        )}
                        {level.number < 10 && (
                            <button
                                onClick={() => router.push(`/levels/${level.number + 1}`)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all ml-auto"
                            >
                                Next Level →
                            </button>
                        )}
                    </div>

                    {/* Author Bio */}
                    <AuthorBio />

                    {/* Last Updated */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        Last Updated: February 12, 2026
                    </p>

                </div>
            </div>
            <UnifiedFooter />
        </MobileAppWrapper>
    );
}

export async function getStaticPaths() {
    try {
        await dbConnect();
        const activeLevels = await LevelModel.find({ isActive: true }).select('levelNumber').lean();

        const paths = activeLevels.map((lvl) => ({
            params: { level: lvl.levelNumber.toString() }
        }));
        return { paths, fallback: 'blocking' };
    } catch (error) {
        console.error('Error in getStaticPaths:', error);
    }

    // Fallback paths if DB is inaccessible during build
    return {
        paths: Array.from({ length: 11 }, (_, i) => ({
            params: { level: i.toString() }
        })),
        fallback: 'blocking'
    };
}

export async function getStaticProps({ params }) {
    const { level: levelParam } = params;
    const levelNumber = parseInt(levelParam, 10);

    try {
        await dbConnect();
        const levelFromDb = await LevelModel.findOne({ levelNumber, isActive: true }).lean();

        if (levelFromDb) {
            // Map database level to the expected UI structure
            const level = {
                number: levelFromDb.levelNumber,
                name: levelFromDb.name,
                title: levelFromDb.name,
                subtitle: levelFromDb.description,
                iconName: levelFromDb.emoji === 'rocket-launch' ? 'FaRocket' :
                    levelFromDb.emoji === 'school' ? 'FaBook' :
                        levelFromDb.emoji === 'trending-up' ? 'FaChartLine' :
                            levelFromDb.emoji === 'emoji-events' ? 'FaTrophy' : 'FaRocket',
                color: levelFromDb.color === 'from-gray-300 to-gray-400' ? 'from-green-400 to-emerald-500' :
                    (levelFromDb.color || '')?.replace('from-yellow-400 to-red-500', 'from-indigo-400 to-purple-500'),
                quizzesRequired: levelFromDb.quizzesRequired ?? 0,
                // Provide default content for fields not in the DB model yet
                overview: [
                    `${levelFromDb.name} level is designed for students who have reached the target of ${levelFromDb.quizzesRequired ?? 0} high-score quizzes.`,
                    levelFromDb.description || ''
                ],
                topics: [
                    'Subject-specific mastery',
                    'Advanced methodology',
                    'Exam pattern synchronization',
                    'Interactive learning modules'
                ],
                outcomes: [
                    'Achieve target accuracy',
                    'Master core subjects',
                    'Develop competitive edge',
                    'Prepare for advanced certifications'
                ],
                examRelevance: [
                    `This level is highly relevant for competitive exams where ${levelFromDb.name} level proficiency is expected.`
                ],
                metaDescription: `${levelFromDb.name} level preparation on AajExam. Build your expertise in diverse subjects.`,
                keywords: `level ${levelFromDb.levelNumber}, ${levelFromDb.name}, quiz prep, competition`,
                studyTips: [
                    { title: 'Consistency', description: 'Regular practice is key to maintaining your progress.' },
                    { title: 'Quality Focus', description: 'Aim for high accuracy in every quiz attempted.' }
                ]
            };

            const serializedLevel = JSON.parse(JSON.stringify(level));

            return {
                props: { level: serializedLevel },
                revalidate: 3600 // Revalidate every hour
            };
        }
    } catch (error) {
        console.error('Error in getStaticProps:', error);
    }

    return { notFound: true };
}
