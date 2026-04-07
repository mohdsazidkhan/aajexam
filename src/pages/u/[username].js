import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
  const [contributions, setContributions] = useState(null);
  const [loadingContributions, setLoadingContributions] = useState(true);

  useEffect(() => {
    if (!username) return;
    fetchProfile();
    fetchContributions();
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

  const fetchContributions = async () => {
    try {
      setLoadingContributions(true);
      const res = await API.request(`/api/users/profile/${encodeURIComponent(username)}/contributions`);
      if (res?.success) {
        setContributions(res.contributions);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingContributions(false);
    }
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-white dark:bg-slate-950 px-4 font-outfit">
        <h2 className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Profile Not Found</h2>
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
      <div className="container mx-auto py-0 lg:py-6 px-0 lg:px-10 bg-white dark:bg-slate-950 min-h-screen font-outfit">
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

        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 border-b-[12px] border-slate-200 dark:border-slate-800 shadow-2xl mb-8 overflow-hidden">
          <div className="h-40 lg:h-56 bg-gradient-to-r from-primary-500 via-primary-500 to-primary-500 bg-[length:200%_auto] animate-gradient"></div>

          <div className="px-6 pb-6">
            {/* Avatar Section */}
            <div className="flex justify-center -mt-16 mb-5">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="w-20 lg:w-32 h-20 lg:h-32 lg:w-40 lg:h-40 rounded-[2.5rem] border-8 border-white dark:border-slate-900 shadow-2xl object-cover"
                />
              ) : (
                <div className="w-20 lg:w-32 h-20 lg:h-32 lg:w-40 lg:h-40 rounded-[2.5rem] border-8 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white text-6xl lg:text-7xl font-black">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-5">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{profile.name}</h1>
                {profile.username && (
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                    @{profile.username}
                  </p>
                )}
              </div>

              {!isOwnProfile && (
                <FollowButton
                  userId={profile.id}
                  initialFollowing={isFollowing}
                  onFollowChange={handleFollowChange}
                />
              )}

              {isOwnProfile && (
                <button
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-duo border-b-4 border-slate-200 dark:border-slate-700 active:translate-y-1 active:border-b-0 transition-all"
                  onClick={() => router.push('/profile/settings')}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="py-6 border-b border-slate-100 dark:border-slate-800 mb-8">
                <p className="text-slate-600 dark:text-slate-400 text-center lg:text-left font-bold leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-around gap-8 py-8 border-t border-slate-100 dark:border-slate-800">
              <div
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => router.push(`/u/${encodeURIComponent(profile.username)}/followers`)}
              >
                <span className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{profile.followersCount || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2">Followers</span>
              </div>
              <div
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => router.push(`/u/${encodeURIComponent(profile.username)}/following`)}
              >
                <span className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{profile.followingCount || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2">Following</span>
              </div>
              <div className="flex flex-col items-center group">
                <span className="text-xl lg:text-xl lg:text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{profile.profileViews || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2">Views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-0 space-y-5 pb-8">
          {/* Level & Badges Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 mlgp-8 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-primary-500 rounded-full" />
              Level & Badges
            </h2>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col items-center px-10 py-6 bg-primary-500 rounded-3xl text-white shadow-duo-primary border-b-8 border-primary-700">
                <span className="text-5xl font-black leading-none">{profile.level?.currentLevel?.number || 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest mt-3">{profile.level?.currentLevel?.name || 'Starter'}</span>
              </div>
              {profile.badges && profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {profile.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 dark:border-slate-800 shadow-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quiz Statistics Section */}
          {(profile.isPublicProfile || isOwnProfile) && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 mlgp-8 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
              <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-primary-500 rounded-full" />
                Quiz Statistics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                  <span className="text-4xl font-black text-primary-600 group-hover:scale-110 transition-transform">
                    {profile.level?.progress?.quizzesPlayed || 0}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-4 text-center">Total Quizzes</span>
                </div>
                <div className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                  <span className="text-4xl font-black text-emerald-600 group-hover:scale-110 transition-transform">
                    {profile.level?.stats?.highScoreRate || 0}%
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-4 text-center">High Score Rate</span>
                </div>
                <div className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                  <span className="text-4xl font-black text-orange-600 group-hover:scale-110 transition-transform">
                    {profile.level?.stats?.averageScore || 0}%
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-4 text-center">Average Score</span>
                </div>
              </div>
            </div>
          )}
          {/* User Contributions Summary */}
          {loadingContributions ? (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 mlgp-8 border-2 border-slate-200 dark:border-slate-800 shadow-xl text-center">
              <Loading size="md" color="gray" message="Loading contributions..." />
            </div>
          ) : contributions && (contributions.categories.total > 0 || contributions.subcategories.total > 0 || contributions.quizzes.total > 0 || contributions.userQuestions?.total > 0) && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 mlgp-8 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-primary-500 rounded-full" />
                Contributions
              </h2>

              {/* Contribution Counts Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {contributions.categories.total > 0 && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 text-center shadow-duo group hover:shadow-lg transition-all">
                    <div className="text-xl lg:text-3xl font-black text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      {contributions.categories.total}
                    </div>
                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
                      Categories
                    </div>
                  </div>
                )}
                {contributions.subcategories.total > 0 && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 text-center shadow-duo group hover:shadow-lg transition-all">
                    <div className="text-xl lg:text-3xl font-black text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      {contributions.subcategories.total}
                    </div>
                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
                      Subcategories
                    </div>
                  </div>
                )}
                {contributions.quizzes.total > 0 && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 text-center shadow-duo group hover:shadow-lg transition-all">
                    <div className="text-xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      {contributions.quizzes.total}
                    </div>
                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
                      Quizzes
                    </div>
                  </div>
                )}
                {contributions.userQuestions?.total > 0 && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 text-center shadow-duo group hover:shadow-lg transition-all">
                    <div className="text-xl lg:text-3xl font-black text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                      {contributions.userQuestions.total}
                    </div>
                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
                      Questions
                    </div>
                  </div>
                )}
              </div>

              {/* Categories */}
              {contributions.categories.total > 0 && (
                <div className="mb-12">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    📚 Categories
                  </h3>
                  <div className="space-y-4">
                    {contributions.categories.items.map((cat) => (
                      <div key={cat._id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group">
                        <h4 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors">{cat.name}</h4>
                        {cat.description && (
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{cat.description}</p>
                        )}
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                          Created {new Date(cat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories */}
              {contributions.subcategories.total > 0 && (
                <div className="mb-12">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    📑 Subcategories
                  </h3>
                  <div className="space-y-4">
                    {contributions.subcategories.items.map((subcat) => (
                      <div key={subcat._id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all group">
                        <h4 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors">{subcat.name}</h4>
                        {subcat.category && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 mt-2">
                            {subcat.category.name}
                          </p>
                        )}
                        {subcat.description && (
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{subcat.description}</p>
                        )}
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                          Created {new Date(subcat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quizzes */}
              {contributions.quizzes.total > 0 && (
                <div className="mb-12">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    🎯 Quizzes
                  </h3>
                  <div className="space-y-4">
                    {contributions.quizzes.items.map((quiz) => (
                      <div key={quiz._id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-all group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{quiz.title}</h4>
                            {quiz.description && (
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{quiz.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-4 flex-wrap">
                              {quiz.difficulty && (
                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                  {quiz.difficulty}
                                </span>
                              )}
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {quiz.questionsCount || 0} questions • {quiz.attemptsCount || 0} attempts
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                          Created {new Date(quiz.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Questions */}
              {contributions.userQuestions?.items && contributions.userQuestions.items.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    💭 Community Questions
                  </h3>
                  <div className="space-y-4">
                    {contributions.userQuestions.items.map((question) => (
                      <div key={question._id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-orange-500 transition-all group">
                        <h4 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">{question.questionText}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          {question.options.map((option, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl border-2 bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold"
                            >
                              <span className="text-primary-600 font-extrabold mr-2">{String.fromCharCode(65 + idx)}.</span>
                              {option}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-2">👁️ {question.viewsCount || 0} views</span>
                          <span className="flex items-center gap-2">❤️ {question.likesCount || 0} likes</span>
                          <span className="flex items-center gap-2">📤 {question.sharesCount || 0} shares</span>
                          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Private Profile Message */}
          {!profile.isPublicProfile && !isOwnProfile && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl">
                🔒
              </div>
              <p className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">This profile is private</p>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">Only the user can view their full stats and contributions.</p>
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
  const keywords = `${name}, profile, quizzes`;
  const url = baseUrl ? `${baseUrl}/u/${encodeURIComponent(username)}` : undefined;

  return {
    props: { username, seo: { title, description, keywords, image, url } },
    revalidate: 60
  };
}

