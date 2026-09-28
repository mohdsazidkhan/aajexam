'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  GraduationCap,
  FileText,
  BrainCircuit,
  Target,
  Flame,
  TrendingUp,
  Globe,
  History,
  RotateCcw,
  CalendarDays,
  Layers,
  Users,
  Swords,
  Trophy,
  PlayCircle,
  MessageSquarePlus,
  StickyNote,
  Gift,
  ShieldCheck,
  Crown,
  CircleCheck,
  X,
  ArrowRight,
} from 'lucide-react';

import Card from '../ui/Card';
import Button from '../ui/Button';
import ProBadge from '../ui/ProBadge';
import UnifiedFooter from '../UnifiedFooter';
import config from '../../lib/config/appConfig';
import { FREE_PLAN_FEATURES, PRO_PLAN_FEATURES } from '../../lib/config/planFeatures';
import { useAdminMobileHeader } from '../../contexts/AdminMobileHeaderContext';

const proPrice = config?.SUBSCRIPTION_PLANS?.PRO?.price ?? 99;

const FEATURE_GROUPS = [
  {
    title: 'Govt. exam practice',
    icon: GraduationCap,
    color: 'primary',
    items: [
      { label: 'Exam-wise patterns & stages', free: true, pro: true },
      { label: 'Previous Year Papers (PYQ)', free: 'Latest year only', pro: 'Every year, unlocked' },
      { label: 'Full-length mock tests', free: 'First mock free', pro: 'Unlimited mocks' },
    ],
  },
  {
    title: 'Quizzes & topic practice',
    icon: BrainCircuit,
    color: 'primary',
    items: [
      { label: 'Topic-wise practice quizzes', free: true, pro: true },
      { label: 'Subject tests', free: '2 per day', pro: 'Unlimited' },
      { label: 'Adaptive practice (AI difficulty-tuned)', free: false, pro: true },
    ],
  },
  {
    title: 'Daily habit',
    icon: Flame,
    color: 'primary',
    items: [
      { label: 'Daily Challenge + streak', free: true, pro: true },
      { label: 'Streak freeze (protect your streak)', free: false, pro: '2 per week' },
      { label: 'Current affairs & exam news', free: true, pro: true },
      { label: 'Exam calendar', free: true, pro: true },
    ],
  },
  {
    title: 'Progress & analytics',
    icon: TrendingUp,
    color: 'primary',
    items: [
      { label: 'Basic score card after each test', free: true, pro: true },
      { label: 'Leaderboard & rank', free: true, pro: true },
      { label: 'All India Rank (AIR)', free: false, pro: true },
      { label: 'Performance analytics', free: false, pro: true },
      { label: 'Exam Readiness Score', free: false, pro: true },
      { label: 'Quiz & exam attempt history', free: false, pro: true },
    ],
  },
  {
    title: 'Study tools',
    icon: StickyNote,
    color: 'primary',
    items: [
      { label: 'Notes & formulas', free: true, pro: true },
      { label: 'Flashcards', free: true, pro: true },
      { label: 'AI Study Planner', free: false, pro: true },
      { label: 'Revision Queue (spaced repetition)', free: false, pro: true },
      { label: 'Syllabus Tracker', free: false, pro: true },
      { label: 'Mentors (guidance from top scorers)', free: false, pro: true },
    ],
  },
  {
    title: 'Community & multiplayer',
    icon: Users,
    color: 'primary',
    items: [
      { label: 'Educational Reels', free: true, pro: true },
      { label: 'Community Q&A', free: true, pro: true },
      { label: 'Multiplayer Challenges (1v1)', free: false, pro: true },
    ],
  },
  {
    title: 'Refer & earn',
    icon: Gift,
    color: 'primary',
    items: [
      { label: 'Referral code & invite tracking', free: true, pro: true },
      { label: 'Cash reward when a friend buys PRO', free: true, pro: true },
      { label: 'Withdraw to bank account', free: true, pro: true },
    ],
  },
  {
    title: 'Experience',
    icon: ShieldCheck,
    color: 'primary',
    items: [
      { label: 'Ad-free practice', free: false, pro: true },
      { label: 'PRO badge on profile & leaderboard', free: false, pro: true },
    ],
  },
];

const HIGHLIGHTS = [
  { icon: FileText, title: 'Every PYQ, every year', desc: 'Free unlocks the latest year for each exam pattern. PRO unlocks every previous year paper ever published.', color: 'primary' },
  { icon: Target, title: 'Know your readiness', desc: 'PRO turns your attempts into a real Exam Readiness Score, section-wise analytics and full attempt history.', color: 'primary' },
  { icon: CalendarDays, title: 'A plan, not just quizzes', desc: 'AI Study Planner, Revision Queue and Syllabus Tracker keep PRO learners on a structured path to exam day.', color: 'primary' },
];

const Cell = ({ value }) => {
  if (value === true) return <CircleCheck className="w-4 h-4 xl:w-5 xl:h-5 text-primary-600 mx-auto" />;
  if (value === false) return <X className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-300 dark:text-slate-700 mx-auto" />;
  return <span className="text-[9px] xl:text-[11px] font-black uppercase tracking-wide text-black dark:text-white">{value}</span>;
};

const FeaturesPage = () => {
  const router = useRouter();

  useAdminMobileHeader({ title: 'Features' });

  return (
    <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white">
      <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">

        {/* --- Hero --- */}
        <section className="text-center space-y-3 xl:space-y-6 px-0 py-4 xl:py-8">
          <div className="w-14 h-14 xl:w-20 xl:h-20 bg-primary-600 text-white rounded-2xl xl:rounded-[2rem] flex items-center justify-center mx-auto shadow-sm rotate-6">
            <Sparkles className="w-6 h-6 xl:w-9 xl:h-9" />
          </div>
          <div className="space-y-2 xl:space-y-4">
            <h1 className="text-xl xl:text-5xl font-black font-outfit uppercase tracking-tight xl:tracking-tighter text-slate-900 dark:text-white">
              Everything on <span className="text-primary-600">AajExam</span>
            </h1>
            <p className="text-xs xl:text-base font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.08em] xl:tracking-[0.2em] max-w-2xl mx-auto px-2">
              One platform for govt. exam prep — see exactly what&apos;s Free and what unlocks with PRO
            </p>
          </div>
        </section>

        {/* --- Plan Summary Cards --- */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-8">
          <Card className="p-4 xl:p-10 space-y-3 xl:space-y-6 border-2">
            <div className="flex items-center justify-between">
              <div className="p-2.5 xl:p-4 bg-slate-500/10 text-slate-500 rounded-lg xl:rounded-xl xl:rounded-2xl">
                <GraduationCap className="w-5 h-5 xl:w-7 xl:h-7" />
              </div>
              <span className="text-[9px] xl:text-[10px] font-black uppercase tracking-widest px-2.5 xl:px-3 py-1 rounded-full bg-slate-500/10 text-slate-500">Free forever</span>
            </div>
            <div>
              <h2 className="text-lg xl:text-2xl font-black font-outfit uppercase tracking-tight">Free</h2>
              <p className="text-xs xl:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">Everything you need to start preparing today, no card required.</p>
            </div>
            <ul className="space-y-1.5 xl:space-y-2.5">
              {FREE_PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-300">
                  <CircleCheck className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="pt-1 xl:pt-2">
              <Button variant="primary" size="sm" fullWidth onClick={() => router.push('/register')}>Get started free</Button>
            </div>
          </Card>

          <Card className="p-4 xl:p-10 space-y-3 xl:space-y-6 border-2 border-primary-500/40 relative overflow-hidden">
            <Crown className="absolute -bottom-8 -right-8 w-40 h-40 text-primary-500/5" />
            <div className="flex items-center justify-between relative z-10">
              <div className="p-2.5 xl:p-4 bg-primary-500/10 text-primary-600 rounded-lg xl:rounded-xl xl:rounded-2xl">
                <Crown className="w-5 h-5 xl:w-7 xl:h-7" />
              </div>
              <ProBadge size="sm" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg xl:text-2xl font-black font-outfit uppercase tracking-tight">PRO</h2>
              <p className="text-xs xl:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">₹{proPrice}/month — unlock the full exam-prep engine.</p>
            </div>
            <ul className="space-y-1.5 xl:space-y-2.5 relative z-10">
              {PRO_PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs xl:text-sm font-bold text-slate-700 dark:text-slate-300">
                  <CircleCheck className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="pt-1 xl:pt-2 relative z-10">
              <Button variant="primary" size="sm" fullWidth icon={ArrowRight} iconPosition="right" onClick={() => router.push('/subscription')}>Upgrade to PRO</Button>
            </div>
          </Card>
        </section>

        {/* --- Highlights --- */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-8">
          {HIGHLIGHTS.map((h, i) => (
            <Card key={i} className="group space-y-2.5 xl:space-y-5 border-2 hover:border-primary-500/50 transition-all duration-300">
              <div className={`p-2.5 xl:p-4 bg-${h.color}-500/10 text-${h.color}-500 rounded-lg xl:rounded-xl xl:rounded-2xl group-hover:scale-110 transition-transform w-fit shadow-sm`}>
                <h.icon className="w-4 h-4 xl:w-6 xl:h-6" />
              </div>
              <div className="space-y-1 xl:space-y-2">
                <h3 className="text-sm xl:text-lg font-black font-outfit uppercase">{h.title}</h3>
                <p className="text-[10px] xl:text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-[0.04em] xl:tracking-[0.08em]">{h.desc}</p>
              </div>
            </Card>
          ))}
        </section>

        {/* --- Full comparison --- */}
        <section className="space-y-2 xl:space-y-4 xl:space-y-8">
          <div className="text-center space-y-1.5 xl:space-y-2 max-w-2xl mx-auto">
            <h2 className="text-base xl:text-3xl font-black font-outfit uppercase tracking-tight">Full feature comparison</h2>
            <p className="text-[10px] xl:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.06em] xl:tracking-[0.15em] px-2">Enforced on the server — locked content shows a real upgrade gate, not just a hidden button</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-6">
            {FEATURE_GROUPS.map((group) => (
              <Card key={group.title} className="p-0 overflow-hidden border-2" padded={false}>
                <div className="flex items-center gap-2 xl:gap-3 px-3 py-2.5 xl:px-6 xl:py-4 border-b-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                  <div className={`p-2 xl:p-2.5 bg-${group.color}-500/10 text-${group.color}-500 rounded-lg xl:rounded-xl`}>
                    <group.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  </div>
                  <h3 className="text-xs xl:text-sm font-black font-outfit uppercase tracking-wide">{group.title}</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-[8px] xl:text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <th className="text-left px-3 py-1.5 xl:px-6 xl:py-2 font-black">Feature</th>
                      <th className="w-12 xl:w-16 py-1.5 xl:py-2 font-black">Free</th>
                      <th className="w-12 xl:w-16 py-1.5 xl:py-2 font-black">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, idx) => (
                      <tr key={item.label} className={idx !== 0 ? 'border-t border-slate-200 dark:border-slate-800' : ''}>
                        <td className="px-3 py-2 xl:px-6 xl:py-3 text-[11px] xl:text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</td>
                        <td className="text-center py-2 xl:py-3"><Cell value={item.free} /></td>
                        <td className="text-center py-2 xl:py-3"><Cell value={item.pro} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ))}
          </div>
        </section>

        {/* --- CTA --- */}
        <section className="px-0 py-4 xl:py-8">
          <Card className="p-5 xl:p-16 text-center bg-slate-950 dark:bg-slate-900 border-2 border-slate-800 text-white shadow-sm relative overflow-hidden rounded-[2rem] xl:rounded-[4rem]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
            <div className="relative z-10 space-y-2 xl:space-y-4 xl:space-y-8">
              <h2 className="text-lg xl:text-4xl font-black font-outfit uppercase tracking-tight xl:tracking-tighter">Ready to go <span className="text-primary-400">PRO</span>?</h2>
              <p className="text-xs xl:text-lg font-bold opacity-80 max-w-2xl mx-auto uppercase tracking-wide leading-relaxed px-1">
                Two tiers only — Free and PRO at ₹{proPrice}/month. No confusing add-ons.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 xl:gap-4 items-center justify-center">
                <Button variant="primary" size="md" fullWidth icon={Crown} className="sm:w-fit" onClick={() => router.push('/subscription')}>Upgrade to PRO</Button>
                <Button variant="secondary" size="md" fullWidth className="sm:w-fit !bg-white/5 !border-white/10 !text-white" onClick={() => router.push('/register')}>Start free</Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage;
