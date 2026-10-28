import { useState, useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { Trophy, Play, Users, ArrowLeft, Swords, Crown, Medal } from 'lucide-react';
import API from '../../lib/api';
import Seo from '../../components/common/Seo';
import toast from 'react-hot-toast';
import useTranslate from '../../hooks/useTranslate';

export default function ChallengePage() {
  const { translate, rich } = useTranslate();
    const router = useRouter();
    const { code } = router.query;
    
    const [challenge, setChallenge] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!code) return;
        API.request(`/api/challenge/${code}`)
            .then(res => {
                if (res?.success) {
                    setChallenge(res.challenge);
                    setLeaderboard(res.leaderboard);
                } else {
                    toast.error(translate('Challenge not found or expired'));
                    setTimeout(() => router.push('/'), 2000);
                }
            })
            .catch(() => toast.error(translate('Error loading challenge')))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- translate/fetch helper only feed toasts; re-running on language change would refetch or repeat side effects
    }, [code, router]);

    const handleAcceptChallenge = () => {
        // Must be logged in logic (assumes middleware protects /quiz/attempt or we just redirect)
        // Send them to quiz player with challenge code
        if (challenge?.quiz?.slug || challenge?.quiz?._id) {
            const id = challenge.quiz.slug || challenge.quiz._id;
            router.push(`/quiz/${id}/attempt?challengeCode=${code}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-page pb-24 font-outfit">
                <div className="max-w-xl mx-auto px-4 py-8 animate-pulse">
                    <div className="h-5 w-32 bg-background-surface-secondary rounded-full mb-6" />
                    <div className="bg-background-surface-secondary rounded-3xl p-8 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-border-primary dark:bg-slate-700 rounded-2xl" />
                        <div className="h-6 w-64 bg-border-primary dark:bg-slate-700 rounded-lg" />
                        <div className="h-4 w-40 bg-border-primary dark:bg-slate-700 rounded-lg" />
                        <div className="h-16 w-40 bg-border-primary dark:bg-slate-700 rounded-lg xl:rounded-xl" />
                        <div className="h-14 w-full bg-border-primary dark:bg-slate-700 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!challenge) return null;

    const hostScore = leaderboard.find(l => l.isHost);

    return (
        <div className="min-h-screen bg-background-page pb-24 font-outfit">
            <Seo title="Quiz Challenge!" description="You've been challenged to beat a quiz score." />

            <div className="max-w-xl mx-auto px-4 py-8">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-content-muted hover:text-content-primary dark:hover:text-white mb-6 transition">
                    <ArrowLeft className="w-5 h-5" /> Back to Home
                </button>

                {/* Challenge Header Card */}
                <div className="border border-border-primary p-6 xl:p-8 text-center relative isolate overflow-hidden mb-8 bg-background-surface" style={{ borderRadius: 'var(--radius)' }}>
                    
                    <header className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 text-primary-600 flex items-center justify-center mb-4 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
                            <Swords className="w-10 h-10" />
                        </div>
                        
                        <h1 className="text-content-primary text-3xl font-bold mb-2 tracking-wide">
                            {translate('{name} Challenged You!', { name: challenge.host?.name || translate('Someone') })}
                        </h1>
                        <p className="text-content-secondary dark:text-white/80 font-medium mb-6 text-lg">
                            {rich('Quiz: <0></0>', [() => <span className="text-primary-600 font-bold">{challenge.quiz?.title || translate('Unknown')}</span>])}
                        </p>

                        <div className="inline-block border border-border-primary px-6 py-3 mb-6" style={{ borderRadius: 'var(--radius)' }}>
                            <p className="text-content-secondary dark:text-white/75 text-xs font-bold uppercase tracking-[0.08em] mb-1">{translate('Target to beat')}</p>
                            <p className="text-primary-600 text-4xl font-bold font-outfit">{Math.round(hostScore?.percentage || 0)}%</p>
                        </div>

                        {!challenge.hasPlayed ? (
                            <button 
                                onClick={handleAcceptChallenge}
                                style={{ borderRadius: 'var(--radius)' }} className="w-full text-on-primary hover:brightness-105 font-bold text-xl py-4 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 bg-primary-600"
                            >
                                <Play className="w-6 h-6 fill-current" /> ACCEPT CHALLENGE
                            </button>
                        ) : (
                            <div className="border border-primary-300 dark:border-primary-400/30 text-primary-600 dark:text-primary-100 px-6 py-3 rounded-lg xl:rounded-xl font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5" /> You have completed this challenge!
                            </div>
                        )}
                    </header>
                </div>

                {/* Private Leaderboard */}
                {challenge.hasPlayed && (
                    <section className="relative overflow-hidden bg-background-surface p-6 border border-border-primary" style={{ borderRadius: 'var(--radius)' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="text-on-primary p-2.5 bg-primary-600" style={{ borderRadius: 'var(--radius)' }}>
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-content-primary tracking-tight">{translate('Challenge Leaderboard')}</h2>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.map((entry, index) => (
                                <section key={index} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                    index === 0 ? 'border border-primary-300 dark:border-primary-400/40' :
                                    'bg-background-surface-secondary hover:bg-background-surface-secondary border border-transparent'
                                }`}>
                                    <div className="flex-shrink-0">
                                        {index === 0 ? <Crown className="w-8 h-8 text-amber-500" /> :
                                         index === 1 ? <Medal className="w-8 h-8 text-content-muted" /> :
                                         index === 2 ? <Medal className="w-8 h-8 text-orange-500" /> :
                                         <div className="w-8 h-8 rounded-full bg-background-surface-secondary flex items-center justify-center font-bold text-content-muted">#{index + 1}</div>}
                                    </div>
                                    
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-content-primary truncate text-lg">
                                            {entry.user?.name || translate('Anonymous')}
                                            {entry.isHost && <span className="ml-2 text-[10px] text-primary-600 px-2 py-0.5 rounded-full uppercase tracking-[0.08em]">{translate('Host')}</span>}
                                        </h3>
                                    </div>

                                    <div className="text-right">
                                        <p className={`font-bold text-2xl ${index === 0 ? 'text-primary-600' : 'text-content-primary'}`}>
                                            {Math.round(entry.percentage)}%
                                        </p>
                                        <p className="text-xs text-content-muted font-medium">{Math.round(entry.totalTime)}s</p>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
