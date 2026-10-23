'use client';
import React, { useState, useRef } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import useTranslate from '../../hooks/useTranslate';
import { trackPrompt } from '../../lib/tracker';
import { useFreePromoActive } from '../../lib/freePromo';

const LETTERS = ['A', 'B', 'C', 'D'];

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const SignupGate = ({ score, total }) => {
  const { translate } = useTranslate();
  const router = useRouter();
  const promoActive = useFreePromoActive();
  const [busy, setBusy] = useState(false);

  const googleSignup = useGoogleLogin({
    onSuccess: async (response) => {
      setBusy(true);
      try {
        const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then((r) => r.json());
        const authRes = await API.googleAuth({ googleId: info.sub, email: info.email, name: info.name, picture: info.picture });
        if (authRes.success) {
          localStorage.setItem('userInfo', JSON.stringify(authRes.user));
          localStorage.setItem('token', authRes.token);
          window.dispatchEvent(new CustomEvent('authStateChanged'));
          toast.success(translate('Welcome to AajExam! 🎉 Your free PRO access is unlocked.'));
          router.push(authRes.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        }
      } catch (e) {
        toast.error(translate('Google sign-up failed. Please try again.'));
      } finally {
        setBusy(false);
      }
    },
    onError: () => toast.error(translate('Google sign-up was cancelled.')),
  });

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-300 to-primary-500 dark:from-primary-200 dark:to-primary-400 text-primary-950 shadow-lg mb-3 rotate-[-4deg]" style={{ borderRadius: 14 }}>
        <span className="text-2xl font-black">{score}/{total}</span>
      </div>
      <h3 className="text-xl xl:text-2xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white mb-2">
        {score >= 4 ? translate('Great score! Imagine a full mock test.') : translate('Good start! Let\'s fix the gaps.')}
      </h3>
      <ul className="text-sm font-bold text-slate-600 dark:text-slate-400 space-y-1.5 mb-5 max-w-sm mx-auto text-left">
        <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary-600 shrink-0" />{translate('Step-by-step explanations for every question')}</li>
        <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary-600 shrink-0" />{translate('Thousands of PYQs & full-length mock tests')}</li>
        <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary-600 shrink-0" />{translate('Weak-topic analysis to track your progress')}</li>
      </ul>
      <button
        onClick={() => { trackPrompt('sample', 'click'); googleSignup(); }}
        disabled={busy}
        className="w-full max-w-sm inline-flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm disabled:opacity-70"
      >
        {busy ? <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /> : <GoogleIcon />}
        {busy ? translate('Signing in...') : translate(promoActive ? 'Get PRO Free Now' : 'Claim Free Account')}
      </button>
      {promoActive && (
        <p className="mt-3 text-[10px] text-red-600 dark:text-red-500 font-bold uppercase tracking-widest">{translate('Offer valid till 31 Dec 2026')}</p>
      )}
    </div>
  );
};

/**
 * Try-before-signup: 5 real questions, instant right/wrong per question, then the explanations, full tests and
 * progress tracking sit behind a one-tap Google signup. Public visitors only (rendered by the landing page).
 */
export default function SampleQuiz() {
  const { translate } = useTranslate();
  const [phase, setPhase] = useState('idle'); // idle | loading | playing | done
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null); // { correct, correctIndex } for the current question
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  const start = async () => {
    setPhase('loading');
    try {
      const res = await fetch('/api/public/sample-quiz');
      const data = await res.json();
      if (!res.ok || !data.success || !data.data?.length) throw new Error('empty');
      setQuestions(data.data);
      setIdx(0); setScore(0); setPicked(null); setResult(null);
      setPhase('playing');
      if (!startedRef.current) { startedRef.current = true; trackPrompt('sample', 'shown'); }
    } catch (e) {
      toast.error(translate('Could not load the sample quiz.'));
      setPhase('idle');
    }
  };

  const choose = async (i) => {
    if (busy || picked !== null) return;
    setPicked(i);
    setBusy(true);
    try {
      const res = await fetch('/api/public/sample-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: questions[idx].id, choice: i }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('check failed');
      setResult({ correct: data.correct, correctIndex: data.correctIndex });
      if (data.correct) setScore((s) => s + 1);
    } catch (e) {
      toast.error(translate('Could not check the answer.'));
      setPicked(null);
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setPhase('done'); return; }
    setIdx(idx + 1); setPicked(null); setResult(null);
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const q = questions[idx];

  return (
    <section className="container mx-auto px-3 xl:px-0 py-4 xl:py-8">
      <div className="relative overflow-hidden w-full bg-background-surface border border-slate-200 dark:border-slate-800 shadow-xl p-4 xl:p-6" style={{ borderRadius: 16 }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
        <div className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
        {phase === 'idle' || phase === 'loading' ? (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-primary-300 to-primary-500 dark:from-primary-200 dark:to-primary-400 text-primary-950 shadow-lg flex items-center justify-center rotate-[-4deg]" style={{ borderRadius: 14 }}>
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl xl:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white mb-2">
              {translate('Try 5 free questions. No signup.')}
            </h2>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-5 max-w-md mx-auto">
              {translate('See how AajExam practice feels. Instant right or wrong on every question.')}
            </p>
            <button
              onClick={start}
              disabled={phase === 'loading'}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:brightness-110 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg disabled:opacity-70"
            >
              {phase === 'loading' ? translate('Loading...') : translate('Start the quiz')}
              {phase !== 'loading' && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        ) : null}

        {phase === 'playing' && q ? (
          <div>
            <div className="flex items-center justify-between mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <span>{translate('Question')} {idx + 1}/{questions.length}</span>
              <span>{translate('Score')}: {score}</span>
            </div>
            <p className="text-base xl:text-lg font-black text-slate-900 dark:text-white mb-4 leading-snug">{q.text}</p>
            <div className="space-y-2.5">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const reveal = result !== null;
                const isRight = reveal && i === result.correctIndex;
                const isWrong = reveal && isPicked && !result.correct;
                const tone = isRight
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : isWrong
                    ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                    : isPicked
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-500/60 text-slate-800 dark:text-slate-200';
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={picked !== null}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition ${tone}`}
                  >
                    <span className="w-7 h-7 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300">{LETTERS[i]}</span>
                    <span className="flex-1">{opt}</span>
                    {isRight && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    {isWrong && <XCircle className="w-5 h-5 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {result !== null && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />{translate('Explanation unlocks after signup')}
                </p>
                <button onClick={next} className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl">
                  {idx + 1 >= questions.length ? translate('See my score') : translate('Next')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : null}

        {phase === 'done' ? (
          clientId && clientId !== 'your_google_client_id_here' ? (
            <GoogleOAuthProvider clientId={clientId}>
              <SignupGate score={score} total={questions.length} />
            </GoogleOAuthProvider>
          ) : (
            <div className="text-center text-sm font-bold">{translate('Your score')}: {score}/{questions.length}</div>
          )
        ) : null}
      </div>
    </section>
  );
}
