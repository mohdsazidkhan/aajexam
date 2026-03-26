import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsernameSetup = ({ currentUsername, onUpdate }) => {
  const [username, setUsername] = useState(currentUsername || '');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUsername) {
      setUsername(currentUsername);
    }
  }, [currentUsername]);

  useEffect(() => {
    // Debounce username availability check
    const timer = setTimeout(() => {
      if (username && username !== currentUsername && username.length >= 3) {
        checkUsernameAvailability();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const checkUsernameAvailability = async () => {
    try {
      setChecking(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/student/check-username?username=${username}`
      );

      if (response.data.success) {
        setAvailable(response.data.available);
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Failed to check username:', error);
      setMessage('Failed to check username availability');
      setAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    setAvailable(null);
    setMessage('');
  };

  const handleSave = async () => {
    if (!username || username.length < 3 || username.length > 20) {
      setMessage('Username must be 3-20 characters');
      return;
    }

    if (!available && username !== currentUsername) {
      setMessage('Please choose an available username');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/student/username`,
        { username },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMessage('Username updated successfully! ✓');
        onUpdate && onUpdate(response.data.username);
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      setMessage(error.response?.data?.message || 'Failed to update username');
    } finally {
      setSaving(false);
    }
  };

  const isValid = username.length >= 3 && username.length <= 20;
  const canSave = isValid && (username === currentUsername || available === true);

  return (
    <div className="username-setup bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md max-w-[500px] mx-auto">
      <h3 className="m-0 mb-2.5 text-2xl font-bold text-gray-900 dark:text-white">Set Your Username</h3>
      <p className="username-info m-0 mb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        Choose a unique username that others can use to find and follow you.
      </p>

      <div className="username-input-group flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2.5 px-4 bg-white dark:bg-gray-700 transition-all relative focus-within:border-secondary-500 focus-within:shadow-[0_0_0_3px_rgba(0,123,255,0.1)]">
        <div className="username-prefix text-lg font-semibold text-gray-600 dark:text-gray-400 mr-1.5">@</div>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="username"
          maxLength={20}
          className={`username-input flex-1 border-none outline-none text-base p-1.5 font-medium bg-transparent text-gray-900 dark:text-white ${username && username !== currentUsername
            ? (available === true ? 'text-green-600' : available === false ? 'text-primary-600' : '')
            : ''
            }`}
        />
        {checking && (
          <span className="checking-spinner w-5 h-5 border-2 border-gray-200 dark:border-gray-600 border-t-secondary-500 rounded-full animate-spin ml-2.5"></span>
        )}
        {available === true && username !== currentUsername && (
          <span className="status-icon success ml-2.5 text-xl font-bold text-green-600">✓</span>
        )}
        {available === false && (
          <span className="status-icon error ml-2.5 text-xl font-bold text-primary-600">✗</span>
        )}
      </div>

      <div className="username-rules my-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
        <small>
          • 3-20 characters<br />
          • Only letters, numbers, and underscores<br />
          • No spaces or special characters
        </small>
      </div>

      {message && (
        <div className={`username-message p-2.5 px-4 rounded-md my-4 text-sm ${available === true
          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-700'
          : available === false
            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-700'
            : 'bg-secondary-100 dark:bg-secondary-900/20 text-secondary-800 dark:text-secondary-400 border border-secondary-300 dark:border-secondary-700'
          }`}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        className="save-username-btn w-full p-3 bg-secondary-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all hover:bg-secondary-700 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,123,255,0.3)] disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Username'}
      </button>
    </div>
  );
};

export default UsernameSetup;

