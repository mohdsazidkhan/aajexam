import dbConnect from '../../lib/db';
import Quiz from '../../models/Quiz';
import Subcategory from '../../models/Subcategory';
import Category from '../../models/Category';

export default function SubcategoryPage({ subcategory, quizzes, pagination }) {
    const router = useRouter();

    const handleStartQuiz = (quizId) => {
        if (requireAuthForAction(router, `/quiz/${quizId}/attempt`)) {
            router.push(`/quiz/${quizId}/attempt`);
        }
    };

    if (!subcategory) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Subcategory Not Found</h1>
                    <Link href="/categories">
                        <span className="text-red-600 hover:text-red-700">← Back to Categories</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{subcategory.name} - Quizzes | SUBG QUIZ</title>
                <meta name="description" content={subcategory.description || `Practice quizzes for ${subcategory.name}`} />
                <meta name="keywords" content={`${subcategory.name}, quiz, practice test, government exam`} />
                <meta property="og:title" content={`${subcategory.name} - Quizzes | SUBG QUIZ`} />
                <meta property="og:description" content={subcategory.description} />
                <meta property="og:type" content="website" />
                <meta name="robots" content="index, follow" />
            </Head>

            <UnifiedNavbar isLandingPage={true} />

            <div className="py-20 sm:py-10 min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 from-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900  px-4">
                <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link href="/categories">
                            <span className="text-red-600 dark:text-red-400 hover:underline">Categories</span>
                        </Link>
                        {subcategory.category && (
                            <>
                                <span className="mx-2 text-gray-400">→</span>
                                <Link href={`/categories/${subcategory.category._id}`}>
                                    <span className="text-red-600 dark:text-red-400 hover:underline">{subcategory.category.name}</span>
                                </Link>
                            </>
                        )}
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-700 dark:text-gray-300">{subcategory.name}</span>
                    </div>

                    {/* Subcategory Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-8 shadow-xl mb-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <FaBook className="text-4xl text-red-600 dark:text-red-400 mr-4" />
                            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                                {subcategory.name}
                            </h1>
                        </div>
                        {subcategory.description && (
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                {subcategory.description}
                            </p>
                        )}
                    </div>

                    {/* Quizzes */}
                    <div>
                        <h2 className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">Available Quizzes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {quizzes.map(quiz => (
                                <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-xl p-3 lg:p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{quiz.description}</p>

                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                                        {quiz.difficulty && (
                                            <span className={`px-2 py-1 rounded ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {quiz.difficulty}
                                            </span>
                                        )}
                                        {quiz.timeLimit && (
                                            <span className="flex items-center">
                                                <FaClock className="mr-1" /> {quiz.timeLimit} min
                                            </span>
                                        )}
                                        {quiz.level && (
                                            <span className="flex items-center">
                                                <FaChartBar className="mr-1" /> Level {quiz.level.levelNumber}
                                            </span>
                                        )}
                                    </div>

                                    {quiz.educationalDescription && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                            {quiz.educationalDescription}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => handleStartQuiz(quiz._id)}
                                        className="w-full bg-gradient-to-r from-yellow-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-yellow-700 hover:to-red-700 transition-all font-semibold flex items-center justify-center"
                                    >
                                        <FaPlay className="mr-2" /> Start Quiz
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {quizzes.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
                                <FaQuestionCircle className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-xl text-gray-500 dark:text-gray-400">No quizzes available in this subcategory yet.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                {pagination.hasPrev && (
                                    <Link href={`/subcategories/${subcategory._id}?page=${pagination.page - 1}`}>
                                        <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            Previous
                                        </button>
                                    </Link>
                                )}
                                <span className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-red-600 dark:from-yellow-500 dark:to-red-500 text-white rounded-lg">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                {pagination.hasNext && (
                                    <Link href={`/subcategories/${subcategory._id}?page=${pagination.page + 1}`}>
                                        <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            Next
                                        </button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <UnifiedFooter />
        </>
    );
}

export async function getServerSideProps({ params, query }) {
    try {
        await dbConnect();
        const { subcategoryId } = params;

        const page = parseInt(query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const subcategory = await Subcategory.findById(subcategoryId).populate('category', 'name').lean();

        if (!subcategory) {
            return { notFound: true };
        }

        const quizzes = await Quiz.find({ subcategory: subcategoryId, status: 'approved' })
            .select('title description difficulty timeLimit level stats questionCount attemptsCount category educationalDescription')
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .lean();

        const totalQuizzes = await Quiz.countDocuments({ subcategory: subcategoryId, status: 'approved' });

        const data = {
            subcategory: JSON.parse(JSON.stringify(subcategory)),
            quizzes: JSON.parse(JSON.stringify(quizzes)),
            pagination: {
                page,
                limit,
                totalQuizzes,
                totalPages: Math.ceil(totalQuizzes / limit) || 1,
                hasPrev: page > 1,
                hasNext: (page * limit) < totalQuizzes
            }
        };

        return {
            props: data
        };
    } catch (error) {
        console.error('Error fetching subcategory quizzes:', error);
        return {
            props: {
                subcategory: null,
                quizzes: [],
                pagination: null,
            },
        };
    }
}
