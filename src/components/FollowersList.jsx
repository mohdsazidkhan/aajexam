import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Loading from './Loading';
// MobileAppWrapper import removed
import UnifiedFooter from './UnifiedFooter';

const FollowersList = ({ username: usernameProp }) => {
  const router = useRouter();
  const username = usernameProp || router.query?.username;
  const [followers, setFollowers] = useState([]);
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
      fetchFollowers();
    } else {
      setLoading(false);
      setError('Username not found');
    }
  }, [username, page, router.isReady]);

  const fetchFollowers = async () => {
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

        // Then fetch followers
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/followers/${userId}?page=${page}&limit=20`,
          config
        );

        if (response.data.success) {
          setFollowers(response.data.followers || []);
          setPagination(response.data.pagination || {});
        } else {
          setError('Failed to load followers');
        }
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Failed to load followers:', error);
      setError(error.response?.data?.message || 'Failed to load followers');
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
      <div className="container mx-auto py-0 lg:py-4 px-4 lg:px-10 bg-white dark:bg-slate-900 min-h-screen font-outfit">
        {/* Content */}
        <div >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin mb-6"></div>
              <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em]">Syncing Student Roster...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 bg-rose-100 dark:bg-rose-900/20 rounded-[2.5rem] border-2 border-rose-200/50 dark:border-rose-900/30">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{error}</p>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-32 bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/50 dark:border-slate-700/30">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">ðŸ‘¥</div>
              <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">No students have joined your circle yet.<br />Propagate your profile to recruit followers!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {followers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user.username)}
                  className="flex items-center gap-8 p-8 lg:p-10 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-b-[12px] border-slate-200 dark:border-slate-800 shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group active:translate-y-0 active:border-b-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>

                  <div className="relative shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-[2.5rem] object-cover border-4 border-white dark:border-slate-600 shadow-xl relative z-10 group-hover:scale-110 group-hover:-rotate-3 transition-transform"
                      />
                    ) : (
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[2.5rem] bg-primary-500 flex items-center justify-center text-white text-4xl font-black shadow-duo-primary border-4 border-white dark:border-slate-600 relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary-200 dark:bg-primary-900/30 rounded-[2.5rem] rotate-6 scale-95 group-hover:rotate-12 transition-transform"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary-700 dark:text-primary-500 transition-colors leading-tight truncate">{user.name}</h3>
                    {user.username && (
                      <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">@{user.username}</p>
                    )}
                  </div>

                  <div className="hidden lg:block text-right">
                    <div className="bg-slate-100 dark:bg-slate-800/50 px-8 py-5 rounded-[2rem] border-4 border-slate-200/50 dark:border-slate-700/30 shadow-inner group-hover:border-primary-500 transition-colors">
                      <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {user.followersCount || 0}
                      </p>
                      <p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">Agents</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-12 mb-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-14 h-14 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl shadow-duo border-2 border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:translate-y-0 active:translate-y-1 transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="px-8 py-3 bg-slate-50 dark:bg-slate-900 rounded-full border-2 border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-widest">
                  PHASE {page} OF {pagination.totalPages}
                </span>
              </div>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="w-14 h-14 bg-primary-500 text-white rounded-2xl shadow-duo-primary border-2 border-white/20 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 disabled:shadow-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default FollowersList;


