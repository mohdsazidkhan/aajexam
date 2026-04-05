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
        setMessage('Username updated successfully! Ã¢Å“â€œ');
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
    <div className="username-setup bg-white dark:bg-slate-800 rounded-[2rem] p-5 lg:p-10 border-2 border-b-8 border-slate-100 dark:border-slate-700 shadow-2xl max-w-[500px] mx-auto font-outfit">
      <h3 className="m-0 mb-2 text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Set Your Username</h3>
      <p className="username-info m-0 mb-8 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
        Choose a unique username that others can use to find and follow you.
      </p>

      <div className="username-input-group flex items-center border-2 border-b-4 border-slate-100 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900 transition-all relative focus-within:border-primary-500 shadow-inner">
        <div className="username-prefix text-lg font-black text-slate-600 dark:text-slate-400 mr-2">@</div>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="username"
          maxLength={20}
          className={`username-input flex-1 border-none outline-none text-base font-black bg-transparent text-slate-900 dark:text-white placeholder:text-slate-300 ${username && username !== currentUsername
            ? (available === true ? 'text-green-600' : available === false ? 'text-primary-700 dark:text-primary-500' : '')
            : ''
            }`}
        />
        {checking && (
          <span className="checking-spinner w-6 h-6 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin ml-3"></span>
        )}
        {available === true && username !== currentUsername && (
          <span className="status-icon success ml-3 text-xl lg:text-2xl font-black text-green-600">Ã¢Å“â€œ</span>
        )}
        {available === false && (
          <span className="status-icon error ml-3 text-xl lg:text-2xl font-black text-primary-700 dark:text-primary-500">Ã¢Å“â€”</span>
        )}
      </div>

      <div className="username-rules my-6 p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest leading-loose shadow-inner">
        <ul className="list-none p-0 m-0 space-y-1">
          <li>Ã¢â‚¬Â¢ 3-20 characters</li>
          <li>Ã¢â‚¬Â¢ Letters, numbers, underscores</li>
          <li>Ã¢â‚¬Â¢ No spaces or special chars</li>
        </ul>
      </div>

      {message && (
        <div className={`username-message p-2.5 px-4 rounded-md my-4 text-sm ${available === true
          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-700'
          : available === false
            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-700'
            : 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 border border-primary-300 dark:border-primary-700'
          }`}>
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        className="save-username-btn w-full p-5 bg-primary-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all active:translate-y-1 shadow-duo-secondary disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {saving ? 'Saving student...' : 'Save Student Identity'}
      </button>
    </div>
  );
};

export default UsernameSetup;



