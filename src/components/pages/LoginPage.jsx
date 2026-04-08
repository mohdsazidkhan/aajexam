'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Trophy,
  Brain,
  Rocket,
  Sparkles,
  CircleCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import UnifiedFooter from '../UnifiedFooter';
import MobileAppWrapper from '../MobileAppWrapper';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        }).then((res) => res.json());

        const authRes = await API.googleAuth({
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        });

        if (authRes.success) {
          const userInfo = {
            ...authRes.user,
          }
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          localStorage.setItem('token', authRes.token);
          window.dispatchEvent(new CustomEvent('authStateChanged'));
          router.push(authRes.user.role === 'admin' ? '/admin/dashboard' : '/home');
          toast.success('Welcome to AajExam!');
        }
      } catch (error) {
        toast.error('Google login failed.');
      }
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await API.login({ identifier, password });
      if (res?.success) {
        const userInfo = {
          ...res.user,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('token', res.token);
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        router.push(res.user.role === 'admin' ? '/admin/dashboard' : '/home');
        toast.success('Welcome back!');
      }
    } catch (err) {
      toast.error('Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper showHeader={true} title="Login">
      <div className="flex-1 flex flex-col lg:flex-row items-stretch">
        <div className="hidden lg:flex w-1/2 bg-slate-50 dark:bg-slate-800/50 p-20 flex-col justify-center items-start relative overflow-hidden">
          <div className="space-y-10 relative z-10">
            <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <div className="p-5 bg-primary-500 rounded-[2.5rem] shadow-duo-primary w-fit text-white">
                <Trophy className="w-12 h-12" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-outfit uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                Welcome back!
                <br />
                Keep practicing.
              </h1>
              <p className="text-xl font-bold text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                Log in to continue your practice and see how you are doing today.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              {[
                { icon: CircleCheck, text: 'Continue where you left off' },
                { icon: Brain, text: 'Check your progress and daily streak' },
                { icon: Sparkles, text: 'Get your daily quiz and rewards' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-bold">
                  <div className="p-2 bg-primary-500/10 rounded-xl">
                    <item.icon className="w-5 h-5 text-primary-700 dark:text-primary-500" />
                  </div>
                  <span className="text-sm font-black tracking-[0.04em]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <Rocket className="absolute -bottom-10 -right-10 w-96 h-96 opacity-5 rotate-45" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md p-5 lg:p-10 border-2 shadow-2xl space-y-8 rounded-[3rem]">
            <div className="text-center space-y-3">
              <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-[0.04em]">
                Enter your details to log in.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group mt-4 lg:mt-2"
              >
                <img src="/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Continue with Google
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t-2 border-slate-100 dark:border-slate-800" />
                <span className="flex-shrink mx-4 text-xs font-black text-slate-500 dark:text-slate-400 tracking-[0.08em]">
                  Or continue with email
                </span>
                <div className="flex-grow border-t-2 border-slate-100 dark:border-slate-800" />
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-[0.08em] px-1">
                    Email or phone
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-700 dark:group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold placeholder:font-bold placeholder:text-slate-300"
                      placeholder="you@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-[0.08em]">Password</label>
                    <Link href="/forgot-password" className="text-xs font-black text-primary-700 dark:text-primary-500 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-700 dark:group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold placeholder:font-bold placeholder:text-slate-300"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-700 dark:text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" fullWidth size="lg" className="py-5 rounded-2xl shadow-duo-primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-[0.04em]">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary-700 dark:text-primary-500 hover:underline font-black">
                  Create New
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default LoginPage;

