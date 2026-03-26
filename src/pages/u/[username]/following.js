import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import Loading from '../../../components/Loading';
// MobileAppWrapper import removed
import UnifiedFooter from '../../../components/UnifiedFooter';

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
    <>
      <div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Head>
          <title>Following - @{username} - SUBG QUIZ Platform</title>
          <meta name="description" content={`View who @${username} is following on SUBG QUIZ. Explore the profiles they follow and discover new users.`} />
          <meta name="keywords" content={`${username}, following, user following, following list, SUBG QUIZ following`} />
          <meta property="og:title" content={`Following - @${username} - SUBG QUIZ Platform`} />
          <meta property="og:description" content={`View who @${username} is following on SUBG QUIZ Platform.`} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`Following - @${username}`} />
          <meta name="twitter:description" content={`View @${username}'s following list on SUBG QUIZ.`} />
        </Head>

        {/* Content */}
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" color="gray" message="" />
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Not following anyone yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {following.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user.username)}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-yellow-600 flex items-center justify-center text-white text-xl font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    {user.username && (
                      <p className="text-sm text-orange-700 dark:text-yellow-400">@{user.username}</p>
                    )}
                    {user.monthlyProgress && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.monthlyProgress?.levelName}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.followersCount || 0} followers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-900 dark:text-white">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
}

