import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import API from '../../lib/api';
import dbConnect from '../../lib/db';
import User from '../../models/User';
import FollowButton from '../../components/FollowButton';
import Loading from '../../components/Loading';
// MobileAppWrapper import removed
import UnifiedFooter from '../../components/UnifiedFooter';

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
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 dark:bg-gray-900 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile Not Found</h2>
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
    <>
      <div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Head>
          <title>{seo?.title || 'Profile - SUBG QUIZ'}</title>
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

        <div className="bg-white dark:bg-gray-800 shadow-md mb-5">
          <div className="h-32 lg:h-40 bg-gradient-to-r from-red-500 to-yellow-600"></div>

          <div className="px-6 pb-6">
            {/* Avatar Section */}
            <div className="flex justify-center -mt-16 mb-5">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="w-28 h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
                />
              ) : (
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-yellow-600 text-white text-5xl lg:text-6xl font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-2xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                {profile.username && (
                  <p className="text-base lg:text-lg font-semibold text-orange-700 dark:text-yellow-400 mt-1">
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
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => router.push('/profile/settings')}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="py-4 border-b border-gray-200 dark:border-gray-700 mb-5">
                <p className="text-gray-700 dark:text-gray-300 text-center md:text-left">{profile.bio}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-around gap-8 pt-5 border-t border-gray-200 dark:border-gray-700">
              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push(`/u/${encodeURIComponent(profile.username)}/followers`)}
              >
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{profile.followersCount || 0}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Followers</span>
              </div>
              <div
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push(`/u/${encodeURIComponent(profile.username)}/following`)}
              >
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{profile.followingCount || 0}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Following</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{profile.profileViews || 0}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-0 space-y-5 pb-8">
          {/* Level & Badges Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white mb-5">Level & Badges</h2>
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex flex-col items-center px-6 py-5 bg-gradient-to-br from-red-500 to-yellow-600 rounded-xl text-white min-w-[120px]">
                <span className="text-4xl font-bold">{profile.level?.currentLevel?.number || 0}</span>
                <span className="text-base mt-2">{profile.level?.currentLevel?.name || 'Starter'}</span>
              </div>
              {profile.badges && profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {profile.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white mb-5">Quiz Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="flex flex-col items-center p-5 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-shadow">
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {profile.level?.progress?.quizzesPlayed || 0}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">Total Quizzes</span>
                </div>
                <div className="flex flex-col items-center p-5 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-shadow">
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {profile.level?.stats?.highScoreRate || 0}%
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">High Score Rate</span>
                </div>
                <div className="flex flex-col items-center p-5 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-shadow">
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {profile.level?.stats?.averageScore || 0}%
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">Average Score</span>
                </div>
              </div>
            </div>
          )}
          {/* User Contributions Summary */}
          {loadingContributions ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
              <Loading size="md" color="gray" message="Loading contributions..." />
            </div>
          ) : contributions && (contributions.categories.total > 0 || contributions.subcategories.total > 0 || contributions.quizzes.total > 0 || contributions.userQuestions?.total > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white mb-5">Contributions</h2>

              {/* Contribution Counts Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {contributions.categories.total > 0 && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg text-center border border-blue-200 dark:border-blue-700">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {contributions.categories.total}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      📚 Categories
                    </div>
                  </div>
                )}
                {contributions.subcategories.total > 0 && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 from-red-100 dark:from-purple-900/20 dark:from-red-800/20 rounded-lg text-center border border-purple-200 dark:border-purple-700">
                    <div className="text-3xl font-bold text-orange-700 dark:text-yellow-400">
                      {contributions.subcategories.total}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      📑 Subcategories
                    </div>
                  </div>
                )}
                {contributions.quizzes.total > 0 && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg text center border border-green-200 dark:border-green-700">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {contributions.quizzes.total}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      🎯 Quizzes
                    </div>
                  </div>
                )}
                {contributions.userQuestions?.total > 0 && (
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg text-center border border-yellow-200 dark:border-yellow-700">
                    <div className="text-3xl font-bold text-orange-700 dark:text-yellow-400">
                      {contributions.userQuestions.total}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      💭 Questions
                    </div>
                  </div>
                )}
              </div>

              {/* Categories */}
              {contributions.categories.total > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    📚 Categories ({contributions.categories.total})
                  </h3>
                  <div className="space-y-2">
                    {contributions.categories.items.map((cat) => (
                      <div key={cat._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h4>
                        {cat.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{cat.description}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Created {new Date(cat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories */}
              {contributions.subcategories.total > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    📑 Subcategories ({contributions.subcategories.total})
                  </h3>
                  <div className="space-y-2">
                    {contributions.subcategories.items.map((subcat) => (
                      <div key={subcat._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{subcat.name}</h4>
                        {subcat.category && (
                          <p className="text-xs text-orange-700 dark:text-yellow-400 mt-1">
                            Category: {subcat.category.name}
                          </p>
                        )}
                        {subcat.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subcat.description}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Created {new Date(subcat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quizzes */}
              {contributions.quizzes.total > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    🎯 Quizzes ({contributions.quizzes.total})
                  </h3>
                  <div className="space-y-2">
                    {contributions.quizzes.items.map((quiz) => (
                      <div key={quiz._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h4>
                            {quiz.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{quiz.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {quiz.difficulty && (
                                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                                  {quiz.difficulty}
                                </span>
                              )}
                              {quiz.category && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  📚 {quiz.category.name}
                                </span>
                              )}
                              {quiz.subcategory && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  📑 {quiz.subcategory.name}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {quiz.questionsCount || 0} questions
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {quiz.attemptsCount || 0} attempts
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
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
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    💭 Community Questions ({contributions.userQuestions.total})
                  </h3>
                  <div className="space-y-3">
                    {contributions.userQuestions.items.map((question) => (
                      <div key={question._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{question.questionText}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {question.options.map((option, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm"
                            >
                              <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                              {option}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">👁️ {question.viewsCount || 0} views</span>
                          <span className="flex items-center gap-1">❤️ {question.likesCount || 0} likes</span>
                          <span className="flex items-center gap-1">📤 {question.sharesCount || 0} shares</span>
                          <span className="text-gray-400">•</span>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">🔒 This profile is private</p>
            </div>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
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
  const titleBase = 'SUBG QUIZ';
  const name = profile?.name || username;
  const title = `${name} (@${profile?.username || username}) - ${titleBase}`;
  const description = profile?.bio || `${name}'s profile on SUBG QUIZ.`;
  const image = profile?.profilePicture || '/logo.png';
  const keywords = `${name}, profile, quizzes`;
  const url = baseUrl ? `${baseUrl}/u/${encodeURIComponent(username)}` : undefined;

  return {
    props: { username, seo: { title, description, keywords, image, url } },
    revalidate: 60
  };
}

