import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Trophy, Play, Users, ArrowLeft, Swords, Crown, Medal } from 'lucide-react';
import API from '../../lib/api';
import Seo from '../../components/Seo';
import toast from 'react-hot-toast';

export default function ChallengePage() {
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
                    toast.error('Challenge not found or expired');
                    setTimeout(() => router.push('/'), 2000);
                }
            })
            .catch(() => toast.error('Error loading challenge'))
            .finally(() => setLoading(false));
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!challenge) return null;

    const hostScore = leaderboard.find(l => l.isHost);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-outfit">
            <Seo title="Quiz Challenge!" description="You've been challenged to beat a quiz score." />

            <div className="max-w-xl mx-auto px-4 py-8">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 transition">
                    <ArrowLeft className="w-5 h-5" /> Back to Home
                </button>

                {/* Challenge Header Card */}
                <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 rotate-12 shadow-lg">
                            <Swords className="w-10 h-10 text-white drop-shadow-md" />
                        </div>
                        
                        <h1 className="text-white text-3xl font-black mb-2 uppercase tracking-wide">
                            {challenge.host?.name || 'Someone'} Challenged You!
                        </h1>
                        <p className="text-indigo-100 font-medium mb-6 text-lg">
                            Quiz: <span className="text-white font-bold">{challenge.quiz?.title || 'Unknown'}</span>
                        </p>

                        <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 mb-6">
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Target to beat</p>
                            <p className="text-white text-4xl font-black">{Math.round(hostScore?.percentage || 0)}%</p>
                        </div>

                        {!challenge.hasPlayed ? (
                            <button 
                                onClick={handleAcceptChallenge}
                                className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black text-xl py-4 rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Play className="w-6 h-6 fill-current" /> ACCEPT CHALLENGE
                            </button>
                        ) : (
                            <div className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5" /> You have completed this challenge!
                            </div>
                        )}
                    </div>
                </div>

                {/* Private Leaderboard */}
                {challenge.hasPlayed && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl">
                                <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Challenge Leaderboard</h2>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.map((entry, index) => (
                                <div key={index} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700' :
                                    'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
                                }`}>
                                    <div className="flex-shrink-0">
                                        {index === 0 ? <Crown className="w-8 h-8 text-yellow-500 drop-shadow-sm" /> :
                                         index === 1 ? <Medal className="w-8 h-8 text-slate-400 drop-shadow-sm" /> :
                                         index === 2 ? <Medal className="w-8 h-8 text-amber-600 drop-shadow-sm" /> :
                                         <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">#{index + 1}</div>}
                                    </div>
                                    
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white truncate text-lg">
                                            {entry.user?.name || 'Anonymous'}
                                            {entry.isHost && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Host</span>}
                                        </h3>
                                    </div>

                                    <div className="text-right">
                                        <p className={`font-black text-2xl ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-800 dark:text-white'}`}>
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
