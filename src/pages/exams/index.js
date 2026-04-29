import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Search, ChevronRight } from 'lucide-react';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema, generateItemListSchema } from '../../utils/schema';
import { getPaginationUrls } from '../../utils/seo';
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

    const paginationUrls = pagination ? getPaginationUrls('/exams', pagination.page, pagination.totalPages) : {};
    const seoTitle = pagination?.page > 1
      ? `Exams – Page ${pagination.page} | AajExam`
      : `Exams – ${pagination?.totalExams || filtered.length}+ Government Exam Practice Tests | AajExam`;
    const seoDescription = `Practise ${pagination?.totalExams || filtered.length}+ government exam categories on AajExam – SSC CHSL, CGL, MTS, GD, UPSC, IBPS, SBI, RRB and State PSC. Full-length mock tests, sectional analysis and detailed solutions.`;

    return (
        <MobileAppWrapper showHeader={true} title="Exams">
            <Seo
                title={seoTitle}
                description={seoDescription}
                canonical={pagination?.page > 1 ? `/exams?page=${pagination.page}` : '/exams'}
                noIndex={pagination?.page > 1}
                prev={pagination?.page > 1 ? paginationUrls.prevUrl : null}
                next={pagination?.hasNext ? paginationUrls.nextUrl : null}
                keywords={[
                  'government exams list',
                  'SSC exam',
                  'UPSC exam',
                  'banking exam',
                  'railway exam',
                  'mock tests online',
                  'practice exams',
                  'competitive exam preparation',
                  'aajexam exams'
                ]}
                schemas={[
                  generateBreadcrumbSchema([
                    { name: 'Home', url: '/' },
                    { name: 'Exams', url: '/exams' }
                  ]),
                  generateItemListSchema({
                    name: 'AajExam Exams Catalogue',
                    items: (exams || []).slice(0, 30).map(e => ({ name: e.name, url: `/exams/${e.slug || e._id}` }))
                  })
                ]}
            />

            <div className="min-h-screen pb-24">
                <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase">Exams</h1>
                        <span className="text-xs font-bold text-slate-400">{pagination?.totalExams || filtered.length} exams</span>
                    </div>

                    {/* Search */}
                    <div className="relative mb-5">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search exams..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-200 dark:border-slate-700" />
                    </div>

                    {/* Exams List */}
                    <div className="flex flex-col gap-1.5 lg:gap-3">
                        {filtered.map(exam => (
                            <Link key={exam._id} href={`/exams/${exam.slug || exam._id}`} className="block">
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

