import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const UserSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchUsers();
      } else {
        setUsers([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/search?query=${query}`
      );

      if (response.data.success) {
        setUsers(response.data.users);
        setSearched(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username) => {
    router.push(`/u/${username}`);
  };

  return (
    <div className="user-search-container max-w-[700px] mx-auto p-5 font-outfit">
      <div className="search-box relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students by name or username..."
          className="search-input w-full p-5 pr-14 text-sm font-black uppercase tracking-widest border-2 border-b-4 border-slate-200 dark:border-slate-800 rounded-2xl outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:white focus:border-primary-500 shadow-sm"
        />
        {loading && (
          <span className="search-spinner absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 border-4 border-slate-100 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin"></span>
        )}
      </div>

      {searched && users.length === 0 && !loading && (
        <div className="no-results text-center py-16 px-5 bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200/50 dark:border-slate-700/30">
          <p className="m-0 text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">No students found for "{query}"</p>
        </div>
      )}

      {users.length > 0 && (
        <div className="search-results flex flex-col gap-5">
          {users.map((user) => (
            <div
              key={user._id}
              className="user-result-item flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-b-8 border-slate-200 dark:border-slate-800 shadow-xl cursor-pointer transition-all hover:-translate-y-1 active:translate-y-1 group"
              onClick={() => handleUserClick(user.username)}
            >
              <img
                src={user.profilePicture || '/logo.png'}
                alt={user.name}
                className="user-result-avatar w-16 h-16 rounded-2xl object-cover flex-shrink-0 border-2 border-slate-100 shadow-sm"
              />
              <div className="user-result-info flex-1 min-w-0">
                <h4 className="m-0 mb-1 text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                  {user.name}
                </h4>
                <p className="user-result-username m-0 mb-1 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="user-result-bio m-0 text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.bio}
                  </p>
                )}
              </div>
              <div className="user-result-stats flex items-center gap-6 flex-shrink-0">
                <div className="user-stat flex flex-col items-center text-center">
                  <span className="bg-primary-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-duo-primary">
                    STUDENT
                  </span>
                </div>
                <div className="user-stat flex flex-col items-center text-center">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {user.followersCount || 0}
                  </span>
                  <small className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-0.5">Students</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;


