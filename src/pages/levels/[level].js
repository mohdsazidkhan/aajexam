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
                <meta property="og:image" content="https://aajexam.com/logo.png" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>

            <div className="min-h-screen bg-white dark:bg-slate-950 font-outfit relative overflow-hidden">
                {/* Background atmosphere */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 lg:px-0 relative z-10 mt-4">
                    {/* Hero */}
                    <div className="text-center mb-12">
                        <div className={`w-20 h-20 bg-gradient-to-r ${level.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                            <IconComponent className="text-white text-4xl" />
                        </div>
                        <h1 className="text-xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">
                            Level {level.number}: {level.name}
                        </h1>
                        <p className="text-md md:text-xl lg:text-2xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                            {level.subtitle}
                        </p>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                            {level.quizzesRequired === 0 ? 'Starting Point' : `${level.quizzesRequired} Total Quizzes Required`}
                        </p>
                    </div>

                    {/* Overview */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Overview</h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg lg:text-xl font-bold leading-relaxed">
                            {level.overview.map((para, idx) => (
                                <p key={idx}>{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Topics Covered */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Topics Covered</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {level.topics.map((topic, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Learning Outcomes</h2>
                        <div className="space-y-4">
                            {level.outcomes.map((outcome, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black shadow-duo-primary border-b-4 border-primary-700">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-lg lg:text-xl font-bold">{outcome}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exam Relevance */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-[3rem] p-4 md:p-8 lg:p-12 mb-12 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Exam Relevance</h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg lg:text-xl font-bold leading-relaxed">
                            {level.examRelevance.map((para, idx) => (
                                <p key={idx}>{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Study Tips */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl lg:text-4xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary-500 rounded-full" />
                            Study Tips
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {level.studyTips.map((tip, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all">
                                    <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{tip.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-12 bg-white dark:bg-slate-900 p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl">
                        {level.number > 0 && (
                            <button
                                onClick={() => router.push(`/levels/${level.number - 1}`)}
                                className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-duo border-b-4 border-slate-200 dark:border-slate-700 active:translate-y-1 active:border-b-0 transition-all"
                            >
                                ← Previous Level
                            </button>
                        )}
                        {level.number < 10 && (
                            <button
                                onClick={() => router.push(`/levels/${level.number + 1}`)}
                                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0 transition-all ml-auto"
                            >
                                Next Level →
                            </button>
                        )}
                    </div>

                    {/* Author Bio */}
                    <AuthorBio />

                    {/* Last Updated */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        Last Updated: 1st April 2026
                    </p>

                </div>
            </div>
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
                    (levelFromDb.color || '')?.replace('from-primary-400 to-red-500', 'from-indigo-400 to-purple-500'),
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
