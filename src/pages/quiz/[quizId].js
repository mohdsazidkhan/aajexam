import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaQuestionCircle, FaPlay, FaClock, FaChartBar, FaTrophy, FaUsers, FaCheckCircle } from 'react-icons/fa';
import { requireAuthForAction } from '../../lib/auth';
import API from '../../lib/api';
import dbConnect from '../../lib/db';
import MobileAppWrapper from '../../components/MobileAppWrapper';

export default function QuizPreviewPage({ quiz, robotsMeta, robotsReason }) {
  const router = useRouter();

  const handleStartQuiz = () => {
    if (requireAuthForAction(router, `/quiz/${quiz._id}/attempt`)) {
      router.push(`/quiz/${quiz._id}/attempt`);
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-4">Quiz Not Found</h1>
          <Link href="/categories">
            <span className="text-primary-600 hover:text-red-700">← Browse Categories</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MobileAppWrapper showHeader={true} title={quiz.title}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 py-10 lg:py-20 px-4">
        {/* Breadcrumb */}
        <div className="mb-8 font-outfit">
          <Link href="/categories">
            <span className="text-primary-600 dark:text-red-400 hover:underline">Categories</span>
          </Link>
          {quiz.category && (
            <>
              <span className="mx-2 text-gray-400">→</span>
              <Link href={`/categories/${quiz.category._id}`}>
                <span className="text-primary-600 dark:text-red-400 hover:underline">{quiz.category.name}</span>
              </Link>
            </>
          )}
          <span className="mx-2 text-gray-400">→</span>
          <span className="text-gray-700 dark:text-gray-300">{quiz.title}</span>
        </div>

        {/* Quiz Header */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-2xl mb-12 border-2 border-b-[12px] border-slate-200 dark:border-slate-800 relative overflow-hidden font-outfit">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="flex flex-col lg:flex-row items-center gap-8 mb-10 relative z-10">
            <div className="w-24 h-24 bg-primary-500 rounded-[2rem] flex items-center justify-center shadow-duo-primary border-b-8 border-primary-700 shrink-0">
              <FaQuestionCircle className="text-4xl text-white" />
            </div>
            <div className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
                {quiz.title}
              </h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {quiz.category && (
                  <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-2 border-slate-50 dark:border-slate-800">
                    {quiz.category.name}
                  </span>
                )}
                {quiz.difficulty && (
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${quiz.difficulty === 'easy' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30' :
                    quiz.difficulty === 'medium' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-primary-100 dark:border-primary-900/30' :
                      'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-100 dark:border-orange-900/30'
                    }`}>
                    {quiz.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-12 leading-relaxed text-center lg:text-left relative z-10">
            {quiz.description}
          </p>

          {/* Quiz Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
            {quiz.sampleQuestions && quiz.sampleQuestions.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 text-center border-2 border-slate-100 dark:border-slate-800 shadow-duo group hover:shadow-lg transition-all">
                <div className="text-xl lg:text-3xl font-black text-primary-600 mb-2 group-hover:scale-110 transition-transform">{quiz.sampleQuestions.length}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Questions</div>
              </div>
            )}
            {quiz.timeLimit && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 text-center border-2 border-slate-100 dark:border-slate-800 shadow-duo group hover:shadow-lg transition-all">
                <div className="text-xl lg:text-3xl font-black text-primary-600 mb-2 group-hover:scale-110 transition-transform">{quiz.timeLimit}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Minutes</div>
              </div>
            )}
            {quiz.requiredLevel && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 text-center border-2 border-slate-100 dark:border-slate-800 shadow-duo group hover:shadow-lg transition-all">
                <div className="text-xl lg:text-3xl font-black text-emerald-600 mb-2 group-hover:scale-110 transition-transform">{quiz.requiredLevel}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Required Level</div>
              </div>
            )}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 text-center border-2 border-slate-100 dark:border-slate-800 shadow-duo group hover:shadow-lg transition-all">
              <div className="text-xl lg:text-3xl font-black text-orange-600 mb-2 group-hover:scale-110 transition-transform">{quiz.attemptsCount || 0}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Attempts</div>
            </div>
          </div>

          {/* Start Quiz Button */}
          <button
            onClick={handleStartQuiz}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white px-8 py-8 rounded-[2.5rem] transition-all font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center shadow-duo-primary border-b-[10px] border-primary-700 active:translate-y-2 active:border-b-0 relative z-10 group"
          >
            <FaPlay className="mr-4 group-hover:scale-125 transition-transform" /> Start Quiz Now
          </button>
        </div>

        {/* Educational Content */}
        {quiz.educationalDescription && quiz.educationalDescription.trim() !== '' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-5 lg:p-10 border-2 border-b-8 border-slate-100 dark:border-slate-800 shadow-xl mb-10 overflow-hidden relative font-outfit">
            <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-primary-500 rounded-full" />
              About This Quiz
            </h2>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{quiz.educationalDescription}</p>
          </div>
        )}

        {/* Syllabus Covered */}
        {quiz.syllabusCovered && quiz.syllabusCovered.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-5 lg:p-10 border-2 border-b-8 border-slate-100 dark:border-slate-800 shadow-xl mb-10 overflow-hidden relative font-outfit">
            <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-primary-500 rounded-full" />
              Syllabus Covered
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {quiz.syllabusCovered.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                  <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Outcomes */}
        {quiz.learningOutcomes && quiz.learningOutcomes.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-5 lg:p-10 border-2 border-b-8 border-slate-100 dark:border-slate-800 shadow-xl mb-10 overflow-hidden relative font-outfit">
            <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-emerald-500 rounded-full" />
              Learning Outcomes
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {quiz.learningOutcomes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                  <FaCheckCircle className="text-emerald-500 shrink-0" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exam Relevance */}
        {quiz.examRelevance && quiz.examRelevance.trim() !== '' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-5 lg:p-10 border-2 border-b-8 border-slate-100 dark:border-slate-800 shadow-xl mb-10 overflow-hidden relative font-outfit">
            <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-orange-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-orange-500 rounded-full" />
              Exam Relevance
            </h2>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{quiz.examRelevance}</p>
          </div>
        )}

        {/* Quiz Performance Stats */}
        {quiz.attemptsCount !== undefined && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-5 lg:p-10 border-2 border-b-8 border-slate-100 dark:border-slate-800 shadow-xl mb-10 overflow-hidden relative font-outfit">
            <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-purple-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-purple-500 rounded-full" />
              Global Statistics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                <div className="text-4xl font-black text-primary-600 group-hover:scale-110 transition-transform">{quiz.attemptsCount}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-4 text-center">Total Attempts</div>
              </div>
              <div className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                <div className="text-4xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{quiz.viewsCount || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-4 text-center">Views</div>
              </div>
              <div className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                <div className="text-4xl font-black text-orange-600 group-hover:scale-110 transition-transform">{quiz.difficultyLevel || quiz.difficulty}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-4 text-center">Difficulty</div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {quiz.tags && quiz.tags.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-5 lg:p-10 border-2 border-b-8 border-slate-100 dark:border-slate-800 shadow-xl mb-10 font-outfit">
            <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-slate-400 rounded-full" />
              Tags
            </h2>
            <div className="flex flex-wrap gap-3">
              {quiz.tags.map((tag, index) => (
                <span key={index} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-50 dark:border-slate-800 hover:border-primary-500 transition-all cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileAppWrapper>
  );
}

export async function getServerSideProps({ params }) {
  try {
    await dbConnect();

    // Server-side only imports to prevent browser crashes
    const Quiz = (await import('../../models/Quiz')).default;
    const Category = (await import('../../models/Category')).default;
    const Level = (await import('../../models/Level')).default;

    const quizDoc = await Quiz.findById(params.quizId)
      .populate('category', 'name')
      .lean();

    if (!quizDoc) {
      console.log(`Quiz not found with ID: ${params.quizId}`);
      return {
        props: {
          quiz: null,
        },
      };
    }

    const quizObj = JSON.parse(JSON.stringify(quizDoc));

    // Determine robots meta server-side to influence indexing (SSR-safe)
    const { getRobotsMeta } = require('../../utils/robotsMeta');
    const robots = getRobotsMeta(quizObj, {
      threshold: process.env.QUIZ_CONTENT_SCORE_THRESHOLD ? parseFloat(process.env.QUIZ_CONTENT_SCORE_THRESHOLD) : undefined,
      minIntroWords: process.env.QUIZ_MIN_INTRO_WORDS ? parseInt(process.env.QUIZ_MIN_INTRO_WORDS, 10) : undefined,
      enabled: process.env.QUIZ_NOINDEX_ENABLED ? (process.env.QUIZ_NOINDEX_ENABLED === 'true') : undefined,
      safeMode: process.env.QUIZ_SAFE_MODE ? (process.env.QUIZ_SAFE_MODE === 'true') : undefined,
    });

    return {
      props: {
        quiz: quizObj,
        robotsMeta: robots.robots,
        robotsReason: robots.reason,
      },
    };
  } catch (error) {
    console.error('Error in quiz preview getServerSideProps:', error);
    return {
      props: {
        quiz: null,
      },
    };
  }
}
