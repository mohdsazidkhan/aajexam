'use client';
import { useState, useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { Users, Star, Award, Shield, BookOpen, Clock, MessageCircle, ChevronRight, Send, ThumbsUp, Calendar } from 'lucide-react';
import Link from '@/components/common/AppLink';
import API from '../../lib/api';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/ui/Card';
import { toast } from 'react-hot-toast';
import Seo from '../../components/common/Seo';
import { ProfileSkeleton } from '../../components/common/skeletons/PrivateSkeletons';
import { generateBreadcrumbSchema } from '../../utils/schema';
import useTranslate from '../../hooks/useTranslate';

export default function MentorProfilePage() {
  const { translate } = useTranslate();
  const router = useRouter();
  const { id } = router.query;
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [answeringId, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    API.request(`/api/mentor/${id}`).then(res => {
      if (res?.success) {
        setMentor(res.data);
        // Check if logged-in user is the mentor
        try {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            setIsOwner(user._id === res.data.user?._id || user.id === res.data.user?._id);
          }
        } catch {}
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAnswer = async (amaId) => {
    if (!answerText.trim()) return;
    setSubmittingAnswer(true);
    try {
      const res = await API.request(`/api/mentor/${id}/ama`, {
        method: 'PUT',
        body: JSON.stringify({ amaId, answer: answerText.trim() }),
      });
      if (res?.success) {
        toast.success(translate('Answer submitted!'));
        setAnsweringId(null);
        setAnswerText('');
        const updated = await API.request(`/api/mentor/${id}`);
        if (updated?.success) setMentor(updated.data);
      } else {
        toast.error(res?.message || translate('Failed to submit answer'));
      }
    } catch {
      toast.error(translate('Failed to submit answer'));
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setAskingQuestion(true);
    try {
      const res = await API.request(`/api/mentor/${id}/ama`, {
        method: 'POST',
        body: JSON.stringify({ question: question.trim() }),
      });
      if (res?.success) {
        toast.success(translate('Question submitted!'));
        setQuestion('');
        // Refresh mentor data
        const updated = await API.request(`/api/mentor/${id}`);
        if (updated?.success) setMentor(updated.data);
      } else {
        toast.error(res?.message || translate('Failed to submit question'));
      }
    } catch {
      toast.error(translate('Please login to ask a question'));
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleUpvote = async (amaId) => {
    try {
      const res = await API.request(`/api/mentor/${id}/ama/${amaId}/upvote`, { method: 'POST' });
      if (res?.success) {
        const updated = await API.request(`/api/mentor/${id}`);
        if (updated?.success) setMentor(updated.data);
      }
    } catch {
      toast.error(translate('Please login to upvote'));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background-page pb-20 font-outfit">
      <div className="py-8"><ProfileSkeleton /></div>
    </div>
  );

  if (!mentor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 18 }}><Users className="w-8 h-8" /></span>
        <p className="text-lg font-bold text-slate-500">{translate('Mentor not found')}</p>
        <button onClick={() => router.push('/mentors')} className="mt-4 text-sm font-bold text-primary-600 dark:text-primary-300">{translate('Back to Mentors')}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <Seo
        title={`${mentor.user?.name || 'Mentor'} – Government Exam Mentor on AajExam`}
        description={`Connect with ${mentor.user?.name || 'a verified mentor'} on AajExam for personalised guidance on ${mentor.targetExams?.map(e => e.name).join(', ') || 'government exams'}. Ask questions, get strategy and study plans from a verified topper.`}
        canonical={`/mentor/${id}`}
        keywords={[
          mentor.user?.name && `${mentor.user.name} mentor`,
          ...(mentor.targetExams || []).map(e => `${e.name} mentor`),
          'government exam mentor',
          'aajexam mentor'
        ].filter(Boolean)}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Mentors', url: '/mentors' },
          { name: mentor.user?.name || 'Mentor', url: `/mentor/${id}` }
        ])}
      />
      <div className="container mx-auto py-4 xl:py-4 xl:py-8 space-y-3 xl:space-y-6">

        {/* Profile Header */}
        <Card className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 shadow-xl ring-1 ring-slate-200 dark:ring-white/10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-lg rotate-[-4deg] flex items-center justify-center font-black text-2xl shrink-0" style={{ borderRadius: 18 }}>
              {mentor.user?.name?.charAt(0) || 'M'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{mentor.user?.name || translate('Mentor')}</h1>
                {mentor.isVerified && <Shield className="w-4 h-4 text-primary-600 dark:text-primary-300" />}
              </div>
              {mentor.user?.bio && <p className="text-sm text-slate-600 dark:text-white/70 mb-3">{mentor.user.bio}</p>}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 dark:text-white/70">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-black dark:text-white fill-black dark:fill-white" /> {mentor.rating?.toFixed(1) || '0.0'} ({mentor.totalRatings || 0})</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {translate('{count} helped', { count: mentor.helpedStudents || 0 })}</span>
                {mentor.preparationMonths > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {translate('{count} months prep', { count: mentor.preparationMonths })}</span>}
              </div>
            </div>
          </div>
        </Card>

        {/* Exams Cleared */}
        {mentor.examsCleared?.length > 0 && (
          <Card as="section">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2.5"><span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}><Award className="w-4 h-4" /></span> {translate('Exams Cleared')}</h2>
            <div className="flex flex-col gap-2">
              {mentor.examsCleared.map((exam, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/10 rounded-lg xl:rounded-xl border border-dashed border-primary-300 dark:border-white/15">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{exam.examName}</span>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span><Calendar className="w-3 h-3 inline" /> {exam.year}</span>
                    {exam.rank && <span>{translate('Rank: {rank}', { rank: exam.rank })}</span>}
                    {exam.score && <span>{translate('Score: {score}', { score: exam.score })}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Strategy */}
        {mentor.strategy && (
          <Card as="section">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">{translate('Preparation Strategy')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{mentor.strategy}</p>
          </Card>
        )}

        {/* Daily Routine */}
        {mentor.dailyRoutine && (
          <Card as="section">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2.5"><span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}><Clock className="w-4 h-4" /></span> {translate('Daily Routine')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{mentor.dailyRoutine}</p>
          </Card>
        )}

        {/* Tips */}
        {mentor.tips?.length > 0 && (
          <Card as="section">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">{translate('Tips for Students')}</h2>
            <ul className="space-y-2">
              {mentor.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <ChevronRight className="w-4 h-4 text-primary-600 dark:text-primary-300 shrink-0 mt-0.5" /> {tip}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Books */}
        {mentor.booksRecommended?.length > 0 && (
          <Card as="section">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2.5"><span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}><BookOpen className="w-4 h-4" /></span> {translate('Recommended Books')}</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.booksRecommended.map((book, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary-50 dark:bg-white/10 ring-1 ring-primary-200 dark:ring-white/15 rounded-lg text-xs font-bold text-slate-800 dark:text-white">{book}</span>
              ))}
            </div>
          </Card>
        )}

        {/* Specialization */}
        {mentor.specialization?.length > 0 && (
          <Card as="section">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">{translate('Specialization')}</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.specialization.map((spec, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-xs font-bold text-primary-600 dark:text-primary-400">{spec}</span>
              ))}
            </div>
          </Card>
        )}

        {/* AMA Section */}
        <Card as="section">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2.5"><span className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}><MessageCircle className="w-4 h-4" /></span> {translate('Ask Me Anything')}</h2>

          {/* Ask Question */}
          <div className="flex gap-2 mb-5">
            <input type="text" placeholder={translate('Ask a question...')} value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
              className="flex-1 bg-slate-50 dark:bg-black rounded-lg xl:rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-300 dark:border-slate-700" />
            <button aria-label={translate('Send')} onClick={handleAskQuestion} disabled={askingQuestion || !question.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow rounded-lg xl:rounded-xl text-xs font-bold disabled:opacity-50 shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* AMA Threads */}
          {mentor.amaThreads?.length > 0 ? (
            <div className="space-y-2 xl:space-y-4">
              {mentor.amaThreads.map((thread, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg xl:rounded-xl space-y-2">
                  <div>
                    {thread.askedBy && <Link href={`/u/${thread.askedBy.username || thread.askedBy.name}`} className="flex text-[10px] font-black text-primary-600 dark:text-primary-300 mr-1.5 hover:underline">@{thread.askedBy.username || thread.askedBy.name}</Link>}
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{thread.question}</span>
                  </div>
                  {thread.answer ? (
                    <div className="pl-3 border-l-2 border-primary-600">
                      <Link href={`/u/${mentor.user?.username || mentor.user?.name}`} className="flex text-[10px] font-black text-primary-600 dark:text-primary-300 mr-1.5 hover:underline">@{mentor.user?.username || mentor.user?.name}</Link>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{thread.answer}</span>
                    </div>
                  ) : isOwner ? (
                    answeringId === thread._id ? (
                      <div className="flex gap-2">
                        <input type="text" placeholder={translate('Write your answer...')} value={answerText} onChange={e => setAnswerText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAnswer(thread._id)}
                          className="flex-1 bg-slate-50 dark:bg-black rounded-lg xl:rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-300 dark:border-slate-700" />
                        <button aria-label={translate('Send')} onClick={() => handleAnswer(thread._id)} disabled={submittingAnswer || !answerText.trim()}
                          className="px-3 py-2 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow rounded-lg xl:rounded-xl text-xs font-bold disabled:opacity-50 shrink-0">
                          <Send className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setAnsweringId(null); setAnswerText(''); }}
                          className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg xl:rounded-xl text-xs font-bold shrink-0">
                          {translate('Cancel')}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setAnsweringId(thread._id); setAnswerText(''); }}
                        className="text-xs font-bold text-primary-600 dark:text-primary-300 hover:text-primary-600">
                        {translate('Write an answer')}
                      </button>
                    )
                  ) : (
                    <p className="text-xs text-slate-400 italic">{translate('Awaiting answer...')}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                    <button onClick={() => handleUpvote(thread._id)} className="flex items-center gap-1 hover:text-primary-600">
                      <ThumbsUp className="w-3 h-3" /> {thread.upvotes || 0}
                    </button>
                    {thread.askedAt && <span>{new Date(thread.askedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">{translate('No questions yet. Be the first to ask!')}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
