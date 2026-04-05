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
        px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 min-w-[180px] inline-flex items-center justify-center border-4
        ${isFollowing
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 shadow-duo border-b-4 translate-y-1 active:translate-y-2 active:border-b-0 opacity-80'
          : 'bg-primary-500 hover:bg-primary-600 text-white border-white/20 shadow-duo-primary border-b-[8px] border-primary-700 active:translate-y-2 active:border-b-0 hover:-translate-y-1'
        }
        disabled:opacity-60 disabled:cursor-not-allowed
      `}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <div className="w-5 h-5 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : (
        isFollowing ? 'âœ“ Active Rival' : 'Add Rival'
      )}
    </button>
  );
};

export default FollowButton;


