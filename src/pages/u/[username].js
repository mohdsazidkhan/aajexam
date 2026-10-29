import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from '@/components/common/AppLink';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { PlayCircle, Eye, FileText, Lightbulb, Zap, Newspaper, BarChart3, Trophy, Award, MapPin, Target, MessageSquare, HelpCircle, ArrowRight, Users, UserCheck, TrendingUp, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { useSelector } from 'react-redux';
import API from '../../lib/api';
import { isAuthenticated } from '../../lib/utils/authUtils';
import { PublicProfileSkeleton } from '../../components/common/skeletons/PrivateSkeletons';
import dbConnect from '../../lib/db';
import User from '../../models/User';
import { ProBadge } from '../../components/common/ui';
import FollowButton from '../../components/common/FollowButton';
import MobileAppWrapper from '../../components/common/MobileAppWrapper';
import Seo from '../../components/common/Seo';
import useTranslate from '../../hooks/useTranslate';

// Number that counts up from 0 on mount (instant in lite mode).
const CountUp = ({ value, prefix = '', suffix = '', className = '' }) => {
  const liteMode = useSelector((s) => s.display?.liteMode);
  const target = Number(value) || 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (liteMode || target === 0) { setN(target); return undefined; }
    let raf;
    let start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 900);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, liteMode]);
  return <span className={className}>{prefix}{n.toLocaleString()}{suffix}</span>;
};

// "View All" link at the end of a section heading (own profile only).
const ViewAll = ({ href, label }) => (
  <Link href={href} className="inline-flex items-center gap-1 shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-600 hover:underline">
    {label}
    <ArrowRight className="w-3 h-3" />
  </Link>
);

// Section card: eyebrow heading with a fading rule, over a soft glowing surface.
const Section = ({ icon: Icon, title, meta, action, className = '', children }) => (
  <section
    className={`group/section relative overflow-hidden bg-background-surface p-3 sm:p-4 ring-1 ring-primary-500/15 transition-shadow hover:shadow-primary-500/50 ${className}`}
    style={{ borderRadius: 'var(--radius)' }}
  >
    <h2 className="relative flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-[0.08em] text-content-primary">
      <span className="flex items-center justify-center w-7 h-7 text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      {title}
      {meta !== undefined && <span className="px-2 py-0.5 text-primary-600 text-[10px] tracking-normal" style={{ borderRadius: 'var(--radius-sm)' }}>{meta}</span>}
      <span className="flex-1 h-px bg-primary-600" />
      {action}
    </h2>
    <div className="relative">{children}</div>
  </section>
);

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, x: Twitter, youtube: Youtube };

const LINE_CLS = 'border-border-primary';

const PublicProfilePage = ({ username: ssrUsername, profile: ssrProfile, seo }) => {
  const { translate } = useTranslate();
  const router = useRouter();
  const { username = ssrUsername } = router.query || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [authed, setAuthed] = useState(false); // Follow is for signed-in visitors only
  useEffect(() => { setAuthed(isAuthenticated()); }, []);
  useEffect(() => {
    if (!username) return;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setIsOwnProfile(false); // never carry the owner buttons over from the previously viewed profile
      const res = await API.request(`/api/users/profile/${encodeURIComponent(username)}`);
      if (res?.success) {
        setProfile({ ...res.user, ...res.stats });
        setIsFollowing(!!res.isFollowing);
        setIsOwnProfile(!!res.isOwnProfile);
      } else {
        setError(res?.message || translate('Failed to load profile'));
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || translate('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  };

  // Reels
  const [reels, setReels] = useState([]);
  const [reelsPage, setReelsPage] = useState(1);
  const [reelsTotal, setReelsTotal] = useState(0);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [hasMoreReels, setHasMoreReels] = useState(false);

  const fetchReels = useCallback(async (page = 1) => {
    try {
      setReelsLoading(true);
      const res = await API.request(`/api/users/profile/${encodeURIComponent(username)}/reels?page=${page}&limit=12`);
      if (res?.success) {
        setReels(prev => page === 1 ? res.reels : [...prev, ...res.reels]);
        setReelsTotal(res.pagination.total);
        setHasMoreReels(page < res.pagination.totalPages);
        setReelsPage(page);
      }
    } catch (e) {
      console.error('Failed to load reels:', e);
    } finally {
      setReelsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) fetchReels(1);
  }, [username, fetchReels]);

  // Community questions this user asked (approved only)
  const [cQuestions, setCQuestions] = useState([]);
  const [cqPage, setCqPage] = useState(1);
  const [cqTotal, setCqTotal] = useState(0);
  const [cqLoading, setCqLoading] = useState(false);
  const [hasMoreCq, setHasMoreCq] = useState(false);

  const fetchCommunityQuestions = useCallback(async (page = 1) => {
    try {
      setCqLoading(true);
      const res = await API.request(`/api/users/profile/${encodeURIComponent(username)}/community-questions?page=${page}&limit=6`);
      if (res?.success) {
        setCQuestions(prev => page === 1 ? res.questions : [...prev, ...res.questions]);
        setCqTotal(res.pagination.total);
        setHasMoreCq(page < res.pagination.totalPages);
        setCqPage(page);
      }
    } catch (e) {
      console.error('Failed to load community questions:', e);
    } finally {
      setCqLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) fetchCommunityQuestions(1);
  }, [username, fetchCommunityQuestions]);

  const handleFollowChange = (newFollowStatus) => {
    setIsFollowing(newFollowStatus);
    if (profile) {
      setProfile({
        ...profile,
        followersCount: (profile.followersCount || 0) + (newFollowStatus ? 1 : -1)
      });
    }
  };

  // Rendered in every state (loading / error / loaded) from the statically generated props, so the
  // first HTML Google fetches already has the title, canonical, noindex flag and structured data.
  const seoProfile = profile || ssrProfile;
  const seoPublic = Boolean(seoProfile?.isPublicProfile);
  const seoTag = (
    <Seo
      title={seo?.title || 'Profile - AajExam'}
      description={seo?.description}
      keywords={seo?.keywords}
      image={seo?.image}
      canonical={seo?.url}
      type="profile"
      noIndex={!seoPublic}
      schemas={seoPublic ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: seo?.url,
        mainEntity: {
          '@type': 'Person',
          name: seoProfile.name,
          alternateName: `@${seoProfile.username}`,
          url: seo?.url,
          ...(seoProfile.bio ? { description: seoProfile.bio } : {}),
          ...(seoProfile.profilePicture ? { image: seoProfile.profilePicture } : {}),
        },
      } : undefined}
    />
  );

  if (loading) return (
    <div className="min-h-screen bg-background-page pb-20 font-outfit">
      {seoTag}
      {ssrProfile && seoPublic && (
        <div className="sr-only">
          <h1>{ssrProfile.name} (@{ssrProfile.username})</h1>
          {ssrProfile.bio && <p>{ssrProfile.bio}</p>}
        </div>
      )}
      <PublicProfileSkeleton />
    </div>
  );

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 font-outfit">
        {seoTag}
        <h2 className="text-lg xl:text-3xl font-bold text-content-primary mb-4 tracking-tight">{translate('Profile Not Found')}</h2>
        <p className="text-content-secondary mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-800 text-on-primary font-semibold rounded-lg transition-colors"
        >
          {translate('Go Back')}
        </button>
      </section>
    );
  }

  if (!profile) return null;

  const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n || 0);
  const exam = profile.performanceMetrics?.examStats;
  const showStats = profile.isPublicProfile || isOwnProfile;
  const socialLinks = Object.entries(profile.socialLinks || {}).filter(([key, url]) => SOCIAL_ICONS[key] && /^https?:\/\//i.test(url || ''));
  const initial = profile.name?.charAt(0)?.toUpperCase() || 'U';

  const stats = [
    { label: 'Followers', value: profile.followersCount || 0, icon: Users, href: `/@${encodeURIComponent(profile.username)}/followers` },
    { label: 'Following', value: profile.followingCount || 0, icon: UserCheck, href: `/@${encodeURIComponent(profile.username)}/following` },
    { label: 'Reels', value: profile.reelsCount || 0, icon: PlayCircle },
    { label: 'Views', value: profile.profileViews || 0, icon: Eye },
  ];

  const strip = [
    ...stats,
    ...(showStats ? [
      { label: 'Tests', value: exam?.mockTestsAttempted || 0, icon: FileText },
      { label: 'Quizzes', value: profile.quizzesAttempted || 0, icon: HelpCircle },
      { label: 'Readiness', value: exam?.overallReadiness || 0, icon: TrendingUp, pct: true },
      { label: 'Average', value: exam?.averageMockScore || 0, icon: BarChart3, pct: true },
    ] : []),
  ];

  const ranks = [
    { label: 'All India Rank', data: profile.examAIR, empty: 'No exams yet' },
    { label: 'State Rank', data: profile.stateRank, empty: 'No exams yet', notSet: true },
    { label: 'City Rank', data: profile.cityRank, empty: 'No exams yet', notSet: true },
  ];
  const rankNote = (r) => (r.notSet && !r.data ? translate('Not added') : r.data?.rank ? translate('of {total}', { total: r.data.total }) : translate(r.empty));

  const typeConfig = {
    question: { icon: FileText, label: 'Question' },
    fact: { icon: Lightbulb, label: 'Fact' },
    tip: { icon: Zap, label: 'Tip' },
    current_affairs: { icon: Newspaper, label: 'Current Affairs' },
    poll: { icon: BarChart3, label: 'Poll' },
  };

  return (
    <MobileAppWrapper title={profile.name || translate('Profile')}>
      <div className="max-w-full mx-auto min-h-screen font-outfit pt-3 xl:pt-5">
        {seoTag}

        {/* ══════════ HERO — aurora, spinning-ring avatar, rank card, glass stats ══════════ */}
        <section
          className="relative overflow-hidden text-content-primary border border-border-primary bg-background-surface"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <span className="pointer-events-none absolute right-6 -bottom-10 select-none text-[220px] font-bold leading-none text-slate-900/[0.04] dark:text-white/[0.06]">{initial}</span>

          <div className="relative z-10 p-3 sm:p-3.5 xl:p-4 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-5">
            {/* Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
              {/* Passport-style photo — same as the profile page */}
              <div className="shrink-0 bg-background-surface p-1" style={{ borderRadius: 'var(--radius)' }}>
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.name}
                    width={112}
                    height={112}
                    className="w-16 h-20 sm:w-20 sm:h-24 xl:w-24 xl:h-28 rounded-lg xl:rounded-2xl border border-white dark:border-slate-900 object-cover bg-background-surface-secondary flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-20 sm:w-20 sm:h-24 xl:w-24 xl:h-28 rounded-lg xl:rounded-2xl border border-white dark:border-slate-900 flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-primary-400 text-3xl xl:text-4xl font-bold flex-shrink-0">
                    {initial}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5">
                  <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight leading-none break-words text-content-primary">{profile.name}</h1>
                  {socialLinks.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {socialLinks.map(([key, url]) => {
                        const Icon = SOCIAL_ICONS[key];
                        return (
                          <a key={key} href={url} target="_blank" rel="noopener noreferrer nofollow" aria-label={key} className="p-1.5 bg-background-surface hover:bg-background-surface-secondary text-content-secondary ring-1 ring-slate-200 dark:ring-white/20 transition-colors" style={{ borderRadius: 'var(--radius)' }}>
                            <Icon className="w-4 h-4" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  {profile.username && (
                    <p className="px-2.5 py-0.5 bg-background-surface-secondary text-primary-600 ring-1 ring-slate-200 dark:text-primary-100 dark:ring-white/20 text-xs font-bold" style={{ borderRadius: 'var(--radius-sm)' }}>@{profile.username}</p>
                  )}
                  {profile.isPro ? (
                    <ProBadge size="sm" />
                  ) : (
                    <span className="px-2.5 py-0.5 bg-background-surface-secondary text-content-secondary ring-1 ring-slate-300 dark:ring-white/30 text-[10px] font-bold uppercase tracking-[0.08em]" style={{ borderRadius: 'var(--radius-sm)' }}>{translate('FREE')}</span>
                  )}
                  {(profile.badges || []).map((badge, index) => (
                    <span key={index} className="inline-flex items-center gap-1 pl-1 pr-2.5 py-0.5 ring-1 ring-slate-200 text-content-primary dark:ring-white/30 text-[10px] font-bold uppercase tracking-[0.08em] bg-background-surface" style={{ borderRadius: 'var(--radius-sm)' }}>
                      <span className="flex items-center justify-center w-4 h-4 border border-primary-600 text-primary-600 dark:bg-white dark:text-primary-700" style={{ borderRadius: 'var(--radius-sm)' }}><Award className="w-2.5 h-2.5" /></span>
                      {badge}
                    </span>
                  ))}
                </div>
                {profile.bio && <p className="text-xs sm:text-sm font-medium text-content-secondary dark:text-white/80 leading-snug max-w-2xl line-clamp-2">{profile.bio}</p>}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {profile.city && (
                      <span className="inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 bg-background-surface-secondary text-content-secondary ring-1 ring-slate-200 dark:ring-white/20 text-[10px] font-bold" style={{ borderRadius: 'var(--radius-sm)' }}>
                        <MapPin className="w-3.5 h-3.5" />{profile.city}{profile.state && `, ${profile.state}`}
                      </span>
                    )}
                    {profile.primaryTargetExam && profile.primaryTargetExam !== 'All Exams' && (
                      <span className="inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 bg-primary-600 text-on-primary dark:bg-white dark:text-primary-800 text-[10px] font-bold" style={{ borderRadius: 'var(--radius-sm)' }}>
                        <Target className="w-3.5 h-3.5" />Preparing for {profile.primaryTargetExam}
                      </span>
                    )}
                </div>
                {/* Buttons always start on their own row (two per row on phones) */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 empty:hidden">
                  {!isOwnProfile && authed && (
                    <FollowButton
                      className="col-span-2 sm:col-span-1 w-full sm:w-auto"
                      userId={profile.id}
                      initialFollowing={isFollowing}
                      onFollowChange={handleFollowChange}
                    />
                  )}
                  {isOwnProfile && (
                    <>
                      <button
                        className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary ring-1 ring-white/30 font-bold uppercase tracking-[0.08em] text-[10px] active:translate-y-0.5 transition-all"
                        style={{ borderRadius: 'var(--radius)' }}
                        onClick={() => router.push('/student/settings')}
                      >
                        {translate('Settings')}
                      </button>
                      <button
                        className="w-full sm:w-auto px-4 py-2 bg-background-surface hover:bg-background-surface-secondary text-content-primary ring-1 ring-slate-300 dark:ring-white/30 font-bold uppercase tracking-[0.08em] text-[10px] active:translate-y-0.5 transition-all"
                        style={{ borderRadius: 'var(--radius)' }}
                        onClick={() => router.push('/student/profile')}
                      >
                        {translate('View Profile')}
                      </button>
                      <button
                        className="col-span-2 sm:col-span-1 w-full sm:w-auto px-4 py-2 bg-background-surface hover:bg-background-surface-secondary text-content-primary ring-1 ring-slate-300 dark:ring-white/30 font-bold uppercase tracking-[0.08em] text-[10px] active:translate-y-0.5 transition-all"
                        style={{ borderRadius: 'var(--radius)' }}
                        onClick={() => router.push('/student/all-india-rank')}
                      >
                        {translate('All India Rank')}
                      </button>
                    </>
                  )}
                </div>
                {showStats && (
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap xl:hidden gap-1.5 text-left">
                    {ranks.map((r) => (
                      <div key={r.label} className="min-w-0 flex items-baseline gap-x-2 gap-y-0 flex-wrap px-3 py-1.5 bg-background-surface ring-1 ring-slate-200 dark:ring-white/20" style={{ borderRadius: 'var(--radius)' }}>
                        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/70">{translate(r.label)}</span>
                        {r.data?.rank
                          ? <CountUp value={r.data.rank} prefix="#" className="text-lg font-bold leading-none tracking-tight text-primary-600 dark:text-primary-100" />
                          : <span className="text-lg font-bold leading-none">—</span>}
                        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/70">
                          {r.notSet && !r.data ? translate('Not added') : r.data?.rank ? translate('of {total}', { total: r.data.total }) : translate(r.empty)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: the counters sit at the right end of the top section */}
            <div className="hidden xl:flex flex-col gap-1.5 shrink-0">
            <div className="grid grid-cols-4 gap-1.5">
              {strip.map((s) => {
                const body = (
                  <div className="flex w-full items-center gap-2 px-2.5 py-2 text-left">
                    <span className="flex shrink-0 items-center justify-center w-6 h-6 text-primary-600 dark:text-white" style={{ borderRadius: 'var(--radius)' }}>
                      <s.icon className="w-3 h-3" />
                    </span>
                    <div className="min-w-0">
                      <CountUp value={s.value} suffix={s.pct ? '%' : ''} className="block text-base font-bold leading-none" />
                      <span className="block mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/70 truncate">{translate(s.label)}</span>
                    </div>
                  </div>
                );
                const cls = 'min-w-[104px] bg-background-surface ring-1 ring-slate-200 dark:ring-white/20';
                return s.href ? (
                  <button key={s.label} type="button" className={`${cls} hover:bg-background-surface-secondary transition-colors`} style={{ borderRadius: 'var(--radius)' }} onClick={() => router.push(s.href)}>{body}</button>
                ) : (
                  <div key={s.label} className={cls} style={{ borderRadius: 'var(--radius)' }}>{body}</div>
                );
              })}
            </div>
            {showStats && (
              <div className="grid grid-cols-3 gap-1.5">
                {ranks.map((r) => (
                  <div key={r.label} className="min-w-[104px] px-2.5 py-2 text-left bg-background-surface ring-1 ring-slate-200 dark:ring-white/20" style={{ borderRadius: 'var(--radius)' }}>
                    <span className="block text-[8px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/70 truncate">{translate(r.label)}</span>
                    {r.data?.rank
                      ? <CountUp value={r.data.rank} prefix="#" className="block mt-0.5 text-base font-bold leading-none text-primary-600 dark:text-primary-100" />
                      : <span className="block mt-0.5 text-base font-bold leading-none">—</span>}
                    <span className="block mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/70 truncate">{rankNote(r)}</span>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

          {/* Stat strip: social counters + exam numbers in one compact band */}
          <div className="relative z-10 grid grid-cols-4 sm:grid-cols-8 xl:hidden border-t border-border-primary bg-slate-50/80 dark:bg-black/15">
            {strip.map((s, i) => {
              const body = (
                <div className="flex w-full flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-0.5 sm:gap-2 px-1.5 sm:px-2.5 py-1.5 sm:py-2">
                  <span className="hidden sm:flex shrink-0 items-center justify-center w-6 h-6 bg-background-surface text-primary-600 ring-1 ring-slate-200 dark:text-white dark:ring-white/20" style={{ borderRadius: 'var(--radius)' }}>
                    <s.icon className="w-3 h-3" />
                  </span>
                  <div className="min-w-0 text-center sm:text-left">
                    <CountUp value={s.value} suffix={s.pct ? '%' : ''} className="block text-sm sm:text-base font-bold leading-none" />
                    <span className="block mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/70 truncate">{translate(s.label)}</span>
                  </div>
                </div>
              );
              const cls = `${LINE_CLS} ${i % 4 !== 0 ? 'border-l' : (i > 0 ? 'sm:border-l' : '')} ${i >= 4 ? 'border-t sm:border-t-0' : ''}`;
              return s.href ? (
                <button key={s.label} type="button" className={`${cls} hover:bg-background-surface-secondary transition-colors`} onClick={() => router.push(s.href)}>{body}</button>
              ) : (
                <div key={s.label} className={cls}>{body}</div>
              );
            })}
          </div>
        </section>

        {/* ══════════ BENTO ══════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 xl:gap-3 mt-2 xl:mt-3 pb-6 items-start">
          {/* Community questions */}
          {cQuestions.length > 0 && (
            <Section icon={HelpCircle} title={translate('Community Questions')} meta={cqTotal} action={isOwnProfile && <ViewAll href="/student/my-questions" label={translate('View All')} />} className="xl:col-span-12">
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 no-scrollbar md:grid md:grid-cols-2 xl:grid-cols-3 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
                {cQuestions.map((q) => (
                  <Link href={`/community-questions/${q._id}`} key={q._id} className="snap-start shrink-0 w-[80%] sm:w-[55%] md:w-auto md:shrink">
                    <div className="group relative h-full p-4 pl-5 bg-background-page border border-border-primary hover:border-primary-600 hover:-translate-y-0.5 transition-all overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
                      <span className="absolute left-0 inset-y-0 w-1.5 bg-primary-600" />
                      <p className="text-sm font-bold text-content-primary leading-snug line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-600 transition-colors">{q.question}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[10px] sm:text-[11px] font-bold text-content-muted">
                        {q.exam?.name && <span className="px-2.5 py-0.5 bg-primary-600 text-on-primary" style={{ borderRadius: 'var(--radius-sm)' }}>{q.exam.name}</span>}
                        <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" />{translate('{count} answers', { count: q.answerCount || 0 })}</span>
                        <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{compact(q.views)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {hasMoreCq && (
                <button
                  onClick={() => fetchCommunityQuestions(cqPage + 1)}
                  disabled={cqLoading}
                  className="w-full mt-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-600 ring-1 ring-primary-500/25 transition-all disabled:opacity-50"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  {cqLoading ? translate('Loading...') : translate('Load More')}
                </button>
              )}
            </Section>
          )}

          {/* Reels — swipeable carousel */}
          {reels.length > 0 && (
            <Section icon={PlayCircle} title={translate('Reels')} meta={reelsTotal} action={isOwnProfile && <ViewAll href="/student/my-reels" label={translate('View All')} />} className="xl:col-span-12">
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 no-scrollbar">
                {reels.map((reel) => {
                  const config = typeConfig[reel.type] || typeConfig.question;
                  const Icon = config.icon;
                  const displayTitle = reel.type === 'question' ? reel.questionText : reel.type === 'poll' ? reel.pollQuestion : reel.title;
                  return (
                    <Link href="/reels" key={reel._id} className="snap-start shrink-0">
                      <div className="relative w-36 sm:w-44 aspect-[3/4] overflow-hidden group hover:-translate-y-1 transition-all bg-background-page border border-border-primary" style={{ borderRadius: 'var(--radius)' }}>
                        <Icon className="pointer-events-none absolute right-3 top-3 w-5 h-5 text-primary-600/40" />
                        <div className="absolute inset-0 p-3.5 pb-10 flex flex-col justify-between">
                          <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5" style={{ borderRadius: 'var(--radius-sm)' }}>
                            <Icon className="w-3 h-3 text-primary-600" />
                            <span className="text-[8px] sm:text-[9px] font-bold text-primary-600 uppercase tracking-[0.08em]">{translate(config.label)}</span>
                          </span>
                          <p className="text-xs sm:text-[13px] font-bold text-content-primary leading-snug line-clamp-5">{displayTitle || translate('Untitled')}</p>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 px-3.5 pb-2.5 pt-7">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-content-secondary"><Eye className="w-3 h-3" />{compact(reel.viewsCount)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {hasMoreReels && (
                  <button
                    onClick={() => fetchReels(reelsPage + 1)}
                    disabled={reelsLoading}
                    className="snap-start shrink-0 w-36 sm:w-44 aspect-[3/4] flex items-center justify-center text-center px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-600 ring-1 ring-primary-500/25 transition-all disabled:opacity-50"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    {reelsLoading ? translate('Loading...') : translate('Load More Reels')}
                  </button>
                )}
              </div>
            </Section>
          )}

          {/* Private profile */}
          {!profile.isPublicProfile && !isOwnProfile && (
            <div className="xl:col-span-12 bg-background-surface p-8 sm:p-10 ring-1 ring-primary-500/15 text-center" style={{ borderRadius: 26 }}>
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl" style={{ borderRadius: 'var(--radius-sm)' }}>🔒</div>
              <p className="text-sm sm:text-base font-bold text-content-primary uppercase tracking-tight">{translate('This profile is private')}</p>
              <p className="text-xs sm:text-sm font-medium text-content-muted mt-1">{translate('Only the user can view their full stats.')}</p>
            </div>
          )}
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default PublicProfilePage;

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { username } = params || {};
  let profile = null;
  try {
    await dbConnect();
    const user = await User.findOne({ username: username.toLowerCase() }).select('name username bio profilePicture isPublicProfile').lean();
    if (user) {
      profile = {
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || null,
        profilePicture: user.profilePicture || null,
        isPublicProfile: Boolean(user.isPublicProfile)
      };
    }
  } catch (e) {
    console.error('Error in profile getStaticProps:', e);
  }
  if (!profile) return { notFound: true, revalidate: 600 };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
  const titleBase = 'AajExam';
  const name = profile?.name || username;
  const title = `${name} (@${profile?.username || username}) - ${titleBase}`;
  const description = profile?.bio || `${name} (@${profile?.username || username}) on AajExam - exam preparation profile with All India Rank, State Rank and City Rank for government exams.`;
  const image = profile?.profilePicture || '/logo.png';
  const keywords = `${name}, profile, exams`;
  const url = `${baseUrl}/@${encodeURIComponent(username || '')}`;

  const safeProps = JSON.parse(
    JSON.stringify(
      { username: username || '', profile, seo: { title, description, keywords, image, url } },
      (_, v) => (v === undefined ? null : v)
    )
  );

  return {
    props: safeProps,
    revalidate: 600
  };
}

