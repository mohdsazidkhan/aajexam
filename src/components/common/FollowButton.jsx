import React, { useState } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import axios from 'axios';
import useTranslate from '../../hooks/useTranslate';

const FollowButton = ({ userId, initialFollowing = false, onFollowChange, className = '' }) => {
  const { translate } = useTranslate();
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
      alert(error.response?.data?.message || translate('Failed to perform action'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`
        px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg xl:rounded-xl text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200 inline-flex items-center justify-center gap-1.5
        ${isFollowing
          ? 'text-primary-600 border border-primary-200 dark:border-primary-600'
          : 'bg-primary-600 hover:bg-primary-600 text-on-primary border border-b-2 border-primary-600 active:translate-y-0.5 active:border-b-2'
        }
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
      onClick={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin"></div>
      ) : isFollowing ? (
        translate('Following')
      ) : (
        translate('Follow')
      )}
    </button>
  );
};

export default FollowButton;
