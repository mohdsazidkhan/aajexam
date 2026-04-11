import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PlayCircle, Eye, Heart, FileText, Lightbulb, Zap, Newspaper, BarChart3 } from 'lucide-react';
import API from '../../lib/api';
import dbConnect from '../../lib/db';
import User from '../../models/User';
import FollowButton from '../../components/FollowButton';
import Loading from '../../components/Loading';
import MobileAppWrapper from '../../components/MobileAppWrapper';

const PublicProfilePage = ({ username: ssrUsername, seo }) => {
  const router = useRouter();
  const { username = ssrUsername } = router.query || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  useEffect(() => {
    if (!username) return;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.request(`/api/users/profile/${encodeURIComponent(username)}`);
      if (res?.success) {
        setProfile(res.user);
        setIsFollowing(!!res.isFollowing);
        setIsOwnProfile(!!res.isOwnProfile);
      } else {
        setError(res?.message || 'Failed to load profile');
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load profile');
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

  const handleFollowChange = (newFollowStatus) => {
    setIsFollowing(newFollowStatus);
    if (profile) {
      setProfile({
        ...profile,
        followersCount: (profile.followersCount || 0) + (newFollowStatus ? 1 : -1)
      });
    }
  };

  if (loading) {
    return <Loading fullScreen={true} size="md" color="gray" message="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center  px-4 font-outfit">
        <h2 className="text-lg lg:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Profile Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <MobileAppWrapper title={profile.name || 'Profile'}>
      <div className="max-w-full mx-auto  min-h-screen font-outfit">
        <Head>
          <title>{seo?.title || 'Profile - AajExam'}</title>
          {seo?.description && <meta name="description" content={seo.description} />}
          {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
          <meta property="og:type" content="profile" />
          {seo?.title && <meta property="og:title" content={seo.title} />}
          {seo?.description && <meta property="og:description" content={seo.description} />}
          {seo?.image && <meta property="og:image" content={seo.image} />}
          {seo?.url && <meta property="og:url" content={seo.url} />}
          <meta name="twitter:card" content="summary_large_image" />
          {seo?.title && <meta name="twitter:title" content={seo.title} />}
          {seo?.description && <meta name="twitter:description" content={seo.description} />}
          {seo?.image && <meta name="twitter:image" content={seo.image} />}
          {seo?.url && <link rel="canonical" href={seo.url} />}
        </Head>

        {/* Profile Header */}
        <div className="mb-6">
          {/* Banner */}
          <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-primary-500 to-emerald-600 rounded-2xl md:rounded-3xl relative border-2 border-slate-200 dark:border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)] rounded-2xl md:rounded-3xl" />
          </div>

          {/* Profile Card - overlaps banner */}
          <div className="-mt-16 sm:-mt-20 relative z-10">
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-5 lg:p-6">
              {/* Avatar + Info + Action */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 -mt-12 sm:-mt-14">
                  {profile.profilePicture ? (
                      <Image
                        src={profile.profilePicture}
                        alt={profile.name}
                        width={112}
                        height={112}
                        className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg object-cover bg-slate-200 dark:bg-slate-700"
                      />
                    ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-primary-400 text-3xl sm:text-4xl lg:text-5xl font-black">
                      {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* Name + Username */}
                <div className="flex-1 min-w-0 pt-1">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{profile.name}</h1>
                  {profile.username && (
                    <p className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400">
                      @{profile.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3">
                {!isOwnProfile && (
                  <FollowButton
                    userId={profile.id}
                    initialFollowing={isFollowing}
                    onFollowChange={handleFollowChange}
                  />
                )}
                {isOwnProfile && (
                  <button
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-wider text-[11px] rounded-xl border-2 border-b-4 border-slate-200 dark:border-slate-700 active:translate-y-0.5 active:border-b-2 transition-all"
                    onClick={() => router.push('/profile/settings')}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-3">{profile.bio}</p>
              )}

              {/* Stats Row */}
              <div className="flex gap-5 sm:gap-8 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div
                  className="cursor-pointer group"
                  onClick={() => router.push(`/u/${encodeURIComponent(profile.username)}/followers`)}
                >
                  <span className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{profile.followersCount || 0}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Followers</span>
                </div>
                <div
                  className="cursor-pointer group"
                  onClick={() => router.push(`/u/${encodeURIComponent(profile.username)}/following`)}
                >
                  <span className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{profile.followingCount || 0}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Following</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white">{profile.reelsCount || 0}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Reels</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white">{profile.profileViews || 0}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Views</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 pb-8">
          {/* Badges Section */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 sm:p-6 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                Badges
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {profile.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-100 dark:border-slate-700"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Statistics Section */}
          {(profile.isPublicProfile || isOwnProfile) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 sm:p-6 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                Exam Statistics
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="flex flex-col items-center p-3 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-600">
                    {0}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-center">Tests</span>
                </div>
                <div className="flex flex-col items-center p-3 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600">
                    {0}%
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-center">Best</span>
                </div>
                <div className="flex flex-col items-center p-3 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-600">
                    {0}%
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 text-center">Average</span>
                </div>
              </div>
            </div>
          )}

          {/* Reels Grid — Instagram style */}
          {reels.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-4 sm:p-6 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                <PlayCircle className="w-5 h-5" />
                Reels
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">{reelsTotal}</span>
              </h2>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {reels.map((reel) => {
                  const typeConfig = {
                    question: { icon: FileText, gradient: 'from-blue-600 to-indigo-700', label: 'Q' },
                    fact: { icon: Lightbulb, gradient: 'from-purple-600 to-pink-600', label: 'F' },
                    tip: { icon: Zap, gradient: 'from-yellow-500 to-orange-600', label: 'T' },
                    current_affairs: { icon: Newspaper, gradient: 'from-red-500 to-rose-700', label: 'CA' },
                    poll: { icon: BarChart3, gradient: 'from-green-500 to-emerald-700', label: 'P' },
                  };
                  const config = typeConfig[reel.type] || typeConfig.question;
                  const Icon = config.icon;
                  const displayTitle = reel.type === 'question' ? reel.questionText : reel.type === 'poll' ? reel.pollQuestion : reel.title;

                  return (
                    <Link href="/reels" key={reel._id}>
                      <div className={`relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br ${config.gradient} group cursor-pointer`}>
                        {/* Content preview */}
                        <div className="absolute inset-0 p-2.5 sm:p-3 flex flex-col justify-between">
                          {/* Type badge */}
                          <div className="flex items-center gap-1">
                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/80" />
                            <span className="text-[8px] sm:text-[9px] font-black text-white/70 uppercase tracking-wider">{config.label}</span>
                          </div>
                          {/* Title */}
                          <p className="text-[10px] sm:text-xs font-bold text-white leading-tight line-clamp-3">
                            {displayTitle || 'Untitled'}
                          </p>
                        </div>
                        {/* Bottom overlay with views */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pb-2 pt-6">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-white/90" />
                            <span className="text-[10px] sm:text-[11px] font-bold text-white/90">
                              {reel.viewsCount >= 1000 ? `${(reel.viewsCount / 1000).toFixed(1)}K` : reel.viewsCount || 0}
                            </span>
                          </div>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Load more */}
              {hasMoreReels && (
                <button
                  onClick={() => fetchReels(reelsPage + 1)}
                  disabled={reelsLoading}
                  className="w-full mt-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  {reelsLoading ? 'Loading...' : 'Load More Reels'}
                </button>
              )}
            </div>
          )}

          {/* Private Profile Message */}
          {!profile.isPublicProfile && !isOwnProfile && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-8 sm:p-10 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                🔒
              </div>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">This profile is private</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Only the user can view their full stats.</p>
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
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isPublicProfile: user.isPublicProfile
      };
    }
  } catch (e) {
    console.error('Error in profile getStaticProps:', e);
  }
  if (!profile) return { notFound: true, revalidate: 60 };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const titleBase = 'AajExam';
  const name = profile?.name || username;
  const title = `${name} (@${profile?.username || username}) - ${titleBase}`;
  const description = profile?.bio || `${name}'s profile on AajExam.`;
  const image = profile?.profilePicture || '/logo.png';
  const keywords = `${name}, profile, exams`;
  const url = baseUrl ? `${baseUrl}/u/${encodeURIComponent(username)}` : undefined;

  return {
    props: { username, seo: { title, description, keywords, image, url } },
    revalidate: 60
  };
}

