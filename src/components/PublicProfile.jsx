import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import FollowButton from './FollowButton';
import Loading from './Loading';
// MobileAppWrapper import removed
import UnifiedFooter from './UnifiedFooter';

const PublicProfile = ({ username }) => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [contributions, setContributions] = useState(null);
  const [loadingContributions, setLoadingContributions] = useState(true);

  useEffect(() => {
    if (username) {
      fetchProfile();
      fetchContributions();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile/${username}`,
        config
      );

      if (response.data.success) {
        setProfile(response.data.user);
        setIsFollowing(response.data.isFollowing);
        setIsOwnProfile(response.data.isOwnProfile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async () => {
    try {
      setLoadingContributions(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile/${username}/contributions`
      );

      if (response.data.success) {
        setContributions(response.data.contributions);
      }
    } catch (error) {
      console.error('Failed to load contributions:', error);
    } finally {
      setLoadingContributions(false);
    }
  };

  const handleFollowChange = (newFollowStatus) => {
    setIsFollowing(newFollowStatus);
    // Update follower count
    if (profile) {
      setProfile({
        ...profile,
        followersCount: profile.followersCount + (newFollowStatus ? 1 : -1)
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loading size="md" color="gray" message="Loading profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 dark:bg-gray-900 px-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile Not Found</h2>
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
      <div className="container mx-auto py-0 lg:py-4 px-4 lg:px-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-900 border-b-4 border-slate-100 dark:border-slate-800 shadow-xl lg:hidden rounded-b-[2.5rem]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-duo border-2 border-slate-100 dark:border-slate-700 active:translate-y-1 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Student Profile</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-b-8 border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden mb-8 relative mt-6 lg:mt-0">
          <div className="h-64 bg-slate-50 dark:bg-slate-900 flex items-center justify-center border-b-8 border-slate-100 dark:border-slate-800 relative">
            {/* Decorative background profile pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 3px, transparent 3px)', backgroundSize: '48px 48px' }}></div>
            <div className="absolute bottom-6 right-10 opacity-20 hidden lg:block">
              <div className="text-9xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter select-none rotate-3">AAJ EXAM</div>
            </div>
          </div>

          <div className="px-10 pb-12 relative">
            {/* Avatar Section */}
            <div className="flex justify-center lg:justify-start -mt-32 mb-8 ml-0 lg:ml-8">
              {profile.profilePicture ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary-500 rounded-[3.5rem] rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-24 lg:w-48 h-24 lg:h-48 lg:w-56 lg:h-56 rounded-[3.2rem] border-[10px] border-white dark:border-slate-800 shadow-2xl object-cover relative z-10 transition-transform group-hover:scale-110"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-primary-500 text-white px-8 py-3 rounded-2xl shadow-duo-primary border-4 border-white dark:border-slate-800 z-20 rotate-3 animate-bounce-slow">
                    <span className="text-xl font-black uppercase tracking-widest">{(profile.subscriptionStatus || 'FREE').toUpperCase() === 'PRO' ? 'PRO' : 'FREE'}</span>
                  </div>
                </div>
              ) : (
                <div className="w-24 lg:w-48 h-24 lg:h-48 lg:w-56 lg:h-56 rounded-[3.2rem] border-[10px] border-white dark:border-slate-800 shadow-2xl flex items-center justify-center bg-primary-500 text-white text-7xl lg:text-9xl font-black uppercase tracking-tighter relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  <span className="relative z-10">{profile.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  <div className="absolute -bottom-4 -right-4 bg-primary-500 text-white px-8 py-3 rounded-2xl shadow-duo-primary border-4 border-white dark:border-slate-800 z-20 rotate-3 animate-bounce-slow">
                    <span className="text-xl font-black uppercase tracking-widest">{(profile.subscriptionStatus || 'FREE').toUpperCase() === 'PRO' ? 'PRO' : 'FREE'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div className="text-center lg:text-left flex-1">
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">{profile.name}</h1>
                {profile.username && (
                  <p className="text-sm font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    @{profile.username}
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                {!isOwnProfile && (
                  <FollowButton
                    userId={profile.id}
                    initialFollowing={isFollowing}
                    onFollowChange={handleFollowChange}
                  />
                )}

                {isOwnProfile && (
                  <button
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-widest rounded-2xl border-2 border-b-4 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:translate-y-1"
                    onClick={() => router.push('/settings')}
                  >
                    Settings
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="py-6 border-y-2 border-slate-100 dark:border-slate-700 mb-8">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 text-center lg:text-left leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 lg:gap-10 max-w-3xl mx-auto lg:mx-0">
              <div
                className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-4 border-b-[12px] border-slate-100 dark:border-slate-700 cursor-pointer hover:-translate-y-2 transition-all active:translate-y-0 active:border-b-4 group shadow-2xl"
                onClick={() => router.push(`/u/${username}/followers`)}
              >
                <span className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-primary-700 dark:text-primary-500 transition-colors tracking-tighter">{profile.followersCount || 0}</span>
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] mt-3">Agents</span>
              </div>
              <div
                className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-4 border-b-[12px] border-slate-100 dark:border-slate-700 cursor-pointer hover:-translate-y-2 transition-all active:translate-y-0 active:border-b-4 group shadow-2xl"
                onClick={() => router.push(`/u/${username}/following`)}
              >
                <span className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-primary-700 dark:text-primary-500 transition-colors tracking-tighter">{profile.followingCount || 0}</span>
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] mt-3">Rivals</span>
              </div>
              <div className="flex flex-col items-center p-4 lg:p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-4 border-b-[12px] border-slate-100 dark:border-slate-700 shadow-2xl">
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{profile.profileViews || 0}</span>
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] mt-3">Intel Views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-4 space-y-5 pb-8">
          {/* Level & Badges Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-4 border-b-[12px] border-slate-100 dark:border-slate-700 shadow-2xl p-10 mb-10 group">
            <h2 className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-10">Ranking & Honors</h2>
            <div className="flex flex-col sm:flex-row items-center gap-12">
              <div className="flex flex-col items-center justify-center p-10 bg-primary-500 rounded-[2.5rem] text-white min-w-[200px] shadow-duo-primary border-4 border-white dark:border-slate-700 rotate-3 group-hover:rotate-0 transition-transform">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Phase</span>
                <span className="text-6xl font-black my-1 uppercase tracking-tighter">{0}</span>
                <span className="text-xs font-black uppercase tracking-[0.2em]">{'Student'}</span>
              </div>
              <div className="flex-1">
                {profile.badges && profile.badges.length > 0 ? (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                    {profile.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="px-8 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-4 border-slate-100 dark:border-slate-700 flex items-center gap-4 group/badge hover:border-primary-500 transition-all shadow-xl hover:-translate-y-1"
                      >
                        <span className="text-2xl group-hover/badge:scale-125 transition-transform">Ã°Å¸Ââ€ </span>
                        <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-widest">{badge}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center sm:text-left p-4 lg:p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em]">No honors archived. Complete missions to earn badges.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quiz Statistics Section */}
          {(profile.isPublicProfile || isOwnProfile) && (
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border-4 border-b-[12px] border-slate-100 dark:border-slate-700 shadow-2xl p-10 mb-10">
              <h2 className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-10">Performance Analytics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-4 lg:p-10 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-700 shadow-inner group hover:border-primary-500 transition-all">
                  <span className="text-5xl font-black text-primary-700 dark:text-primary-500 uppercase tracking-tighter group-hover:scale-110 transition-transform">
                    {0}
                  </span>
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] mt-4 text-center">Ops Completed</span>
                </div>
                <div className="flex flex-col items-center p-4 lg:p-10 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-700 shadow-inner group hover:border-primary-500 transition-all">
                  <span className="text-5xl font-black text-primary-700 dark:text-primary-500 uppercase tracking-tighter group-hover:scale-110 transition-transform">
                    {0}%
                  </span>
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] mt-4 text-center">Strike Accuracy</span>
                </div>
                <div className="flex flex-col items-center p-4 lg:p-10 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-700 shadow-inner group hover:border-purple-500 transition-all">
                  <span className="text-5xl font-black text-purple-500 uppercase tracking-tighter group-hover:scale-110 transition-transform">
                    {0}%
                  </span>
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] mt-4 text-center">Core Mean</span>
                </div>
              </div>
            </div>
          )}
          {/* User Contributions Summary */}
          {loadingContributions ? (
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-b-8 border-slate-100 dark:border-slate-700 shadow-xl p-12 text-center">
              <div className="w-12 h-12 border-4 border-slate-100 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Loading contributions...</p>
            </div>
          ) : contributions && (contributions.categories.total > 0 || contributions.subcategories.total > 0 || contributions.quizzes.total > 0 || contributions.userQuestions?.total > 0) && (
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-b-8 border-slate-100 dark:border-slate-700 shadow-xl p-8">
              <h2 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] mb-8">Author Contributions</h2>
              {/* Contribution Counts Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {contributions.categories.total > 0 && (
                  <div className="p-6 bg-primary-500 rounded-2xl text-center shadow-duo-secondary border-2 border-white dark:border-slate-800">
                    <div className="text-xl lg:text-3xl font-black text-white">
                      {contributions.categories.total}
                    </div>
                    <div className="text-[10px] font-black text-white/80 uppercase tracking-widest mt-1">
                      Categories
                    </div>
                  </div>
                )}
                {contributions.subcategories.total > 0 && (
                  <div className="p-6 bg-primary-500 rounded-2xl text-center shadow-duo-primary border-2 border-white dark:border-slate-800">
                    <div className="text-xl lg:text-3xl font-black text-white">
                      {contributions.subcategories.total}
                    </div>
                    <div className="text-[10px] font-black text-white/80 uppercase tracking-widest mt-1">
                      Topics
                    </div>
                  </div>
                )}
                {contributions.quizzes.total > 0 && (
                  <div className="p-6 bg-purple-500 rounded-2xl text-center shadow-duo-purple border-2 border-white dark:border-slate-800">
                    <div className="text-xl lg:text-3xl font-black text-white">
                      {contributions.quizzes.total}
                    </div>
                    <div className="text-[10px] font-black text-white/80 uppercase tracking-widest mt-1">
                      Quizzes
                    </div>
                  </div>
                )}
                {contributions.userQuestions?.total > 0 && (
                  <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-2xl text-center shadow-duo border-2 border-white dark:border-slate-800">
                    <div className="text-xl lg:text-3xl font-black text-slate-800 dark:text-white">
                      {contributions.userQuestions.total}
                    </div>
                    <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">
                      Questions
                    </div>
                  </div>
                )}
              </div>

              {/* Categories */}
              {contributions.categories.total > 0 && (
                <div className="mb-10">
                  <h3 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    Master Categories ({contributions.categories.total})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {contributions.categories.items.map((cat) => (
                      <div key={cat._id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-primary-500 transition-all group shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors">{cat.name}</h4>
                        {cat.description && (
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-400 mt-2 line-clamp-2">{cat.description}</p>
                        )}
                        <div className="mt-4 pt-4 border-t-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                            Est. {new Date(cat.createdAt).toLocaleDateString()}
                          </p>
                          <span className="text-[8px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">Archived</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories */}
              {contributions.subcategories.total > 0 && (
                <div className="mb-10">
                  <h3 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    Master Topics ({contributions.subcategories.total})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {contributions.subcategories.items.map((subcat) => (
                      <div key={subcat._id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-primary-500 transition-all group shadow-sm">
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors">{subcat.name}</h4>
                        {subcat.category && (
                          <p className="text-[8px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest mt-1">
                            Group: {subcat.category.name}
                          </p>
                        )}
                        {subcat.description && (
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-400 mt-2 line-clamp-2">{subcat.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quizzes */}
              {contributions.quizzes.total > 0 && (
                <div className="mb-10">
                  <h3 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Training Quizzes ({contributions.quizzes.total})
                  </h3>
                  <div className="space-y-4">
                    {contributions.quizzes.items.map((quiz) => (
                      <div key={quiz._id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-b-6 border-slate-100 dark:border-slate-700 hover:border-purple-500 hover:-translate-y-1 active:translate-y-0 transition-all group shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-purple-500 transition-colors">{quiz.title}</h4>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              {quiz.difficulty && (
                                <span className={`text-[8px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border-2 ${quiz.difficulty === 'Easy' ? 'bg-green-50 text-green-500 border-green-100' :
                                  quiz.difficulty === 'Medium' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                    'bg-red-50 text-red-500 border-red-100'
                                  }`}>
                                  {quiz.difficulty}
                                </span>
                              )}
                              <span className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                {quiz.questionsCount || 0} Objectives
                              </span>
                              <span className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                {quiz.attemptsCount || 0} Simulations
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Protocol Date</p>
                              <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Questions */}
              {contributions.userQuestions?.items && contributions.userQuestions.items.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                    Community Intel ({contributions.userQuestions.total})
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {contributions.userQuestions.items.map((question) => (
                      <div key={question._id} className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-b-6 border-slate-100 dark:border-slate-700 shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-duo border-2 border-white dark:border-slate-700">
                          <span className="text-lg">Ã°Å¸â€™Â¬</span>
                        </div>
                        <h4 className="text-md font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 leading-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors">{question.questionText}</h4>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-3 mb-8">
                          {question.options.map((option, idx) => (
                            <div
                              key={idx}
                              className="px-6 py-4 rounded-2xl border-2 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 group-hover:border-slate-200 transition-all"
                            >
                              <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400">{String.fromCharCode(65 + idx)}</span>
                              <span className="flex-1">{option}</span>
                            </div>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-2">
                            Ã°Å¸â€˜ÂÃ¯Â¸Â {question.viewsCount || 0}
                          </span>
                          <span className="flex items-center gap-2">
                            Ã¢ÂÂ¤Ã¯Â¸Â {question.likesCount || 0}
                          </span>
                          <span className="flex items-center gap-2">
                            Ã°Å¸â€œÂ¤ {question.sharesCount || 0}
                          </span>
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
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-b-8 border-slate-100 dark:border-slate-700 shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-slate-100 dark:border-slate-800">
                <span className="text-4xl text-slate-300">Ã°Å¸â€â€™</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Private Profile</h3>
              <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                This student has chosen to keep their accomplishments private.
              </p>
            </div>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default PublicProfile;



