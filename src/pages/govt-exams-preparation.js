import React, { useState } from 'react';
import PageHero from '@/components/common/ui/PageHero';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import MobileAppWrapper from '../components/common/MobileAppWrapper';
import { FaGraduationCap, FaChartLine, FaQuestionCircle } from 'react-icons/fa';
import Seo from '../components/common/Seo';
import { generateBreadcrumbSchema, generateItemListSchema } from '../utils/schema';
import dbConnect from '../lib/db';
import Exam from '../models/Exam';
import { ExamCardSkeleton } from '../components/common/skeletons/PublicSkeletons';
import useTranslate from '../hooks/useTranslate';
import Pagination from '../components/common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../lib/constants/pagination';

export default function GovtExamsPreparation({ initialData }) {
  const { translate, rich, translateData } = useTranslate();
    const router = useRouter();
    const exams = initialData?.exams || [];
    const pagination = initialData?.pagination || {};
    const [loading, setLoading] = useState(false);

    const handlePageChange = async (newPage) => {
        setLoading(true);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage },
        }, undefined, { scroll: true });
    };

    const handlePageSizeChange = (n) => {
        setLoading(true);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, limit: n, page: 1 },
        }, undefined, { scroll: true });
    };

    return (
        <MobileAppWrapper showHeader={true} title={translate('Govt Exams Preparation')}>
            <Seo
                title="Government Exams Preparation Guide – Strategy, Syllabus & Practice | AajExam"
                description="Step-by-step preparation guide for SSC CHSL, CGL, MTS, UPSC, IBPS, SBI, RRB and State PSC exams. Syllabus, exam pattern, study plan, free practice tests and PYQs on AajExam."
                canonical="/govt-exams-preparation"
                keywords={[
                  'government exam preparation guide',
                  'SSC preparation strategy',
                  'UPSC strategy',
                  'banking exam strategy',
                  'railway exam strategy',
                  'syllabus and exam pattern',
                  'aajexam preparation'
                ]}
                schemas={[
                  generateBreadcrumbSchema([
                    { name: 'Home', url: '/' },
                    { name: 'Government Exams Preparation', url: '/govt-exams-preparation' }
                  ]),
                  generateItemListSchema({
                    name: 'Government Exam Preparation',
                    items: (exams || []).filter(e => e?.slug).slice(0, 30).map(e => ({ name: e.name, url: `/govt-exams/exam/${e.slug}` }))
                  })
                ]}
            />

            <div className="py-4 xl:py-8 h-auto xl:min-h-screen font-outfit relative overflow-hidden">
                {/* Background atmosphere */}

                <div className="py-3 xl:py-6">
                    <div className="mb-4 xl:mb-6">
                        <PageHero
                            icon={FaQuestionCircle}
                            title={rich('Government Exams <0>Preparation</0>', [(c) => <span className="text-primary-600">{c}</span>])}
                            subtitle={translate('{count} Exams Available', { count: pagination.totalExams || 0 })}
                        />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 xl:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ExamCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 xl:grid-cols-2 xl:grid-cols-3 gap-8">
                                {exams.length > 0 ? (
                                    exams.map((exam, index) => (
                                        <section key={exam._id || index} className="bg-background-surface rounded-2xl xl:rounded-3xl p-4 xl:p-8 transition-all duration-300 border border-border-primary flex flex-col justify-between group active:translate-y-1 active:border-b-2">
                                            <div>
                                                <div className="flex items-center justify-start gap-4 mb-2 xl:mb-4">
                                                <div className="w-10 xl:w-16 h-10 xl:h-16 rounded-2xl flex items-center justify-center border border-white dark:border-slate-800 overflow-hidden">
                                                    
                                                    <FaGraduationCap className="text-primary-600 text-2xl" />
                                                
                                                </div>
                                                <h2 className="text-md md:text-xl xl:text-2xl font-bold text-content-primary tracking-tight group-hover:text-primary-600 transition-colors">
                                                    {translateData(exam.name)}
                                                </h2>
                                                </div>
                                                <p className="text-sm font-bold text-content-secondary mb-3 xl:mb-6 line-clamp-3 leading-relaxed">
                                                    {exam.description || translate('Comprehensive exam preparation materials and practice tests.')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/govt-exams/exam/${exam.slug}`)}
                                                className="w-full bg-primary-600 hover:bg-primary-600 text-on-primary px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-[0.08em] text-[10px] flex items-center justify-center border-b-2 border-primary-600 active:translate-y-1 active:border-b-0"
                                            >
                                                {translate('Start Practice')} <FaChartLine className="ml-2" />
                                            </button>
                                        </section>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20 bg-background-surface rounded-3xl border border-border-primary font-bold uppercase tracking-[0.08em] text-content-muted text-sm">
                                        {translate('No exams found.')}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="mt-8 xl:mt-16"><Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} itemsPerPage={pagination.limit || PUBLIC_DEFAULT_PAGE_SIZE} onItemsPerPageChange={handlePageSizeChange} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
                        </>
                    )}

                    <section className="mt-8 xl:mt-16 bg-slate-950 dark:bg-slate-900 rounded-3xl p-4 xl:p-10 xl:p-20 text-white text-center border border-slate-800 relative overflow-hidden">

                        <h2 className="text-2xl xl:text-5xl font-bold mb-3 xl:mb-6 tracking-tight relative z-10">
                            {rich('Ready to <0>Ace</0> Your Exam?', [(c) => <span className="text-primary-400">{c}</span>])}
                        </h2>
                        <p className="text-md xl:text-xl font-bold opacity-80 mb-4 xl:mb-12 max-w-2xl mx-auto leading-relaxed relative z-10">
                            {translate('Join thousands of students who are already using AajExam to improve their scores and time management.')}
                        </p>
                        <button
                            onClick={() => router.push('/govt-exams')}
                            className="bg-primary-600 hover:bg-primary-600 text-on-primary px-12 py-5 rounded-3xl font-bold uppercase tracking-[0.08em] text-sm border-primary-600 active:translate-y-2 active:border-b-0 transition-all relative z-10"
                        >
                            {translate('Get Started Now')}
                        </button>
                    </section>
                </div>
            </div>
        </MobileAppWrapper>
    );
}

export async function getServerSideProps(context) {
    try {
        const { page = 1 } = context.query;
        const pageNum = parseInt(page, 10);
        const limitNum = PUBLIC_PAGE_SIZE_OPTIONS.includes(parseInt(context.query.limit, 10)) ? parseInt(context.query.limit, 10) : PUBLIC_DEFAULT_PAGE_SIZE;
        const skip = (pageNum - 1) * limitNum;

        await dbConnect();
        const [exams, total] = await Promise.all([
            Exam.find({ isActive: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Exam.countDocuments({ isActive: true })
        ]);

        const totalPages = Math.ceil(total / limitNum);

        return {
            props: {
                initialData: {
                    exams: JSON.parse(JSON.stringify(exams)),
                    pagination: {
                        currentPage: pageNum,
                        totalPages,
                        limit: limitNum,
                        totalExams: total,
                        hasMore: pageNum < totalPages
                    }
                }
            }
        };
    } catch (error) {
        console.error('Error in govt-exams-preparation getServerSideProps:', error);
        return {
            props: {
                initialData: { exams: [], pagination: {} }
            }
        };
    }
}

