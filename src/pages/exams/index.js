import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GraduationCap, Search, ChevronRight } from 'lucide-react';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import { generateBreadcrumbSchema, renderSchema } from '../../utils/schema';
import { getCanonicalUrl, getPaginationRobotsMeta, getPaginationUrls } from '../../utils/seo';
import dbConnect from '../../lib/db';
import Exam from '../../models/Exam';

export default function ExamsPage({ exams, pagination }) {
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? exams.filter(e =>
            e.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
            e.code?.toLowerCase().includes(search.trim().toLowerCase()) ||
            e.description?.toLowerCase().includes(search.trim().toLowerCase()) ||
            e.category?.name?.toLowerCase().includes(search.trim().toLowerCase())
        )
        : exams;

    return (
        <MobileAppWrapper showHeader={true} title="Exams">
            <Head>
                <title>{pagination?.page > 1 ? `Exams - Page ${pagination.page} | AajExam` : 'Exams - Practice Tests | AajExam'}</title>
                <meta name="description" content="Practice for real government exams including SSC, UPSC, Banking, Railway and other competitive examinations. Full-length mock tests with detailed solutions." />
                <meta name="keywords" content="government exams, SSC exam, UPSC exam, banking exam, railway exam, mock tests, practice exams, competitive exam preparation" />
                <link rel="canonical" href={getCanonicalUrl('/exams')} />
                <meta name="robots" content={getPaginationRobotsMeta(pagination?.page || 1)} />
                {pagination?.page > 1 && <link rel="prev" href={getPaginationUrls('/exams', pagination.page, pagination.totalPages).prevUrl} />}
                {pagination?.hasNext && <link rel="next" href={getPaginationUrls('/exams', pagination.page, pagination.totalPages).nextUrl} />}
                {renderSchema(generateBreadcrumbSchema([
                  { name: 'Home', url: '/' },
                  { name: 'Exams' }
                ]))}
            </Head>

            <div className="min-h-screen pb-24">
                <div className="container mx-auto py-4 lg:py-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase">Exams</h1>
                        <span className="text-xs font-bold text-slate-400">{filtered.length} exams</span>
                    </div>

                    {/* Search */}
                    <div className="relative mb-5">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search exams..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-200 dark:border-slate-700" />
                    </div>

                    {/* Exams List */}
                    <div className="space-y-3">
                        {filtered.map(exam => (
                            <Link key={exam._id} href={`/exams/${exam._id}`}>
                                <div className="flex items-center gap-2 lg:gap-4 p-2 lg:p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary-500 transition-all shadow-sm">
                                    <div className="w-6 lg:w-12 h-6 lg:h-12 rounded-lg lg:rounded-xl text-white bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{exam.name || 'Untitled Exam'}</p>
                                        <p className="text-xs text-slate-400">
                                            {exam.category?.name || ''}{exam.code ? ` · ${exam.code}` : ''}{exam.description ? ` · ${exam.description.substring(0, 60)}` : ''}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        <span className="text-[10px] font-black text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-2 rounded-lg uppercase">View</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {filtered.length === 0 && (
                            <div className="py-16 text-center">
                                <p className="text-sm text-slate-400">No exams found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-6">
                            {pagination.hasPrev && (
                                <Link href={`/exams?page=${pagination.page - 1}`}>
                                    <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold">Prev</button>
                                </Link>
                            )}
                            <span className="text-sm font-bold text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
                            {pagination.hasNext && (
                                <Link href={`/exams?page=${pagination.page + 1}`}>
                                    <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold">Next</button>
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

