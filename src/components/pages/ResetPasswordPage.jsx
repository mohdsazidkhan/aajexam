'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import API from '../../lib/api';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import MobileAppWrapper from '../MobileAppWrapper';
import UnifiedFooter from '../UnifiedFooter';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token from query string
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await API.resetPassword({ token, newPassword });
      if (res.success) {
        setSuccess(true);
        toast.success(res.message || 'Password reset successful!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        toast.error(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper title="Reset Password">
      <div className="bg-gradient-to-br from-primary-50 via-red-50 to-primary-100 dark:from-gray-900 dark:via-red-900 dark:to-primary-900 flex items-center justify-center min-h-screen p-2 md:p-4">
        <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="mb-6 flex items-center gap-2">
            <Link href="/login" className="text-primary-600 hover:underline flex items-center gap-1">
              <FaArrowLeft /> Back to Login
            </Link>
          </div>
          <h2 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">Reset Password</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Enter your new password below.</p>
          {success ? (
            <div className="text-green-600 text-center font-semibold py-6">Password reset successful! Redirecting to login...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-2 font-semibold" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-primary-100"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mr-2"></span>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </MobileAppWrapper>
  );
};

export default ResetPasswordPage;






