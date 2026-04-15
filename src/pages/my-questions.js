'use client';

import React, { useState, useEffect } from 'react';
import {
   MessageSquare,
   Eye,
   Heart,
   Calendar,
   CheckCircle,
   Clock,
   XCircle,
   Plus,
   GraduationCap,
   Trash2,
   Image
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import API from '../lib/api';
import MobileAppWrapper from '../components/MobileAppWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/Loading';
import Seo from '../components/Seo';
import Pagination from '../components/Pagination';

const STATUS_CONFIG = {
   approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
   pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
   rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
};

const MyQuestionsPage = () => {
   const [questions, setQuestions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [total, setTotal] = useState(0);
   const router = useRouter();

   const fetchQuestions = async () => {
      try {
         setLoading(true);
         const res = await API.getMyCommunityQuestions({ page: currentPage, limit: 12 });
         if (res?.success) {
            const payload = res.data || res;
            setQuestions(payload.questions || []);
            setTotalPages(payload.pagination?.totalPages || 1);
            setTotal(payload.pagination?.total || 0);
         } else {
            toast.error('Could not load questions');
         }
      } catch (e) {
         toast.error('Could not load questions');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchQuestions(); }, [currentPage]);

   const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this question?')) return;
      try {
         const res = await API.deleteCommunityQuestion(id);
         if (res?.success) {
            setQuestions(prev => prev.filter(q => q._id !== id));
            setTotal(prev => prev - 1);
            toast.success('Question deleted');
         } else {
            toast.error('Failed to delete');
         }
      } catch (e) {
         toast.error('Failed to delete');
      }
   };

   if (loading && questions.length === 0) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

   return (
      <MobileAppWrapper title="My Q&A">
         <div className="min-h-screen animate-fade-in selection:bg-primary-500 selection:text-white mt-0">
            <Seo title="My Q&A - AajExam" noIndex={true} />

            <div className="container mx-auto px-0 lg:px-8 py-4 lg:py-12 space-y-6 lg:space-y-12 mt-0">
               {/* Header */}
               <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center lg:text-left">
                     <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight">My Q&A</h1>
                     <p className="text-sm font-bold text-gray-400">
                        {total > 0 ? `${total} question${total > 1 ? 's' : ''} posted` : 'Questions you have posted'}
                     </p>
                  </div>

                  <Button variant="primary" className="text-xs" onClick={() => router.push('/community-questions/ask')}>
                     <Plus className="w-4 h-4 mr-1" /> Ask Question
                  </Button>
               </div>

               {/* Questions Grid */}
               {questions.length === 0 ? (
                  <div className="py-4 lg:py-8 text-center space-y-3 lg:space-y-6">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                        <MessageSquare className="w-10 h-10 text-gray-400" />
                     </div>
                     <h3 className="text-xl lg:text-2xl font-black font-outfit">No questions yet</h3>
                     <p className="text-sm font-bold text-gray-400">Ask your first question to the community!</p>
                     <Button variant="primary" className="mx-auto" onClick={() => router.push('/community-questions/ask')}>Ask Question</Button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                     {questions.map((q, idx) => {
                        const statusConfig = STATUS_CONFIG[q.status] || STATUS_CONFIG.approved;
                        const StatusIcon = statusConfig.icon;
                        const hasOptions = q.options && q.options.length > 0;

                        return (
                           <motion.div key={q._id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="p-5 group hover:shadow-2xl transition-all duration-500 border-2 flex flex-col h-full cursor-pointer"
                                 onClick={() => router.push(`/community-questions/${q._id}`)}>
                                 <div className="space-y-4 flex-1">
                                    {/* Top: Status + Delete */}
                                    <div className="flex items-center justify-between">
                                       <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusConfig.bg} ${statusConfig.color}`}>
                                          <StatusIcon className="w-3 h-3" />
                                          {statusConfig.label}
                                       </div>
                                       <button
                                          onClick={(e) => { e.stopPropagation(); handleDelete(q._id); }}
                                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                                          title="Delete question"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                    </div>

                                    {/* Exam badge */}
                                    {q.exam && (
                                       <div className="flex items-center gap-1.5">
                                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 uppercase">
                                             <GraduationCap className="w-3 h-3 inline mr-1" />
                                             {q.exam.name || q.exam.code || 'Exam'}
                                          </span>
                                       </div>
                                    )}

                                    {/* Question Text */}
                                    <p className="font-black text-sm lg:text-base line-clamp-3 leading-snug">{q.question}</p>

                                    {/* Image indicator */}
                                    {q.image && (
                                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                          <Image className="w-3 h-3" /> Has image
                                       </div>
                                    )}

                                    {/* Options preview */}
                                    {hasOptions && (
                                       <div className="space-y-1.5">
                                          {q.options.slice(0, 4).map((opt, i) => (
                                             <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold ${opt.isCorrect ? 'bg-green-50 dark:bg-green-900/10 text-green-700' : 'bg-slate-50 dark:bg-slate-800 text-content-secondary'}`}>
                                                <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-black flex-shrink-0 border-current">
                                                   {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="line-clamp-1">{opt.text}</span>
                                                {opt.isCorrect && <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 ml-auto" />}
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                 </div>

                                 {/* Footer: Stats + Date */}
                                 <div className="flex items-center justify-between text-[9px] font-black text-gray-400 pt-3 mt-3 border-t-2 border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                       <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{q.views || 0}</span>
                                       <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{q.likes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       <Calendar className="w-3 h-3" />
                                       {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                 </div>
                              </Card>
                           </motion.div>
                        );
                     })}
                  </div>
               )}

               {/* Pagination */}
               {totalPages > 1 && (
                  <div className="flex justify-center pt-10">
                     <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
               )}
            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default MyQuestionsPage;
