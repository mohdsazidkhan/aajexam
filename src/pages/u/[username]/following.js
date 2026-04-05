import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import Loading from '../../../components/Loading';
import MobileAppWrapper from '../../../components/MobileAppWrapper';

export default function FollowingListPage() {
  const router = useRouter();
  const { username } = router.query;
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (username) {
      fetchFollowing();
    }
  }, [username, page]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      // First get user ID from username
      const profileRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}//users/profile/${username}`,
        config
      );

      if (profileRes.data.success) {
        const userId = profileRes.data.user.id;

        // Then fetch following
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/following?page=${page}&limit=20`,
          config
        );

        if (response.data.success) {
          setFollowing(response.data.following);
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to load following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userUsername) => {
    if (userUsername) {
      router.push(`/u/${userUsername}`);
    }
  };

  return (
    <MobileAppWrapper title={`Following - @${username}`}>
      <div className="container mx-auto py-0 lg:py-6 px-0 lg:px-10 bg-white dark:bg-slate-950 min-h-screen font-outfit">
        <Head>
          <title>Following - @{username} - AajExam Platform</title>
          <meta name="description" content={`View who @${username} is following on AajExam. Explore the profiles they follow and discover new users.`} />
          <meta name="keywords" content={`${username}, following, user following, following list, AajExam following`} />
          <meta property="og:title" content={`Following - @${username} - AajExam Platform`} />
          <meta property="og:description" content={`View who @${username} is following on AajExam Platform.`} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`Following - @${username}`} />
          <meta name="twitter:description" content={`View @${username}'s following list on AajExam.`} />
        </Head>

        {/* Content */}
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loading size="md" color="gray" message="Finding users..." />
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-lg font-black text-slate-400 uppercase tracking-tight">Not following anyone yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {following.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user.username)}
                  className="flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-b-8 border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all cursor-pointer group shadow-sm active:translate-y-1 active:border-b-2"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl lg:text-2xl font-black shadow-lg">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors">{user.name}</h3>
                    {user.username && (
                      <p className="text-xs font-black uppercase tracking-widest text-primary-500 mt-1">@{user.username}</p>
                    )}
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {user.followersCount || 0} followers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 pb-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-duo border-2 border-b-4 border-slate-200 dark:border-slate-800 disabled:opacity-50 active:translate-y-1 active:border-b-0 transition-all"
              >
                Previous
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Page {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-duo border-2 border-b-4 border-slate-200 dark:border-slate-800 disabled:opacity-50 active:translate-y-1 active:border-b-0 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileAppWrapper>
  );
}

