'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { Trophy, Target, Crown, TrendingUp, Award, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import Seo from '../../components/Seo';
import PublicNavbar from '../../components/navbars/PublicNavbar';
import UnifiedFooter from '../../components/UnifiedFooter';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function SharedResult({ stats }) {
  const router = useRouter();
  const { rank, total, pct, score, accuracy, testTitle, user } = stats;

  const pctNum = parseFloat(pct) || 0;
  const band = pctNum >= 99 ? 'Top 1%'
    : pctNum >= 95 ? 'Top 5%'
    : pctNum >= 90 ? 'Top 10%'
    : pctNum >= 75 ? 'Top 25%'
    : pctNum >= 50 ? 'Top Half'
    : 'Rising Star';

  const title = rank && total
    ? `${user} scored Rank #${rank} of ${Number(total).toLocaleString('en-IN')} in ${testTitle} — AajExam`
    : `${user}'s ${testTitle} result — AajExam`;

  const description = pctNum > 0
    ? `${band} · Beat ${pctNum.toFixed(1)}% candidates · Score ${score} · Accuracy ${parseFloat(accuracy).toFixed(0)}%. Take this free mock test on AajExam.`
    : `Score ${score} · Accuracy ${parseFloat(accuracy).toFixed(0)}%. Take this free government exam mock test on AajExam.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
  const params = new URLSearchParams();
  if (rank) params.set('rank', rank);
  if (total) params.set('total', total);
  if (pct) params.set('pct', pct);
  if (score != null) params.set('score', score);
  if (accuracy != null) params.set('accuracy', accuracy);
  if (testTitle) params.set('testTitle', testTitle);
  if (user) params.set('user', user);
  const ogImage = `${siteUrl}/api/og/result?${params.toString()}`;

  return (
    <>
      <Seo
        title={title}
        description={description}
        image={ogImage}
        type="article"
      />

      <PublicNavbar />

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-10">

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative"
          >
            <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-primary-500 via-indigo-600 to-purple-600 text-white p-8 lg:p-12">
              <div className="absolute top-0 right-0 opacity-10">
                <Trophy className="w-64 h-64 rotate-12" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-300 text-yellow-900 text-xs font-black uppercase tracking-widest">
                  <Crown className="w-4 h-4" />
                  {band}
                </div>

                <div className="space-y-2">
                  <p className="text-sm lg:text-base font-black uppercase tracking-widest opacity-80">
                    {user} scored
                  </p>
                  <h1 className="text-3xl lg:text-5xl font-black font-outfit tracking-tight">
                    {testTitle}
                  </h1>
                </div>

                {rank && total && (
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-5xl lg:text-7xl font-black tracking-tighter text-yellow-300">
                      #{rank}
                    </span>
                    <span className="text-xl lg:text-2xl font-bold opacity-80">
                      of {Number(total).toLocaleString('en-IN')} candidates
                    </span>
                  </div>
                )}

                {pctNum > 0 && (
                  <p className="text-lg lg:text-xl font-bold opacity-90">
                    Beat <span className="text-yellow-300">{pctNum.toFixed(1)}%</span> of candidates on AajExam
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Rank', value: rank ? `#${rank}` : '—', icon: Award, color: 'text-yellow-500' },
              { label: 'Percentile', value: pctNum > 0 ? pctNum.toFixed(1) : '—', icon: TrendingUp, color: 'text-primary-500' },
              { label: 'Score', value: score ?? '—', icon: Zap, color: 'text-green-500' },
              { label: 'Accuracy', value: accuracy != null ? `${parseFloat(accuracy).toFixed(0)}%` : '—', icon: Target, color: 'text-purple-500' },
            ].map((item, idx) => (
              <Card key={idx} className="flex flex-col items-center text-center p-6 gap-2 border-2">
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xl lg:text-2xl font-black font-outfit">{item.value}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
              </Card>
            ))}
          </section>

          <Card className="p-8 lg:p-10 border-2 text-center space-y-5 bg-white dark:bg-slate-800">
            <h2 className="text-2xl lg:text-3xl font-black font-outfit uppercase">
              Think you can beat this?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Free unlimited mock tests for SSC, RRB, Banking, and State Police exams. Track your All India Rank live.
            </p>
            <div className="flex flex-col lg:flex-row justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/govt-exams')}
                className="px-10 py-5 text-lg"
              >
                Take this test <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/register')}
                className="px-10 py-5 text-lg border-2"
              >
                Sign up free
              </Button>
            </div>
          </Card>

        </div>
      </main>

      <UnifiedFooter />
    </>
  );
}

export async function getServerSideProps({ query, res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');

  const stats = {
    rank: query.rank || null,
    total: query.total || null,
    pct: query.pct || null,
    score: query.score ?? null,
    accuracy: query.accuracy ?? null,
    testTitle: (query.testTitle || 'Mock Test').toString().slice(0, 120),
    user: (query.user || 'An AajExam Aspirant').toString().slice(0, 40)
  };

  return { props: { stats } };
}
