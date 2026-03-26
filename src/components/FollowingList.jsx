import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from './Loading';
// MobileAppWrapper import removed
import UnifiedFooter from './UnifiedFooter';

const FollowingList = ({ username: usernameProp }) => {
  const router = useRouter();
  const username = usernameProp || router.query?.username;
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Wait for router to be ready or username to be available
    if (!router.isReady && !username) {
      return;
    }

    if (username) {
      fetchFollowing();
    } else {
      setLoading(false);
      setError('Username not found');
    }
  }, [username, page, router.isReady]);

  const fetchFollowing = async () => {
    if (!username) {
      setLoading(false);
      setError('Username is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      // First get user ID from username
      const profileRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile/${username}`,
        config
      );

      if (profileRes.data.success) {
        const userId = profileRes.data.user.id;

        // Then fetch following
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/following/${userId}?page=${page}&limit=20`,
          config
        );

        if (response.data.success) {
          setFollowing(response.data.following || []);
          setPagination(response.data.pagination || {});
        } else {
          setError('Failed to load following');
        }
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Failed to load following:', error);
      setError(error.response?.data?.message || 'Failed to load following');
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
        {/* Content */}
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="md" color="gray" message="" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-primary-600 dark:text-red-400">{error}</p>
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    {user.username && (
                      <p className="text-sm text-primary-600 dark:text-primary-400">@{user.username}</p>
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
};

export default FollowingList;

