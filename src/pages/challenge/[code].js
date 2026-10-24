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
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mb-6" />
                    <div className="bg-slate-200 dark:bg-slate-800 rounded-[2rem] p-8 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-300 dark:bg-slate-700 rounded-2xl" />
                        <div className="h-6 w-64 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                        <div className="h-4 w-40 bg-slate-300 dark:bg-slate-700 rounded-lg" />
                        <div className="h-16 w-40 bg-slate-300 dark:bg-slate-700 rounded-lg xl:rounded-xl" />
                        <div className="h-14 w-full bg-slate-300 dark:bg-slate-700 rounded-2xl" />
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
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 transition">
                    <ArrowLeft className="w-5 h-5" /> Back to Home
                </button>

                {/* Challenge Header Card */}
                <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 p-6 xl:p-8 text-center shadow-xl relative isolate overflow-hidden mb-8" style={{ borderRadius: 16 }}>
                    <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
                    <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow flex items-center justify-center mb-4 rotate-[-4deg]" style={{ borderRadius: 22 }}>
                            <Swords className="w-10 h-10" />
                        </div>
                        
                        <h1 className="text-slate-900 dark:text-white text-3xl font-black mb-2 uppercase tracking-wide">
                            {translate('{name} Challenged You!', { name: challenge.host?.name || translate('Someone') })}
                        </h1>
                        <p className="text-slate-700 dark:text-white/80 font-medium mb-6 text-lg">
                            {rich('Quiz: <0></0>', [() => <span className="text-primary-700 dark:text-primary-200 font-bold">{challenge.quiz?.title || translate('Unknown')}</span>])}
                        </p>

                        <div className="inline-block bg-white/80 dark:bg-white/10 ring-1 ring-slate-200 dark:ring-white/20 px-6 py-3 mb-6" style={{ borderRadius: 12 }}>
                            <p className="text-slate-600 dark:text-white/75 text-xs font-bold uppercase tracking-wider mb-1">{translate('Target to beat')}</p>
                            <p className="text-primary-700 dark:text-primary-200 text-4xl font-black font-outfit">{Math.round(hostScore?.percentage || 0)}%</p>
                        </div>

                        {!challenge.hasPlayed ? (
                            <button 
                                onClick={handleAcceptChallenge}
                                style={{ borderRadius: 14 }} className="w-full bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] hover:brightness-105 font-black text-xl py-4 shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Play className="w-6 h-6 fill-current" /> ACCEPT CHALLENGE
                            </button>
                        ) : (
                            <div className="bg-primary-100 dark:bg-primary-500/20 border border-primary-300 dark:border-primary-400/30 text-primary-800 dark:text-primary-100 px-6 py-3 rounded-lg xl:rounded-xl font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5" /> You have completed this challenge!
                            </div>
                        )}
                    </div>
                </div>

                {/* Private Leaderboard */}
                {challenge.hasPlayed && (
                    <div className="relative overflow-hidden bg-background-surface p-6 shadow-md border border-slate-200 dark:border-slate-700" style={{ borderRadius: 16 }}>
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow p-2.5" style={{ borderRadius: 12 }}>
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{translate('Challenge Leaderboard')}</h2>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.map((entry, index) => (
                                <div key={index} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                    index === 0 ? 'bg-primary-50 dark:bg-primary-400/10 border border-primary-300 dark:border-primary-400/40' :
                                    'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
                                }`}>
                                    <div className="flex-shrink-0">
                                        {index === 0 ? <Crown className="w-8 h-8 text-amber-500 drop-shadow-sm" /> :
                                         index === 1 ? <Medal className="w-8 h-8 text-slate-400 drop-shadow-sm" /> :
                                         index === 2 ? <Medal className="w-8 h-8 text-orange-500 drop-shadow-sm" /> :
                                         <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">#{index + 1}</div>}
                                    </div>
                                    
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white truncate text-lg">
                                            {entry.user?.name || translate('Anonymous')}
                                            {entry.isHost && <span className="ml-2 text-[10px] bg-primary-100 dark:bg-primary-400/20 text-primary-800 dark:text-primary-200 px-2 py-0.5 rounded-full uppercase tracking-wider">{translate('Host')}</span>}
                                        </h3>
                                    </div>

                                    <div className="text-right">
                                        <p className={`font-black text-2xl ${index === 0 ? 'text-primary-700 dark:text-primary-200' : 'text-slate-800 dark:text-white'}`}>
                                            {Math.round(entry.percentage)}%
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium">{Math.round(entry.totalTime)}s</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
