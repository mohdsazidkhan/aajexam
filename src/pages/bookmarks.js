'use client';

import React, { useState, useEffect } from 'react';
import {
   Bookmark,
   BookmarkCheck,
   Heart,
   Eye,
   Share2,
   HelpCircle,
   BookOpen,
   Zap,
   Newspaper,
   BarChart3,
   Calendar,
   PlayCircle,
   CheckCircle,
   XCircle
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

const TYPE_CONFIG = {
   question: { label: 'Question', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
   fact: { label: 'Fact', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
   tip: { label: 'Tip', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
   current_affairs: { label: 'Current Affairs', icon: Newspaper, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
   poll: { label: 'Poll', icon: BarChart3, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
};

const DIFFICULTY_STYLES = {
   easy: 'text-green-600 bg-green-50 dark:bg-green-900/20',
   medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
   hard: 'text-red-600 bg-red-50 dark:bg-red-900/20',
};

const BookmarksPage = () => {
   const [reels, setReels] = useState([]);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [total, setTotal] = useState(0);
   const router = useRouter();

   const fetchBookmarks = async () => {
      try {
         setLoading(true);
         const res = await API.getBookmarkedReels({ page: currentPage, limit: 12 });
         if (res?.success) {
            setReels(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
            setTotal(res.pagination?.total || 0);
         } else {
            toast.error('Could not load bookmarks');
         }
      } catch (e) {
         toast.error('Could not load bookmarks');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchBookmarks(); }, [currentPage]);

   const handleUnbookmark = async (reelId) => {
      try {
         await API.bookmarkReel(reelId);
         setReels(prev => prev.filter(r => r._id !== reelId));
         setTotal(prev => prev - 1);
         toast.success('Removed from bookmarks');
      } catch (e) {
         toast.error('Failed to remove bookmark');
      }
   };

   const getReelTitle = (reel) => {
      if (reel.title) return reel.title;
      if (reel.type === 'question' && reel.questionText) return reel.questionText;
      if (reel.type === 'poll' && reel.pollQuestion) return reel.pollQuestion;
      if (reel.content) return reel.content;
      return 'Untitled Reel';
   };

   if (loading && reels.length === 0) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

   return (
      <MobileAppWrapper title="Bookmarks">
         <div className="min-h-screen animate-fade-in selection:bg-primary-500 selection:text-white mt-0">
            <Seo title="Bookmarks - AajExam" noIndex={true} />

            <div className="container mx-auto px-0 lg:px-8 py-4 lg:py-12 space-y-6 lg:space-y-12 mt-0">
               {/* Header */}
               <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center lg:text-left">
                     <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight">Bookmarks</h1>
                     <p className="text-sm font-bold text-gray-400">
                        {total > 0 ? `${total} saved reel${total > 1 ? 's' : ''}` : 'Your saved reels will appear here'}
                     </p>
                  </div>
               </div>

               {/* Bookmarked Reels Grid */}
               {reels.length === 0 ? (
                  <div className="py-4 lg:py-8 text-center space-y-3 lg:space-y-6">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                        <Bookmark className="w-10 h-10 text-gray-400" />
                     </div>
                     <h3 className="text-xl lg:text-2xl font-black font-outfit">No bookmarks yet</h3>
                     <p className="text-sm font-bold text-gray-400">Bookmark reels while watching to save them here</p>
                     <Button variant="primary" className="mx-auto" onClick={() => router.push('/reels')}>Browse Reels</Button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                     {reels.map((reel, idx) => {
                        const typeConfig = TYPE_CONFIG[reel.type] || TYPE_CONFIG.fact;
                        const TypeIcon = typeConfig.icon;
                        const diffStyle = DIFFICULTY_STYLES[reel.difficulty] || DIFFICULTY_STYLES.medium;

                        return (
                           <motion.div key={reel._id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="p-5 group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2 flex flex-col h-full">
                                 <div className="space-y-4 flex-1">
                                    {/* Top: Type badge + Difficulty + Unbookmark */}
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${typeConfig.bg} ${typeConfig.color}`}>
                                             <TypeIcon className="w-3 h-3" />
                                             {typeConfig.label}
                                          </div>
                                          {reel.difficulty && (
                                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${diffStyle}`}>
                                                {reel.difficulty}
                                             </span>
                                          )}
                                       </div>
                                       <button
                                          onClick={(e) => { e.stopPropagation(); handleUnbookmark(reel._id); }}
                                          className="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-colors"
                                          title="Remove bookmark"
                                       >
                                          <BookmarkCheck className="w-5 h-5" />
                                       </button>
                                    </div>

                                    {/* Subject & Topic */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                       {reel.subject && (
                                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 uppercase">
                                             #{reel.subject}
                                          </span>
                                       )}
                                       {reel.topic && (
                                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                                             #{reel.topic}
                                          </span>
                                       )}
                                    </div>

                                    {/* Title / Content */}
                                    <div className="space-y-1">
                                       <p className="font-black text-sm lg:text-base line-clamp-3 leading-snug">{getReelTitle(reel)}</p>
                                       {reel.type === 'question' && reel.userInteraction?.answered && (
                                          <div className={`flex items-center gap-1.5 text-xs font-bold ${reel.userInteraction.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                             {reel.userInteraction.isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                             {reel.userInteraction.isCorrect ? 'Answered correctly' : 'Answered incorrectly'}
                                          </div>
                                       )}
                                    </div>

                                    {/* Creator */}
                                    {reel.createdBy && (
                                       <p className="text-[10px] font-bold text-gray-400">
                                          by {reel.createdBy.name || reel.createdBy.username || 'Unknown'}
                                       </p>
                                    )}
                                 </div>

                                 {/* Footer: Engagement Stats */}
                                 <div className="flex items-center justify-between text-[9px] font-black text-gray-400 pt-3 mt-3 border-t-2 border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                       <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{reel.viewsCount || 0}</span>
                                       <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{reel.likesCount || 0}</span>
                                       <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{reel.sharesCount || 0}</span>
                                    </div>
                                    {reel.publishedAt && (
                                       <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(reel.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                       </div>
                                    )}
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

export default BookmarksPage;
