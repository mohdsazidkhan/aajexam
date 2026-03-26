import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const FollowButton = ({ userId, initialFollowing = false, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        router.push('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (isFollowing) {
        // Unfollow
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/unfollow/${userId}`,
          config
        );
        setIsFollowing(false);
        onFollowChange && onFollowChange(false);
      } else {
        // Follow
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/follow/${userId}`,
          {},
          config
        );
        setIsFollowing(true);
        onFollowChange && onFollowChange(true);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
      alert(error.response?.data?.message || 'Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`
        px-7 py-2.5 rounded-lg font-semibold text-base transition-all duration-300 min-w-[110px] inline-flex items-center justify-center
        ${isFollowing
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-primary-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700'
          : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
        }
        disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
      `}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        isFollowing ? 'Following' : 'Follow'
      )}
    </button>
  );
};

export default FollowButton;

