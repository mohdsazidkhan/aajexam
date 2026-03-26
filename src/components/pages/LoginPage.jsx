'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';

import API from '../../lib/api';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTrophy, FaBrain, FaRocket, FaSignInAlt } from 'react-icons/fa';
import MobileAppWrapper from '../MobileAppWrapper';
import UnifiedFooter from '../UnifiedFooter';
import MonthlyRewardsInfo from '../MonthlyRewardsInfo';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const router = useRouter();

  // Google OAuth Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log('🔍 Google OAuth process started...');

        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        }).then(res => res.json());

        console.log('📊 Google user info:', userInfo);

        // Send to backend for authentication with referral code
        const authResponse = await API.googleAuth({
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          ...(referralCode && { referralCode: referralCode.toUpperCase() })
        });

        if (authResponse.success) {
          console.log('✅ Google login successful, processing user data...');

          localStorage.setItem('userInfo', JSON.stringify(authResponse.user));
          localStorage.setItem('token', authResponse.token);

          // Dispatch custom event to notify components of auth state change
          window.dispatchEvent(new CustomEvent('authStateChanged'));

          if (authResponse.user.role === 'admin') {
            console.log('🚀 Redirecting to admin dashboard...');
            router.push('/admin/dashboard');
          } else {
            console.log('🚀 Redirecting to student profile...');
            router.push('/');
          }
          toast.success(authResponse.message || 'Google login successful!');
        }
      } catch (error) {
        console.error('❌ Google login error:', error);
        toast.error(error.response?.data?.message || 'Google login failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('❌ Google OAuth error:', error);
      toast.error('Google login failed. Please try again.');
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔍 Login process started...');

      console.log('📞 Making API call to login...');
      const response = await API.login({ identifier, password });
      console.log('📊 Login response:', response);

      if (response?.success) {
        console.log('✅ Login successful, processing user data...');
        console.log('👤 User role:', response.user.role);
        console.log('👤 User data:', response.user);

        localStorage.setItem('userInfo', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);

        // Dispatch custom event to notify components of auth state change
        window.dispatchEvent(new CustomEvent('authStateChanged'));

        console.log('💾 Data stored in localStorage');
        console.log('🔍 Verifying localStorage...');
        const storedUser = localStorage.getItem('userInfo');
        const storedToken = localStorage.getItem('token');
        console.log('Stored user:', storedUser);
        console.log('Stored token:', storedToken ? 'Present' : 'Missing');

        if (response.user.role === 'admin') {
          console.log('🚀 Redirecting to admin dashboard...');
          router.push('/admin/dashboard');
        } else {
          console.log('🚀 Redirecting to student profile...');
          router.push('/');
        }
        toast.success(response.message || "Login Success!")
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper title="Login">
      <div className="bg-subg-light dark:bg-subg-dark flex items-center justify-center p-2 md:p-4">
        <div className="w-full container mx-auto py-4 px-0 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">

          {/* Left Side - Quiz Platform Info */}
          <div className="hidden lg:block space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-5xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Welcome Back! 🎯
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Ready to continue your quiz journey? Sign in and keep learning!
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-2 lg:space-y-6">
              <div className="flex items-center space-x-4 p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg">
                  <FaBrain className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Track Your Progress</h3>
                  <p className="text-gray-600 dark:text-gray-300">See your level progression and quiz history</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <FaTrophy className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Compete & Win</h3>
                  <p className="text-gray-600 dark:text-gray-300">Join competitions and climb the leaderboard</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-6 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <FaRocket className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Live Battles</h3>
                  <p className="text-gray-600 dark:text-gray-300">Participate in real-time quiz competitions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="border border-white/20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 login-form-container">
              <div className="text-center mb-4 lg:mb-8">
                <h2 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back!</h2>
                <p className="text-gray-600 dark:text-gray-400">Sign in to continue your quiz journey</p>
              </div>

              {/* Referral Code Input */}
              <div className="mb-6 referral-code-input">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Referral Code (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">#</span>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 tracking-widest uppercase"
                    placeholder="Enter referral code"
                    maxLength={8}
                  />
                </div>
                <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400 referral-code-help-text">
                  Have a friend's referral code? Enter it here to get started with Google sign-in!
                </p>
              </div>

              {/* Google Login Button */}
              <button
                onClick={() => googleLogin()}
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-3 lg:px-6 py-2 lg:py-3 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center space-x-3 mb-3 lg:mb-6 shadow-sm hover:shadow-md"
              >
                <img src="/google.svg" alt="Google" className="w-6 h-6" />
                <span>Sign In with Google</span>
              </button>

              {/* Divider */}
              <div className="relative mb-2 lg:mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or continue with email</span>
                </div>
              </div>

              {/* Existing Login Form */}
              <form onSubmit={handleLogin} className="space-y-2 lg:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email or Phone
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                      placeholder="Enter your email or phone"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-yellow-600 text-white py-2 lg:py-3 px-4 lg:px-6 rounded-xl font-semibold hover:from-red-700 hover:to-yellow-700 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
                  >
                    REGISTER
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UnifiedFooter />
    </MobileAppWrapper>
  );
};

export default LoginPage;



