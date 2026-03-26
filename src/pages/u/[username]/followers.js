import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import Loading from '../../../components/Loading';
// MobileAppWrapper import removed
import UnifiedFooter from '../../../components/UnifiedFooter';

export default function FollowersListPage() {
  const router = useRouter();
  const { username } = router.query;
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (username) {
      fetchFollowers();
    }
  }, [username, page]);

  const fetchFollowers = async () => {
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

        // Then fetch followers
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/followers?page=${page}&limit=20`,
          config
        );

        if (response.data.success) {
          setFollowers(response.data.followers);
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to load followers:', error);
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
          <title>Followers - @{username} - AajExam Platform</title>
          <meta name="description" content={`View @${username}'s followers on AajExam. See who follows this user and explore their profiles.`} />
          <meta name="keywords" content={`${username}, followers, user followers, follower list, AajExam followers`} />
          <meta property="og:title" content={`Followers - @${username} - AajExam Platform`} />
          <meta property="og:description" content={`View @${username}'s followers on AajExam Platform.`} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={`Followers - @${username}`} />
          <meta name="twitter:description" content={`View @${username}'s follower list on AajExam.`} />
        </Head>

        {/* Content */}
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" color="gray" message="" />
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No followers yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map((user) => (
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    {user.username && (
                      <p className="text-sm text-primary-700 dark:text-primary-400">@{user.username}</p>
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

