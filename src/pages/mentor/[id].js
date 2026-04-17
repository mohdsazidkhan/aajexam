'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Users, Star, Award, Shield, BookOpen, Clock, MessageCircle, ChevronRight, Send, ThumbsUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import API from '../../lib/api';
import Loading from '../../components/Loading';
import Card from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

export default function MentorProfilePage() {
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
        toast.success('Answer submitted!');
        setAnsweringId(null);
        setAnswerText('');
        const updated = await API.request(`/api/mentor/${id}`);
        if (updated?.success) setMentor(updated.data);
      } else {
        toast.error(res?.message || 'Failed to submit answer');
      }
    } catch {
      toast.error('Failed to submit answer');
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
        toast.success('Question submitted!');
        setQuestion('');
        // Refresh mentor data
        const updated = await API.request(`/api/mentor/${id}`);
        if (updated?.success) setMentor(updated.data);
      } else {
        toast.error(res?.message || 'Failed to submit question');
      }
    } catch {
      toast.error('Please login to ask a question');
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
      toast.error('Please login to upvote');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="lg" /></div>;

  if (!mentor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-lg font-bold text-slate-500">Mentor not found</p>
        <button onClick={() => router.push('/mentors')} className="mt-4 text-sm font-bold text-primary-600">Back to Mentors</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      <Head><title>{mentor.user?.name || 'Mentor'} - AajExam Mentor</title></Head>
      <div className="max-w-3xl mx-auto py-4 lg:py-8 px-4 space-y-6">

        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 font-black text-2xl shrink-0">
              {mentor.user?.name?.charAt(0) || 'M'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{mentor.user?.name || 'Mentor'}</h1>
                {mentor.isVerified && <Shield className="w-4 h-4 text-emerald-500" />}
              </div>
              {mentor.user?.bio && <p className="text-sm text-slate-500 mb-3">{mentor.user.bio}</p>}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {mentor.rating?.toFixed(1) || '0.0'} ({mentor.totalRatings || 0})</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {mentor.helpedStudents || 0} helped</span>
                {mentor.preparationMonths > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mentor.preparationMonths} months prep</span>}
              </div>
            </div>
          </div>
        </Card>

        {/* Exams Cleared */}
        {mentor.examsCleared?.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-500" /> Exams Cleared</h2>
            <div className="flex flex-col gap-2">
              {mentor.examsCleared.map((exam, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{exam.examName}</span>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <span><Calendar className="w-3 h-3 inline" /> {exam.year}</span>
                    {exam.rank && <span>Rank: {exam.rank}</span>}
                    {exam.score && <span>Score: {exam.score}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Strategy */}
        {mentor.strategy && (
          <Card className="p-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Preparation Strategy</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{mentor.strategy}</p>
          </Card>
        )}

        {/* Daily Routine */}
        {mentor.dailyRoutine && (
          <Card className="p-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> Daily Routine</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{mentor.dailyRoutine}</p>
          </Card>
        )}

        {/* Tips */}
        {mentor.tips?.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Tips for Students</h2>
            <ul className="space-y-2">
              {mentor.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <ChevronRight className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" /> {tip}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Books */}
        {mentor.booksRecommended?.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange-500" /> Recommended Books</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.booksRecommended.map((book, i) => (
                <span key={i} className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-xs font-bold text-orange-700 dark:text-orange-400">{book}</span>
              ))}
            </div>
          </Card>
        )}

        {/* Specialization */}
        {mentor.specialization?.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Specialization</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.specialization.map((spec, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-xs font-bold text-primary-700 dark:text-primary-400">{spec}</span>
              ))}
            </div>
          </Card>
        )}

        {/* AMA Section */}
        <Card className="p-5">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary-500" /> Ask Me Anything</h2>

          {/* Ask Question */}
          <div className="flex gap-2 mb-5">
            <input type="text" placeholder="Ask a question..." value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
              className="flex-1 bg-white dark:bg-slate-800 rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-200 dark:border-slate-700" />
            <button onClick={handleAskQuestion} disabled={askingQuestion || !question.trim()}
              className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* AMA Threads */}
          {mentor.amaThreads?.length > 0 ? (
            <div className="space-y-4">
              {mentor.amaThreads.map((thread, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                  <div>
                    {thread.askedBy && <Link href={`/u/${thread.askedBy.username || thread.askedBy.name}`} className="text-[10px] font-black text-primary-600 dark:text-primary-400 mr-1.5 hover:underline">@{thread.askedBy.username || thread.askedBy.name}</Link>}
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{thread.question}</span>
                  </div>
                  {thread.answer ? (
                    <div className="pl-3 border-l-2 border-primary-500">
                      <Link href={`/u/${mentor.user?.username || mentor.user?.name}`} className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mr-1.5 hover:underline">@{mentor.user?.username || mentor.user?.name}</Link>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{thread.answer}</span>
                    </div>
                  ) : isOwner ? (
                    answeringId === thread._id ? (
                      <div className="flex gap-2">
                        <input type="text" placeholder="Write your answer..." value={answerText} onChange={e => setAnswerText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAnswer(thread._id)}
                          className="flex-1 bg-white dark:bg-slate-800 rounded-xl py-2 px-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-700" />
                        <button onClick={() => handleAnswer(thread._id)} disabled={submittingAnswer || !answerText.trim()}
                          className="px-3 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 shrink-0">
                          <Send className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setAnsweringId(null); setAnswerText(''); }}
                          className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold shrink-0">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setAnsweringId(thread._id); setAnswerText(''); }}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700">
                        Write an answer
                      </button>
                    )
                  ) : (
                    <p className="text-xs text-slate-400 italic">Awaiting answer...</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                    <button onClick={() => handleUpvote(thread._id)} className="flex items-center gap-1 hover:text-primary-500">
                      <ThumbsUp className="w-3 h-3" /> {thread.upvotes || 0}
                    </button>
                    {thread.askedAt && <span>{new Date(thread.askedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No questions yet. Be the first to ask!</p>
          )}
        </Card>
      </div>
    </div>
  );
}
