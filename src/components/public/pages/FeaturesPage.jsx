'use client';

import PageHero from '@/components/common/ui/PageHero';
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

import Card from '../../common/ui/Card';
import Button from '../../common/ui/Button';
import ProBadge from '../../common/ui/ProBadge';
import UnifiedFooter from '../../common/UnifiedFooter';
import { FREE_PLAN_FEATURES, PRO_PLAN_FEATURES } from '../../../lib/config/planFeatures';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';
import useTranslate from '../../../hooks/useTranslate';
import { PRO_PLANS } from '../../../lib/plans';

const cheapestPlan = PRO_PLANS.reduce((a, b) => (b.perMonth < a.perMonth ? b : a));
const lowestPerMonth = cheapestPlan.perMonth;

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
      { label: 'Q&A', free: true, pro: true },
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
  { icon: FileText, title: 'Every PYQ, every year', desc: 'Free unlocks the latest year of each exam. PRO unlocks every previous year paper ever published.', color: 'primary' },
  { icon: Target, title: 'Know your readiness', desc: 'PRO turns your attempts into a real Exam Readiness Score, section-wise analytics and full attempt history.', color: 'primary' },
  { icon: CalendarDays, title: 'A plan, not just quizzes', desc: 'AI Study Planner, Revision Queue and Syllabus Tracker keep PRO learners on a structured path to exam day.', color: 'primary' },
];

const Cell = ({ value }) => {
  const { translate } = useTranslate();
  if (value === true) return <span className="mx-auto w-5 h-5 xl:w-6 xl:h-6 flex items-center justify-center text-primary-600" style={{ borderRadius: 999 }}><CircleCheck className="w-3.5 h-3.5 xl:w-4 xl:h-4" /></span>;
  if (value === false) return <X className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-300 dark:text-slate-700 mx-auto" />;
  return <span className="inline-block whitespace-nowrap px-2.5 py-0.5 text-[9px] xl:text-[10px] font-bold uppercase tracking-wide dark:bg-white/10 text-primary-600 ring-1 ring-primary-200 dark:ring-white/15" style={{ borderRadius: 999 }}>{translate(value)}</span>;
};

const FeaturesPage = () => {
  const { translate, rich } = useTranslate();
  const router = useRouter();

  useAdminMobileHeader({ title: 'Features' });

  return (
    <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white">
      <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">

        {/* --- Hero --- */}
        <PageHero
          icon={Sparkles}
          eyebrow={translate('Features')}
          title={rich('Everything on <0>AajExam</0>', [(c) => <span className="text-primary-600">{c}</span>])}
        />

        {/* --- Plan Summary Cards --- */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-8">
          <Card as="section" className="relative overflow-hidden p-4 xl:p-10 space-y-3 xl:space-y-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 xl:p-4 bg-background-surface-secondary text-content-secondary" style={{ borderRadius: 14 }}>
                <GraduationCap className="w-5 h-5 xl:w-7 xl:h-7" />
              </div>
              <span className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 xl:px-3 py-1 bg-background-surface-secondary text-content-secondary border border-border-primary" style={{ borderRadius: 999 }}>{translate('Free forever')}</span>
            </div>
            <section>
              <h2 className="text-lg xl:text-2xl font-bold font-outfit tracking-tight">{translate('FREE')}</h2>
              <p className="text-xs xl:text-sm font-bold text-content-secondary mt-1">{translate('Everything you need to start preparing today, no card required.')}</p>
            </section>
            <ul className="space-y-1.5 xl:space-y-2.5">
              {FREE_PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs xl:text-sm font-bold text-content-secondary">
                  <span className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center text-primary-600" style={{ borderRadius: 999 }}><CircleCheck className="w-3.5 h-3.5" /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="pt-1 xl:pt-2">
              <Button variant="primary" size="sm" fullWidth onClick={() => router.push('/register')}>{translate('Get started free')}</Button>
            </div>
          </Card>

          <Card as="section" className="isolate p-4 xl:p-10 space-y-3 xl:space-y-6 ring-2 ring-primary-400/60 dark:ring-white/20 relative overflow-hidden bg-background-surface">
            <Crown className="absolute -bottom-8 -right-8 w-44 h-44 text-primary-600/10 dark:text-white/5" />
            <div className="flex items-center justify-between relative z-10">
              <div className="p-2.5 xl:p-4 text-on-primary bg-primary-600" style={{ borderRadius: 14 }}>
                <Crown className="w-5 h-5 xl:w-7 xl:h-7" />
              </div>
              <ProBadge size="sm" />
            </div>
            <section className="relative z-10">
              <h2 className="text-lg xl:text-2xl font-bold font-outfit tracking-tight">{translate('PRO')}</h2>
              <p className="text-xs xl:text-sm font-bold text-content-secondary mt-1">{translate('From ₹{price}/month with the {plan} plan — unlock the full exam-prep engine.', { price: lowestPerMonth, plan: translate(cheapestPlan.label) })} <span className="block mt-1 text-primary-600">{translate('Plans: {durations}', { durations: PRO_PLANS.map((p) => translate(p.label)).join(' · ') })}</span></p>
            </section>
            <ul className="space-y-1.5 xl:space-y-2.5 relative z-10">
              {PRO_PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs xl:text-sm font-bold text-content-secondary">
                  <span className="mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center text-primary-600" style={{ borderRadius: 999 }}><CircleCheck className="w-3.5 h-3.5" /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="pt-1 xl:pt-2 relative z-10">
              <Button variant="primary" size="sm" fullWidth icon={ArrowRight} iconPosition="right" onClick={() => router.push('/student/subscription')}>{translate('Upgrade to PRO')}</Button>
            </div>
          </Card>
        </section>

        {/* --- PRO plan comparison (prices/durations come from .env via lib/plans) --- */}
        <section className="space-y-3 xl:space-y-6">
          <section className="text-center space-y-1.5 xl:space-y-2 max-w-2xl mx-auto pb-3 border-b border-dashed border-primary-300/70 dark:border-white/15">
            <h2 className="text-base xl:text-3xl font-bold font-outfit tracking-tight">{translate('Compare PRO plans')}</h2>
            <p className="text-[10px] xl:text-sm font-bold text-content-muted uppercase tracking-[0.06em] tracking-[0.08em] px-2">{translate('Same PRO features in every plan — the longer you commit, the more you save')}</p>
          </section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-6">
            {PRO_PLANS.map((plan) => (
              <Card as="article" key={plan.id} className={`relative overflow-hidden p-4 xl:p-8 flex flex-col justify-between space-y-4 xl:space-y-6 hover:-translate-y-1 transition-all ${plan.badge ? 'ring-2 ring-primary-400/70' : ''}`}>
                <div className="space-y-2 xl:space-y-4">
                  <div className="flex items-center justify-between gap-2 min-h-[24px]">
                    <h3 className="text-sm xl:text-xl font-bold font-outfit tracking-tight">{translate(plan.label)}</h3>
                    {plan.badge && (
                      <span className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 text-on-primary whitespace-nowrap bg-primary-600" style={{ borderRadius: 999 }}>{translate(plan.badge)}</span>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl xl:text-4xl font-bold font-outfit leading-none text-primary-600">₹{plan.price}</span>
                    {plan.saving > 0 && <span className="text-xs xl:text-sm font-bold text-content-muted line-through pb-0.5">₹{plan.normalPrice}</span>}
                  </div>
                  <p className="text-xs xl:text-sm font-bold text-content-secondary">
                    ₹{Number.isInteger(plan.perMonth) ? plan.perMonth : plan.perMonth.toFixed(2)}{translate('/month')}
                    {plan.saving > 0 && <> · {translate('Save ₹{amount}', { amount: plan.saving })}</>}
                  </p>
                  {plan.discountPct > 0 && (
                    <span className="inline-block text-[10px] xl:text-xs font-bold px-2.5 py-1 text-primary-600 ring-1 ring-primary-200 dark:ring-white/15" style={{ borderRadius: 999 }}>{plan.discountPct}% OFF</span>
                  )}
                </div>
                <Button variant={plan.badge ? 'primary' : 'secondary'} size="sm" fullWidth icon={ArrowRight} iconPosition="right" onClick={() => router.push('/student/subscription')}>{translate('Choose plan')}</Button>
              </Card>
            ))}
          </div>
        </section>

        {/* --- Highlights --- */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-8">
          {HIGHLIGHTS.map((h, i) => (
            <Card as="article" key={i} className="group relative overflow-hidden space-y-2.5 xl:space-y-5 hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 xl:p-4 text-on-primary group-hover:rotate-0 transition-transform w-fit bg-primary-600" style={{ borderRadius: 14 }}>
                <h.icon className="w-4 h-4 xl:w-6 xl:h-6" />
              </div>
              <div className="space-y-1 xl:space-y-2">
                <h3 className="text-sm xl:text-lg font-bold font-outfit">{translate(h.title)}</h3>
                <p className="text-[10px] xl:text-[11px] font-bold text-content-secondary leading-relaxed uppercase tracking-[0.04em] xl:tracking-[0.08em]">{translate(h.desc)}</p>
              </div>
            </Card>
          ))}
        </section>

        {/* --- Full comparison --- */}
        <section className="space-y-2 xl:space-y-4 xl:space-y-8">
          <section className="text-center space-y-1.5 xl:space-y-2 max-w-2xl mx-auto pb-3 border-b border-dashed border-primary-300/70 dark:border-white/15">
            <h2 className="text-base xl:text-3xl font-bold font-outfit tracking-tight">{translate('Full feature comparison')}</h2>
            <p className="text-[10px] xl:text-sm font-bold text-content-muted uppercase tracking-[0.06em] tracking-[0.08em] px-2">{translate('Enforced on the server — locked content shows a real upgrade gate, not just a hidden button')}</p>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-6">
            {FEATURE_GROUPS.map((group) => (
              <Card as="article" key={group.title} className="p-0 overflow-hidden" padded={false}>
                <section className="relative flex items-center gap-2 xl:gap-3 px-3 py-2.5 xl:px-6 xl:py-4 text-content-primary border-b border-border-primary dark:border-transparent bg-background-surface">
                  <div className="relative p-2 xl:p-2.5 text-on-primary bg-primary-600" style={{ borderRadius: 10 }}>
                    <group.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  </div>
                  <h3 className="relative text-xs xl:text-sm font-bold font-outfit uppercase tracking-[0.08em]">{translate(group.title)}</h3>
                </section>
                <table className="w-full">
                  <thead className="border-b border-border-primary">
                    <tr className="text-[8px] xl:text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted dark:bg-white/5">
                      <th className="text-left px-3 py-1.5 xl:px-6 xl:py-2 font-bold">{translate('Feature')}</th>
                      <th className="whitespace-nowrap px-2 xl:px-3 py-1.5 xl:py-2 font-bold">{translate('Free')}</th>
                      <th className="whitespace-nowrap px-2 xl:px-3 py-1.5 xl:py-2 font-bold">{translate('Pro')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary">
                    {group.items.map((item, idx) => (
                      <tr key={item.label} className={`dark:hover:bg-white/5 transition-colors ${idx !== 0 ? 'border-t border-dashed border-border-primary' : ''}`}>
                        <td className="w-full px-3 py-2 xl:px-6 xl:py-3 text-[11px] xl:text-xs font-bold text-content-secondary">{translate(item.label)}</td>
                        <td className="text-center whitespace-nowrap px-2 xl:px-3 py-2 xl:py-3"><Cell value={item.free} /></td>
                        <td className="text-center whitespace-nowrap px-2 xl:px-3 py-2 xl:py-3"><Cell value={item.pro} /></td>
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
          <Card as="section" className="p-5 xl:p-16 text-center border border-primary-200 dark:border-slate-800 text-content-primary relative overflow-hidden bg-background-surface" style={{ borderRadius: 16 }}>
            <section className="relative z-10 space-y-2 xl:space-y-4 xl:space-y-8">
              <h2 className="text-lg xl:text-4xl font-bold font-outfit tracking-tight tracking-tight">{rich('Ready to go <0>PRO</0>?', [(c) => <span className="text-primary-600">{c}</span>])}</h2>
              <p className="text-xs xl:text-lg font-bold opacity-80 max-w-2xl mx-auto tracking-wide leading-relaxed px-1">
                {translate('Two tiers only — Free and PRO from ₹{price}/month ({plan} plan). No confusing add-ons.', { price: lowestPerMonth, plan: translate(cheapestPlan.label) })}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 xl:gap-4 items-center justify-center">
                <Button variant="primary" size="md" fullWidth icon={Crown} className="sm:w-fit" onClick={() => router.push('/student/subscription')}>{translate('Upgrade to PRO')}</Button>
                <Button variant="secondary" size="md" fullWidth className="sm:w-fit !bg-background-surface !border-primary-200 !text-content-primary dark:!bg-white/5 dark:!border-white/10 dark:!text-white" onClick={() => router.push('/register')}>{translate('Start free')}</Button>
              </div>
            </section>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage;
