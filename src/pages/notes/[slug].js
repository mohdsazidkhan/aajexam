'use client';
import React, { useState } from 'react';
import { StickyNote, Bookmark, Eye, ArrowLeft, Tag } from 'lucide-react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Seo from '../../components/common/Seo';
import { generateBreadcrumbSchema, generateBlogPostingSchema } from '../../utils/schema';
import useTranslate from '../../hooks/useTranslate';

// Server-rendered so crawlers get the title, canonical, h1 and note body in the
// initial HTML (the page used to be a client-only shell that Google skipped).
export async function getServerSideProps({ params, res }) {
  const slug = params?.slug;
  if (!slug) return { notFound: true };

  try {
    const dbConnect = (await import('../../lib/db')).default;
    const StudyNote = (await import('../../models/StudyNote')).default;
    await import('../../models/Subject');
    await import('../../models/Topic');
    await import('../../models/Exam');
    await import('../../models/User');
    await dbConnect();

    const note = await StudyNote.findOne({ slug: String(slug), status: 'published' })
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('exam', 'name code')
      .populate('contributor', 'name username')
      .lean();
    if (!note) return { notFound: true };

    // Fire-and-forget view count, same as the old /api/notes/[slug] GET did.
    StudyNote.updateOne({ _id: note._id }, { $inc: { views: 1 } }).catch((e) => console.error('View increment failed:', e));
    note.views = (note.views || 0) + 1;

    if (res) res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    return { props: { note: JSON.parse(JSON.stringify(note)) } };
  } catch (e) {
    console.error('note ssr error', e);
    return { notFound: true };
  }
}

const NoteDetailPage = ({ note }) => {
  const { translate } = useTranslate();
  const [bookmarked, setBookmarked] = useState(false);
  const router = useRouter();
  const slug = note?.slug;

  const toggleBookmark = async () => {
    try {
      const res = await API.request(`/api/notes/${slug}/bookmark`, { method: 'POST' });
      if (res?.success) { setBookmarked(res.data.bookmarked); toast.success(res.data.bookmarked ? translate('Bookmarked!') : translate('Removed')); }
    } catch (e) { toast.error(translate('Login required')); }
  };

  if (!note) return null;

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
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
      <div className="py-0 xl:py-6">
        <button onClick={() => router.push('/notes')} className="text-sm font-bold text-primary-600 flex items-center gap-1 hover:underline"><ArrowLeft className="w-4 h-4" /> {translate('Back to Notes')}</button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-600 uppercase">{note.noteType?.replace('_', ' ')}</span>
              {note.subject?.name && <span className="text-[10px] font-bold text-slate-400">{note.subject.name}</span>}
              {note.topic?.name && <span className="text-[10px] font-bold text-slate-400">/ {note.topic.name}</span>}
            </div>
            <h1 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white">{note.title}</h1>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
              <span><Eye className="w-3 h-3 inline" /> {translate('{count} views', { count: note.views })}</span>
              <span><Bookmark className="w-3 h-3 inline" /> {translate('{count} saved', { count: note.bookmarks })}</span>
              {note.contributor?.name && <span>{translate('By {name}', { name: note.contributor.name })}</span>}
            </div>
          </div>
          <button onClick={toggleBookmark} className={`p-2 rounded-lg xl:rounded-xl transition-colors ${bookmarked ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
            <Bookmark className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <Card className="">
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
