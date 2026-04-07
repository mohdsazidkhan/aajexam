import dbConnect from '../../lib/db';
import Head from 'next/head';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaBook, FaClock, FaPlay, FaQuestionCircle } from 'react-icons/fa';
import { requireAuthForAction } from '../../lib/auth';

export default function SubcategoryPage({ subcategory, quizzes, pagination }) {
  const router = useRouter();

  const handleStartQuiz = (quizId) => {
    if (requireAuthForAction(router, `/quiz/${quizId}/attempt`)) {
      router.push(`/quiz/${quizId}/attempt`);
    }
  };

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center font-outfit">
        <div className="text-center">
          <h1 className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Subcategory Not Found</h1>
          <Link href="/categories">
            <span className="text-primary-600 dark:text-primary-500 font-black uppercase tracking-widest text-xs hover:underline cursor-pointer">← Back to Categories</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MobileAppWrapper showHeader={true} title={subcategory.name}>
      <Head>
        <title>{subcategory.name} - Quizzes | AajExam</title>
        <meta name="description" content={subcategory.description || `Practice quizzes for ${subcategory.name}`} />
        <meta name="keywords" content={`${subcategory.name}, quiz, practice test, government exam`} />
        <meta property="og:title" content={`${subcategory.name} - Quizzes | AajExam`} />
        <meta property="og:description" content={subcategory.description} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="py-20 lg:py-24 min-h-screen bg-white dark:bg-slate-950 px-4 font-outfit relative overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-2 lg:px-6 xl:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Link href="/categories">
              <span className="text-primary-700 dark:text-primary-400 hover:text-primary-500 transition-colors">Categories</span>
            </Link>
            {subcategory.category && (
              <>
                <span className="text-slate-400">/</span>
                <Link href={`/categories/${subcategory.category._id}`}>
                  <span className="text-primary-700 dark:text-primary-400 hover:text-primary-500 transition-colors">{subcategory.category.name}</span>
                </Link>
              </>
            )}
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400">{subcategory.name}</span>
          </div>

          {/* Subcategory Header */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 lg:p-10 shadow-2xl mb-12 border-2 border-b-[10px] border-slate-200 dark:border-slate-800">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mr-6 shadow-duo-primary border-2 border-white dark:border-slate-800">
                <FaBook className="text-3xl text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {subcategory.name}
              </h1>
            </div>
            {subcategory.description && (
              <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {subcategory.description}
              </p>
            )}
          </div>

          {/* Quizzes */}
          <div>
            <h2 className="text-md md:text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Available Quizzes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {quizzes.map(quiz => (
                <div key={quiz._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 lg:p-8 shadow-xl hover:shadow-2xl transition-all border-2 border-slate-100 dark:border-slate-800 flex flex-col justify-between group">
                  <div>
                    <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{quiz.title}</h3>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">{quiz.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mb-8">
                      {quiz.difficulty && (
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${quiz.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          quiz.difficulty === 'medium' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                          {quiz.difficulty}
                        </span>
                      )}
                      {quiz.timeLimit && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <FaClock className="text-xs" /> {quiz.timeLimit} MIN
                        </span>
                      )}
                      {quiz.requiredLevel && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" /> LVL {quiz.requiredLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(quiz._id)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center shadow-duo-primary border-b-4 border-primary-700 active:translate-y-1 active:border-b-0"
                  >
                    <FaPlay className="mr-2 text-[10px]" /> Start Quiz
                  </button>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {quizzes.length === 0 && (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
                <FaQuestionCircle className="text-6xl text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                <p className="text-xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">No quizzes available in this subcategory yet.</p>
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
                <span className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-600 dark:from-primary-500 to-primary-500 text-white rounded-lg">
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
    </MobileAppWrapper>
  );
}

export async function getServerSideProps({ params, query }) {
  try {
    await dbConnect();
    const { subcategoryId } = params;

    const page = parseInt(query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const Subcategory = (await import('../../models/Subcategory')).default;
    const Quiz = (await import('../../models/Quiz')).default;

    const subcategory = await Subcategory.findById(subcategoryId).populate('category', 'name').lean();

    if (!subcategory) {
      return { notFound: true };
    }

    const quizzes = await Quiz.find({ subcategory: subcategoryId, status: 'approved' })
      .select('title description difficulty timeLimit requiredLevel attemptsCount category educationalDescription')
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
