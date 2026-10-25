/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Head from 'next/head';
import axios from 'axios';
import { ListSkeleton } from '../../../components/common/skeletons/PrivateSkeletons';
import MobileAppWrapper from '../../../components/common/MobileAppWrapper';
import useTranslate from '../../../hooks/useTranslate';
import Pagination from '../../../components/common/Pagination';
import { PUBLIC_PAGE_SIZE_OPTIONS, PUBLIC_DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';

export default function FollowingListPage() {
  const { translate } = useTranslate();
  const router = useRouter();
  const { username } = router.query;
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PUBLIC_DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (username) {
      fetchFollowing();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, page, pageSize]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      // First get user ID from username
      const profileRes = await axios.get(
        `/api/users/profile/${username}`,
        config
      );

      if (profileRes.data.success) {
        const userId = profileRes.data.user.id;

        // Then fetch following
        const response = await axios.get(
          `/api/users/following/${userId}?page=${page}&limit=${pageSize}`,
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
      <div className="container mx-auto min-h-screen font-outfit pt-3 xl:pt-5">
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
        <div >
          {loading ? (
            <ListSkeleton rows={8} />
          ) : following.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-sm xl:text-lg font-black text-slate-400 uppercase tracking-tight">{translate('Not following anyone yet')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-4">
              {following.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user.username)}
                  className="flex items-center min-w-0 gap-3 xl:gap-4 p-3 xl:p-4 bg-white dark:bg-slate-900 rounded-[1rem] xl:rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-primary-700 transition-all cursor-pointer group shadow-sm active:translate-y-1 active:border-b-2"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800"
                    />
                  ) : (
                    <div className="w-12 xl:w-16 h-12 xl:h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-md xl:text-xl font-black shadow-sm">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-md xl:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors">{user.name}</h3>
                    {user.username && (
                      <p className="text-xs font-black tracking-widest text-primary-600 dark:text-primary-300 mt-1">@{user.username}</p>
                    )}
                  </div>

                  <div className="text-right hidden sm:block xl:hidden">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {translate('{count} followers', { count: user.followersCount || 0 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 pb-12"><Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} itemsPerPage={pageSize} onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }} itemsPerPageOptions={PUBLIC_PAGE_SIZE_OPTIONS} sticky={false} /></div>
        </div>
      </div>
    </MobileAppWrapper>
  );
}

