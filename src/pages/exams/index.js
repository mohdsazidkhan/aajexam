import Head from 'next/head';
import Link from 'next/link';
import { FaGraduationCap, FaClock, FaTrophy, FaCalendar, FaChevronRight } from 'react-icons/fa';
// UnifiedNavbar removed
import UnifiedFooter from '../../components/UnifiedFooter';
import dbConnect from '../../lib/db';
import Exam from '../../models/Exam';

export default function ExamsPage({ exams, pagination }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <MobileAppWrapper showHeader={true} title="Government Exams">
            <Head>
                <title>Government Exams - Practice Tests | AajExam</title>
                <meta name="description" content="Practice for real government exams including SSC, UPSC, Banking, Railway and other competitive examinations. Full-length mock tests with detailed solutions." />
                <meta name="keywords" content="government exams, SSC exam, UPSC exam, banking exam, railway exam, mock tests, practice exams" />
                <meta property="og:title" content="Government Exams - Practice Tests | AajExam" />
                <meta property="og:description" content="Practice for real government competitive exams with full-length mock tests." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Government Exams - AajExam" />
                <meta name="twitter:description" content="Practice for government competitive exams." />
                <meta name="robots" content="index, follow" />
            </Head>

            <div className="min-h-screen  py-20 lg:py-24 px-4 font-outfit relative overflow-hidden">
                {/* Background atmosphere */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8 lg:mb-16">
                        <div className="inline-block mb-6">
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-duo-primary border-2 border-white dark:border-slate-800">
                                <FaGraduationCap className="text-3xl text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                        <h1 className="text-xl lg:text-5xl font-black text-slate-900 dark:text-white mb-3 lg:mb-6 uppercase tracking-tighter">
                            Government Exams
                        </h1>
                        <p className="text-lg lg:text-xl lg:text-3xl font-black text-slate-600 dark:text-slate-400 max-w-3xl mx-auto uppercase tracking-widest text-xs">
                            Practice with real exam patterns for SSC, UPSC, Banking, Railway & more
                        </p>
                    </div>

                    {/* Exams List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {exams.map(exam => (
                            <Link key={exam._id} href={`/exams/${exam._id}`}>
                                <div className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-b-8 border-slate-100 dark:border-slate-800 active:translate-y-1 active:border-b-2 cursor-pointer h-full flex flex-col justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                <FaGraduationCap className="text-2xl text-primary-600 dark:text-primary-400 group-hover:text-white" />
                                            </div>
                                            <h2 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                                {exam.name || exam.title || 'Untitled Exam'}
                                            </h2>
                                        </div>

                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                                            {exam.description}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                            {exam.examDate && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                        <FaCalendar className="text-orange-500 text-sm" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Date</div>
                                                        <div className="text-xs font-black text-slate-700 dark:text-slate-300">{formatDate(exam.examDate)}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {exam.duration && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                                        <FaClock className="text-emerald-500 text-sm" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</div>
                                                        <div className="text-xs font-black text-slate-700 dark:text-slate-300">{exam.duration} MIN</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {exam.category && (
                                            <div className="mb-6">
                                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    {exam.category.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">View Details</span>
                                        <FaChevronRight className="text-xs text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State */}
                    {exams.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl">
                            <FaGraduationCap className="text-6xl text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">No exams available at the moment.</p>
                            <p className="text-slate-400 dark:text-slate-500 mt-2 text-xs font-black uppercase tracking-widest">Check back soon for new exam schedules!</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {pagination.hasPrev && (
                                <Link href={`/exams?page=${pagination.page - 1}`}>
                                    <button className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold">
                                        Previous
                                    </button>
                                </Link>
                            )}
                            <span className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-600 dark:from-primary-500 dark:to-primary-500 text-white rounded-lg font-semibold">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            {pagination.hasNext && (
                                <Link href={`/exams?page=${pagination.page + 1}`}>
                                    <button className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold">
                                        Next
                                    </button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MobileAppWrapper>
    );
}

export async function getServerSideProps({ query }) {
    try {
        await dbConnect();

        const page = parseInt(query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const totalExams = await Exam.countDocuments({ isActive: true });

        const exams = await Exam.find({ isActive: true })
            .populate('category', 'name')
            .select('name code logo description examDate duration totalMarks passingMarks category')
            .skip(skip)
            .limit(limit)
            .lean();

        const pagination = {
            page,
            limit,
            totalExams,
            totalPages: Math.ceil(totalExams / limit),
            hasPrev: page > 1,
            hasNext: page * limit < totalExams
        };

        return {
            props: {
                exams: JSON.parse(JSON.stringify(exams)),
                pagination: JSON.parse(JSON.stringify(pagination)),
            },
        };
    } catch (error) {
        console.error('Error fetching exams:', error);
        return {
            props: {
                exams: [],
                pagination: null,
            },
        };
    }
}

