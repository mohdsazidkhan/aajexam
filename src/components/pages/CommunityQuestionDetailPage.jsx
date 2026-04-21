'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Eye, Heart, ArrowLeft, MessageSquare, Lock, CheckCircle2, XCircle, Lightbulb
} from 'lucide-react';
import API from '../../lib/api';
import Card from '../ui/Card';
import Loading from '../Loading';
import AnswerThread from '../community/AnswerThread';
import { getCurrentUser } from '../../lib/utils/authUtils';

export default function CommunityQuestionDetailPage() {
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
    if (!user) return toast.error('Please login to like');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="lg" /></div>;
  if (!question) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Question not found</p>
    </div>
  );

  const hasOptions = question.options?.some(o => o.text?.trim());
  const correctIndex = question.options?.findIndex(o => o.isCorrect);
  const canRevealAnswer = !hasOptions || attempted;

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto px-4 py-6 space-y-5">
        {/* Back */}
        <button onClick={() => router.push('/community-questions')} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
          <ArrowLeft className="w-4 h-4" /> All questions
        </button>

        {/* Question card */}
        <Card className="p-5 lg:p-6 space-y-4">
          {/* Author + exam */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
              {(question.author?.name || '?').charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{question.author?.name || 'User'}</span>
            {question.author?.username && (
              <Link href={`/u/${question.author.username}`} className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                @{question.author.username}
              </Link>
            )}
            {question.exam?.name && (
              <>
                <span className="text-slate-400">·</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold text-[10px] uppercase tracking-wider">
                  {question.exam.name}
                </span>
              </>
            )}
            <span className="text-slate-400 ml-auto">{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Question body */}
          <h1 className="pb-4 text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {question.question}
          </h1>

          {question.image && (
            <img src={question.image} alt="" className="max-h-80 rounded-lg border border-slate-200 dark:border-slate-700 object-contain bg-white" />
          )}

          {/* MCQ options (attempt-first-then-see) */}
          {hasOptions && (
            <div className="space-y-2">
              {question.options.map((opt, i) => {
                if (!opt.text) return null;
                const isSel = selectedOption === i;
                const isRight = i === correctIndex;
                let cls = 'border-slate-200 dark:border-slate-700 hover:border-primary-300 bg-white dark:bg-slate-800';
                if (attempted) {
                  if (isRight) cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
                  else if (isSel) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20';
                } else if (isSel) {
                  cls = 'border-primary-500 bg-primary-50 dark:bg-primary-900/20';
                }
                return (
                  <button
                    key={i}
                    disabled={attempted}
                    onClick={() => setSelectedOption(i)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-sm ${cls} disabled:cursor-default`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${attempted && isRight ? 'bg-emerald-500 text-white' : attempted && isSel ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="flex-1 text-slate-800 dark:text-slate-200">{opt.text}</span>
                    {attempted && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {attempted && isSel && !isRight && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  </button>
                );
              })}

              {!attempted && (
                <button
                  disabled={selectedOption === null}
                  onClick={() => setAttempted(true)}
                  className="w-full px-4 py-2.5 mt-1 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              )}
            </div>
          )}

          {/* Explanation — gated until attempted (for MCQ) */}
          {question.explanation && (
            canRevealAnswer ? (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Explanation
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{question.explanation}</p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-center">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Pick an option and submit to reveal the explanation
                </p>
              </div>
            )
          )}

          {/* Meta bar */}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500">
            <button onClick={toggleLike} className={`flex items-center gap-1 hover:text-red-500 transition ${liked ? 'text-red-500 font-bold' : ''}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /> {likes}
            </button>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {question.views || 0}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {question.answerCount || 0} answers</span>
          </div>
        </Card>

        {/* Answers */}
        <Card className="p-5 lg:p-6">
          <AnswerThread
            questionId={question._id}
            questionAuthorId={question.author?._id}
          />
        </Card>
      </div>
    </div>
  );
}
