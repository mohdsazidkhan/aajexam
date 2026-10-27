'use client';

import { useEffect, useState } from 'react';
import BookmarkButton from '../../common/BookmarkButton';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Link from '@/components/common/AppLink';
import { toast } from 'react-hot-toast';
import {
  Eye, Heart, ArrowLeft, MessageSquare, Lock, CheckCircle2, XCircle, Lightbulb
} from 'lucide-react';
import API from '../../../lib/api';
import Card from '../../common/ui/Card';
import { QAThreadSkeleton } from '../../common/skeletons/PrivateSkeletons';
import AnswerThread from '../../common/community/AnswerThread';
import { getCurrentUser } from '../../../lib/utils/authUtils';
import useTranslate from '../../../hooks/useTranslate';

export default function CommunityQuestionDetailPage() {
  const { translate } = useTranslate();
  const router = useRouter();
  const { id } = router.query;
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  // Attempt-first-then-see for MCQ community questions
  const [selectedOption, setSelectedOption] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const user = typeof window !== 'undefined' ? getCurrentUser() : null;
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await API.getCommunityQuestion(id);
        if (res?.success) {
          setQuestion(res.question);
          setLikes(res.question.likes || 0);
          setLiked(res.question.likedBy?.some(u => String(u) === String(currentUserId)));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, currentUserId]);

  const toggleLike = async () => {
    if (!user) return toast.error(translate('Please login to like'));
    if (liking) return;
    setLiking(true);
    const prev = liked;
    setLiked(!prev);
    setLikes(l => prev ? l - 1 : l + 1);
    try {
      const res = await API.toggleCommunityQuestionLike(id);
      if (!res?.success) { setLiked(prev); setLikes(l => prev ? l + 1 : l - 1); }
    } finally { setLiking(false); }
  };

  if (loading) return <div className="container mx-auto py-6"><QAThreadSkeleton /></div>;
  if (!question) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-content-muted">{translate('Question not found')}</p>
    </div>
  );

  const hasOptions = question.options?.some(o => o.text?.trim());
  const correctIndex = question.options?.findIndex(o => o.isCorrect);
  const canRevealAnswer = !hasOptions || attempted;

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <div className="container mx-auto py-6 space-y-5">
        {/* Back */}
        <button onClick={() => router.push('/community-questions')} className="inline-flex items-center gap-1 text-sm text-content-muted hover:text-primary-600">
          <ArrowLeft className="w-4 h-4" /> All questions
        </button>

        {/* Question card */}
        <Card className="space-y-2 xl:space-y-4">
          {/* Author + exam */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-primary-600 text-on-primary text-xs font-bold flex items-center justify-center">
              {(question.author?.name || '?').charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-content-primary">{question.author?.name || translate('User')}</span>
            {question.author?.username && (
              <Link href={`/@${question.author.username}`} className="text-primary-600 font-semibold hover:underline">
                @{question.author.username}
              </Link>
            )}
            {question.exam?.name && (
              <>
                <span className="text-content-muted">·</span>
                <span className="px-2 py-0.5 rounded-full text-primary-600 font-bold text-[10px] uppercase tracking-[0.08em]">
                  {question.exam.name}
                </span>
              </>
            )}
            <span className="text-content-muted ml-auto">{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Question body */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="pb-4 text-lg xl:text-xl font-bold text-content-primary leading-relaxed">
                {question.question}
              </h1>
            </div>
            <BookmarkButton type="community" id={question._id} variant="pill" className="shrink-0" />
          </div>

          {question.image && (
            <img src={question.image} alt="" className="max-h-80 rounded-lg border border-border-primary object-contain bg-background-surface" />
          )}

          {/* MCQ options (attempt-first-then-see) */}
          {hasOptions && (
            <div className="space-y-2">
              {question.options.map((opt, i) => {
                if (!opt.text) return null;
                const isSel = selectedOption === i;
                const isRight = i === correctIndex;
                let cls = 'border-border-primary hover:border-primary-300 bg-background-surface';
                if (attempted) {
                  if (isRight) cls = 'border-primary-400';
                  else if (isSel) cls = 'border-black dark:border-white bg-background-surface-secondary';
                } else if (isSel) {
                  cls = 'border-primary-600';
                }
                return (
                  <button
                    key={i}
                    disabled={attempted}
                    onClick={() => setSelectedOption(i)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg xl:rounded-xl border transition text-sm ${cls} disabled:cursor-default`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${attempted && isRight ?'bg-primary-600 text-on-primary': attempted && isSel ?'bg-primary-600 text-on-primary':'bg-background-surface-secondary text-content-muted'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="flex-1 text-content-primary">{opt.text}</span>
                    {attempted && isRight && <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />}
                    {attempted && isSel && !isRight && <XCircle className="w-4 h-4 text-content-primary shrink-0" />}
                  </button>
                );
              })}

              {!attempted && (
                <button
                  disabled={selectedOption === null}
                  onClick={() => setAttempted(true)}
                  className="w-full px-4 py-2.5 mt-1 bg-primary-600 hover:bg-primary-600 text-on-primary rounded-lg xl:rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {translate('Submit Answer')}
                </button>
              )}
            </div>
          )}

          {/* Explanation — gated until attempted (for MCQ) */}
          {question.explanation && (
            canRevealAnswer ? (
              <div className="mt-4 p-3 bg-background-surface-secondary rounded-lg border-l-4 border-black dark:border-white">
                <p className="text-xs font-bold text-content-primary uppercase mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Explanation
                </p>
                <p className="text-sm text-content-primary whitespace-pre-wrap">{question.explanation}</p>
              </div>
            ) : (
              <div className="p-3 bg-background-surface-secondary rounded-lg border border-dashed border-border-primary dark:border-slate-600 text-center">
                <p className="text-xs text-content-muted inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Pick an option and submit to reveal the explanation
                </p>
              </div>
            )
          )}

          {/* Meta bar */}
          <div className="flex items-center gap-4 pt-3 border-t border-border-primary text-xs text-content-muted">
            <button onClick={toggleLike} className={`flex items-center gap-1 hover:text-content-primary dark:hover:text-white transition ${liked ? 'text-content-primary font-bold' : ''}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /> {likes}
            </button>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {question.views || 0}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {translate('{count} answers', { count: question.answerCount || 0 })}</span>
          </div>
        </Card>

        {/* Answers */}
        <Card className="">
          <AnswerThread
            questionId={question._id}
            questionAuthorId={question.author?._id}
          />
        </Card>
      </div>
    </div>
  );
}
