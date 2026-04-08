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
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/unfollow/${userId}`,
          config
        );
        setIsFollowing(false);
        onFollowChange && onFollowChange(false);
      } else {
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
        px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 inline-flex items-center justify-center gap-1.5
        ${isFollowing
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-2 border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/30'
          : 'bg-primary-500 hover:bg-primary-600 text-white border-2 border-b-4 border-primary-700 active:translate-y-0.5 active:border-b-2'
        }
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </button>
  );
};

export default FollowButton;
