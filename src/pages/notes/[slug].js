'use client';
import React, { useState, useEffect } from 'react';
import { StickyNote, Bookmark, Eye, ArrowLeft, Tag } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import Card from '../../components/ui/Card';
import Loading from '../../components/Loading';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema, generateBlogPostingSchema } from '../../utils/schema';

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (!slug) return;
    const fetchNote = async () => {
      try {
        const res = await API.request(`/api/notes/${slug}`);
        if (res?.success) setNote(res.data);
        else router.push('/notes');
      } catch (e) { router.push('/notes'); } finally { setLoading(false); }
    };
    fetchNote();
  }, [slug]);

  const toggleBookmark = async () => {
    try {
      const res = await API.request(`/api/notes/${slug}/bookmark`, { method: 'POST' });
      if (res?.success) { setBookmarked(res.data.bookmarked); toast.success(res.data.bookmarked ? 'Bookmarked!' : 'Removed'); }
    } catch (e) { toast.error('Login required'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;
  if (!note) return null;

  return (
    <div className="min-h-screen pb-24">
      <Seo
        title={`${note.title} – ${note.subject?.name ? note.subject.name + ' Notes' : 'Quick Revision Notes'} | AajExam`}
        description={`${note.title}${note.subject?.name ? ' – ' + note.subject.name : ''}${note.topic?.name ? ' (' + note.topic.name + ')' : ''}. Free quick revision notes, formulas and shortcuts for government exam aspirants on AajExam.`}
        canonical={`/notes/${slug}`}
        type="article"
        author={note.contributor?.name || 'AajExam Team'}
        keywords={[
          note.title,
          note.subject?.name && `${note.subject.name} notes`,
          note.topic?.name && `${note.topic.name} notes`,
          ...(note.tags || []),
          'free study notes',
          'aajexam notes'
        ].filter(Boolean)}
        schemas={[
          generateBlogPostingSchema({
            title: note.title,
            description: `${note.title}${note.subject?.name ? ' – ' + note.subject.name : ''} quick revision notes on AajExam.`,
            authorName: note.contributor?.name || 'AajExam Team',
            keywords: note.tags,
            category: note.subject?.name,
            url: `/notes/${slug}`
          }),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Notes & Formulas', url: '/notes' },
            { name: note.title, url: `/notes/${slug}` }
          ])
        ]}
      />
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <button onClick={() => router.push('/notes')} className="text-sm font-bold text-primary-500 flex items-center gap-1 hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Notes</button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-600 uppercase">{note.noteType?.replace('_', ' ')}</span>
              {note.subject?.name && <span className="text-[10px] font-bold text-slate-400">{note.subject.name}</span>}
              {note.topic?.name && <span className="text-[10px] font-bold text-slate-400">/ {note.topic.name}</span>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{note.title}</h1>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
              <span><Eye className="w-3 h-3 inline" /> {note.views} views</span>
              <span><Bookmark className="w-3 h-3 inline" /> {note.bookmarks} saved</span>
              {note.contributor?.name && <span>By {note.contributor.name}</span>}
            </div>
          </div>
          <button onClick={toggleBookmark} className={`p-2 rounded-xl transition-colors ${bookmarked ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
            <Bookmark className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <Card className="p-6 lg:p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: note.content }} />
        </Card>

        {note.tags?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-slate-400" />
            {note.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetailPage;
