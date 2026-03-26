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
    <div className="user-search-container max-w-[700px] mx-auto p-5">
      <div className="search-box relative mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users by name or username..."
          className="search-input w-full p-4 pr-12 text-base border-2 border-gray-300 dark:border-gray-600 rounded-xl outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-secondary-500 focus:shadow-[0_0_0_3px_rgba(0,123,255,0.1)]"
        />
        {loading && (
          <span className="search-spinner absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-gray-200 dark:border-gray-700 border-t-secondary-500 rounded-full animate-spin"></span>
        )}
      </div>

      {searched && users.length === 0 && !loading && (
        <div className="no-results text-center py-10 px-5">
          <p className="m-0 text-base text-gray-600 dark:text-gray-400">No users found for "{query}"</p>
        </div>
      )}

      {users.length > 0 && (
        <div className="search-results flex flex-col gap-2.5">
          {users.map((user) => (
            <div
              key={user._id}
              className="user-result-item flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => handleUserClick(user.username)}
            >
              <img
                src={user.profilePicture || '/logo.png'}
                alt={user.name}
                className="user-result-avatar w-15 h-15 rounded-full object-cover flex-shrink-0"
              />
              <div className="user-result-info flex-1 min-w-0">
                <h4 className="m-0 mb-1 text-base font-semibold text-gray-900 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
                  {user.name}
                </h4>
                <p className="user-result-username m-0 mb-1 text-sm text-primary-600 dark:text-primary-400">
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="user-result-bio m-0 text-xs text-gray-600 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.bio}
                  </p>
                )}
              </div>
              <div className="user-result-stats flex items-center gap-4 flex-shrink-0">
                <div className="user-stat flex flex-col items-center text-center">
                  <span className="level-badge-small bg-gradient-to-br from-purple-600 from-red-800 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    L{user.monthlyProgress?.currentLevel || 0}
                  </span>
                </div>
                <div className="user-stat flex flex-col items-center text-center">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {user.followersCount || 0}
                  </span>
                  <small className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">Followers</small>
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

