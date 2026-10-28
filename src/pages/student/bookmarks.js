'use client';

import PageHero from '@/components/common/ui/PageHero';
import { CardsPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
   XCircle,
   FileText,
   BrainCircuit,
   MessageSquare,
   StickyNote,
   Megaphone,
   Layers,
   Hash,
   PenSquare,
   ChevronRight
} from 'lucide-react';
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from '@/components/common/AppLink';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/common/MobileAppWrapper';
import Card from '../../components/common/ui/Card';
import Button from '../../components/common/ui/Button';
import Seo from '../../components/common/Seo';
import Pagination from '../../components/common/Pagination';
import useTranslate from '../../hooks/useTranslate';

const TYPE_CONFIG = {
   question: { label: 'Question', icon: HelpCircle, color: 'text-content-primary', bg: 'bg-background-surface-secondary' },
   fact: { label: 'Fact', icon: BookOpen, color: 'text-content-primary', bg: 'bg-background-surface-secondary' },
   tip: { label: 'Tip', icon: Zap, color: 'text-content-primary', bg: 'bg-background-surface-secondary' },
   current_affairs: { label: 'Current Affairs', icon: Newspaper, color: 'text-content-primary', bg: 'bg-background-surface-secondary' },
   poll: { label: 'Poll', icon: BarChart3, color: 'text-content-primary', bg: 'bg-background-surface-secondary' },
};

const DIFFICULTY_STYLES = {
   easy: 'text-primary-600',
   medium: 'text-content-primary bg-background-surface-secondary',
   hard: 'text-content-primary bg-background-surface-secondary',
};

// One tab per kind of saved content. `reel` has its own card layout and API; the rest share the
// generic list from /api/bookmarks.
const TABS = [
   { id: 'test', label: 'Tests', icon: FileText },
   { id: 'quiz', label: 'Quizzes', icon: BrainCircuit },
   { id: 'community', label: 'Q&A', icon: MessageSquare },
   { id: 'note', label: 'Notes', icon: StickyNote },
   { id: 'news', label: 'Exam News', icon: Megaphone },
   { id: 'affair', label: 'Current Affairs', icon: Newspaper },
   { id: 'subject', label: 'Subjects', icon: Layers },
   { id: 'topic', label: 'Topics', icon: Hash },
   { id: 'blog', label: 'Blog', icon: PenSquare },
   { id: 'reel', label: 'Reels', icon: PlayCircle },
];

const PAGE_SIZE = 12;

const BookmarksPage = () => {
   const { translate } = useTranslate();
   const router = useRouter();
   const [counts, setCounts] = useState(null);
   const [activeTab, setActiveTab] = useState(null);
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const tabsRef = useRef(null);

   // Tab badges. The first tab that has something becomes the default tab.
   useEffect(() => {
      let cancelled = false;
      (async () => {
         try {
            const res = await API.request('/api/bookmarks/counts');
            if (cancelled) return;
            const data = res?.data || {};
            setCounts(data);
            setActiveTab((cur) => cur || TABS.find((t) => data[t.id] > 0)?.id || 'test');
         } catch {
            if (!cancelled) { setCounts({}); setActiveTab((cur) => cur || 'test'); }
         }
      })();
      return () => { cancelled = true; };
   }, []);

   const fetchItems = useCallback(async (tab, page) => {
      if (!tab) return;
      try {
         setLoading(true);
         const res = tab === 'reel'
            ? await API.getBookmarkedReels({ page, limit: PAGE_SIZE })
            : await API.request(`/api/bookmarks?type=${tab}&page=${page}&limit=${PAGE_SIZE}`);
         if (res?.success) {
            setItems(res.data || []);
            setTotalPages(res.pagination?.totalPages || 1);
         } else {
            toast.error(translate('Could not load bookmarks'));
         }
      } catch {
         toast.error(translate('Could not load bookmarks'));
      } finally {
         setLoading(false);
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => { fetchItems(activeTab, currentPage); }, [activeTab, currentPage, fetchItems]);

   const switchTab = (id) => {
      if (id === activeTab) return;
      setItems([]);
      setCurrentPage(1);
      setActiveTab(id);
   };

   const bumpCount = (tab, delta) => setCounts((prev) => ({ ...(prev || {}), [tab]: Math.max(0, ((prev || {})[tab] || 0) + delta) }));

   const handleUnbookmark = async (item) => {
      try {
         if (activeTab === 'reel') {
            await API.bookmarkReel(item._id);
            setItems((prev) => prev.filter((r) => r._id !== item._id));
         } else {
            await API.request('/api/bookmarks', { method: 'POST', body: JSON.stringify({ type: activeTab, id: item.id }) });
            setItems((prev) => prev.filter((x) => x.id !== item.id));
         }
         bumpCount(activeTab, -1);
         toast.success(translate('Removed from bookmarks'));
      } catch {
         toast.error(translate('Failed to remove bookmark'));
      }
   };

   const getReelTitle = (reel) => {
      if (reel.title) return reel.title;
      if (reel.type === 'question' && reel.questionText) return reel.questionText;
      if (reel.type === 'poll' && reel.pollQuestion) return reel.pollQuestion;
      if (reel.content) return reel.content;
      return 'Untitled Reel';
   };

   const total = counts ? TABS.reduce((sum, t) => sum + (counts[t.id] || 0), 0) : 0;
   const activeDef = TABS.find((t) => t.id === activeTab);

   if (!counts || (loading && items.length === 0 && !activeTab)) return (
      <MobileAppWrapper title={translate('My Bookmarks')}>
         <div className="py-2 xl:py-4"><CardsPageSkeleton count={6} /></div>
      </MobileAppWrapper>
   );

   return (
      <MobileAppWrapper title={translate('My Bookmarks')}>
         <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white mt-0">
            <Seo title="Bookmarks - AajExam" noIndex={true} />

            <div className="container mx-auto py-2 xl:py-4 space-y-3 xl:space-y-4 mt-0">
               <PageHero
                  icon={Bookmark}
                  eyebrow={translate('My Bookmarks')}
                  title={translate('My Bookmarks')}
                  actions={
                     <div className="ring-1 ring-slate-200 dark:ring-white/20 px-4 py-1.5 min-w-[96px]" style={{ borderRadius: 10 }}>
                        <p className="text-lg font-bold font-outfit leading-none text-primary-600">{total}</p>
                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-content-secondary dark:text-white/75">{translate('Saved')}</p>
                     </div>
                  }
               />

               {/* Tabs */}
               <div ref={tabsRef} role="tablist" className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1 p-1 bg-background-surface ring-1 ring-primary-200 dark:ring-0 dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 w-full" style={{ borderRadius: 12 }}>
                  {TABS.map((tab) => {
                     const active = activeTab === tab.id;
                     const n = counts[tab.id] || 0;
                     return (
                        <button
                           key={tab.id}
                           role="tab"
                           aria-selected={active}
                           onClick={() => switchTab(tab.id)}
                           className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 font-bold uppercase text-[10px] xl:text-[11px] tracking-[0.08em] transition-all whitespace-nowrap flex-shrink-0 ${active ? 'bg-primary-600 text-on-primary dark:bg-white dark:text-primary-700' : 'text-content-secondary dark:text-white/90 dark:hover:bg-white/15'}`}
                           style={{ borderRadius: 9 }}
                        >
                           <tab.icon className={`w-3.5 h-3.5 ${active ? 'text-white dark:text-primary-600' : 'text-primary-600'}`} />
                           {translate(tab.label)}
                           <span className={`min-w-[1.25rem] px-1.5 py-0.5 text-[9px] leading-none text-center ${active ? 'bg-white/25' : 'text-primary-600'}`} style={{ borderRadius: 999 }}>{n}</span>
                        </button>
                     );
                  })}
               </div>

               {loading && items.length === 0 ? (
                  <CardsPageSkeleton count={6} />
               ) : items.length === 0 ? (
                  <div className="py-4 xl:py-8 text-center space-y-3 xl:space-y-6">
                     <div className="w-24 h-24 bg-background-surface-secondary rounded-3xl flex items-center justify-center mx-auto opacity-50">
                        <Bookmark className="w-10 h-10 text-content-muted" />
                     </div>
                     <h2 className="text-xl xl:text-2xl font-bold font-outfit">{translate('No bookmarks yet')}</h2>
                     <p className="text-sm font-bold text-content-muted">
                        {activeTab === 'reel' ? translate('Bookmark reels while watching to save them here') : translate('Tap the bookmark icon on any item to save it here.')}
                     </p>
                     {activeTab === 'reel' && (
                        <Button variant="primary" className="mx-auto" onClick={() => router.push('/reels')}>{translate('Browse Reels')}</Button>
                     )}
                  </div>
               ) : activeTab === 'reel' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
                     {items.map((reel, idx) => {
                        const typeConfig = TYPE_CONFIG[reel.type] || TYPE_CONFIG.fact;
                        const TypeIcon = typeConfig.icon;
                        const diffStyle = DIFFICULTY_STYLES[reel.difficulty] || DIFFICULTY_STYLES.medium;

                        return (
                           <motion.div key={reel._id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className="group cursor-pointer transition-all duration-500 border flex flex-col h-full">
                                 <div className="space-y-2 xl:space-y-4 flex-1">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${typeConfig.bg} ${typeConfig.color}`}>
                                             <TypeIcon className="w-3 h-3" />
                                             {translate(typeConfig.label)}
                                          </div>
                                          {reel.difficulty && (
                                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${diffStyle}`}>
                                                {reel.difficulty}
                                             </span>
                                          )}
                                       </div>
                                       <button
                                          onClick={(e) => { e.stopPropagation(); handleUnbookmark(reel); }}
                                          className="p-1.5 text-primary-600 rounded-lg xl:rounded-xl transition-colors"
                                          title={translate('Remove bookmark')}
                                       >
                                          <BookmarkCheck className="w-5 h-5" />
                                       </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5">
                                       {reel.subject && (
                                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-background-surface-secondary text-content-primary uppercase">
                                             #{reel.subject}
                                          </span>
                                       )}
                                       {reel.topic && (
                                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-background-surface-secondary text-content-primary">
                                             #{reel.topic}
                                          </span>
                                       )}
                                    </div>

                                    <div className="space-y-1">
                                       <p className="font-bold text-sm xl:text-base line-clamp-3 leading-snug">{getReelTitle(reel)}</p>
                                       {reel.type === 'question' && reel.userInteraction?.answered && (
                                          <div className={`flex items-center gap-1.5 text-xs font-bold ${reel.userInteraction.isCorrect ? 'text-primary-600' : 'text-content-primary'}`}>
                                             {reel.userInteraction.isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                             {reel.userInteraction.isCorrect ? translate('Answered correctly') : translate('Answered incorrectly')}
                                          </div>
                                       )}
                                    </div>

                                    {reel.createdBy && (
                                       <p className="text-[10px] font-bold text-content-muted">
                                          {translate('by {name}', { name: reel.createdBy.name || reel.createdBy.username || translate('Unknown') })}
                                       </p>
                                    )}
                                 </div>

                                 <div className="flex items-center justify-between text-[9px] font-bold text-content-muted pt-3 mt-3 border-t-2 border-border-primary dark:border-slate-800">
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
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                     {items.map((item, idx) => {
                        const TabIcon = activeDef?.icon || Bookmark;
                        return (
                           <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.04, 0.4) }}>
                              <div className="group relative flex items-center gap-3 p-3 bg-background-surface border border-border-primary hover:border-primary-400 dark:hover:border-primary-600 transition-all" style={{ borderRadius: 16 }}>
                                 <Link href={item.href} className="flex flex-1 min-w-0 items-center gap-3">
                                    <span className="w-10 h-10 shrink-0 flex items-center justify-center text-primary-600" style={{ borderRadius: 12 }}>
                                       <TabIcon className="w-5 h-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                       <span className="block text-sm font-bold text-content-primary line-clamp-2 leading-snug">{item.title}</span>
                                       {item.meta && <span className="block mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted truncate">{item.meta}</span>}
                                    </span>
                                    <ChevronRight className="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                                 </Link>
                                 <button
                                    onClick={() => handleUnbookmark(item)}
                                    className="p-2 shrink-0 text-primary-600 transition-colors"
                                    style={{ borderRadius: 12 }}
                                    title={translate('Remove bookmark')}
                                    aria-label={translate('Remove bookmark')}
                                 >
                                    <BookmarkCheck className="w-5 h-5" />
                                 </button>
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>
               )}

               {/* Pagination */}
               {totalPages > 1 && (
                  <div className="flex justify-center pt-6">
                     <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
               )}
            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default BookmarksPage;
