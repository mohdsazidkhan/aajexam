import Head from 'next/head';
import Link from 'next/link';
import { FaGraduationCap, FaClock, FaTrophy, FaCalendar, FaChevronRight } from 'react-icons/fa';
import UnifiedNavbar from '../../components/UnifiedNavbar';
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
        <>
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

            <UnifiedNavbar isLandingPage={true} />

            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 from-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
                <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                    {/* Header */}
                    <div className="text-center mb-8 lg:mb-16">
                        <div className="inline-block mb-0 lg:mb-4">
                            <FaGraduationCap className="text-3xl lg:text-6xl text-red-600 dark:text-red-400 mx-auto" />
                        </div>
                        <h1 className="text-xl lg:text-3xl xl:text-4xl font-extrabold text-orange-700 text-red-600 dark:text-yellow-400 dark:text-red-400 bg-clip-text text-transparent mb-4">
                            Government Exams
                        </h1>
                        <p className="text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 font-medium">
                            Practice with real exam patterns for SSC, UPSC, Banking, Railway & more
                        </p>
                    </div>

                    {/* Exams List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-6">
                        {exams.map(exam => (
                            <Link key={exam._id} href={`/exams/${exam._id}`}>
                                <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 cursor-pointer">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <FaGraduationCap className="text-3xl text-red-600 dark:text-red-400" />
                                                <h2 className="text-2xl md:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                                    {exam.name || exam.title || exam.description || 'Untitled Exam'}
                                                </h2>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                                {exam.description}
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {exam.examDate && (
                                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                        <FaCalendar className="text-blue-500 mr-2" />
                                                        <div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Exam Date</div>
                                                            <div className="font-semibold">{formatDate(exam.examDate)}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {exam.duration && (
                                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                        <FaClock className="text-green-500 mr-2" />
                                                        <div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                                                            <div className="font-semibold">{exam.duration} min</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {exam.totalMarks && (
                                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                        <FaTrophy className="text-yellow-500 mr-2" />
                                                        <div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Marks</div>
                                                            <div className="font-semibold">{exam.totalMarks}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {exam.passingMarks && (
                                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                        <FaTrophy className="text-yellow-500 mr-2" />
                                                        <div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Passing Marks</div>
                                                            <div className="font-semibold">{exam.passingMarks}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {exam.category && (
                                                <div className="mt-4">
                                                    <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                                                        {exam.category.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <FaChevronRight className="text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-xl mt-2" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Empty State */}
                    {exams.length === 0 && (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
                            <FaGraduationCap className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-xl text-gray-500 dark:text-gray-400">No exams available at the moment.</p>
                            <p className="text-gray-400 dark:text-gray-500 mt-2">Check back soon for new exam schedules!</p>
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
                            <span className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-red-600 dark:from-yellow-500 dark:to-red-500 text-white rounded-lg font-semibold">
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
            <UnifiedFooter />
        </>
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
