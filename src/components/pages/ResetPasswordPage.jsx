'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Sparkles,
  CircleCheck,
  RefreshCw,
  Key,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import UnifiedFooter from '../UnifiedFooter';
import Card from '../ui/Card';
import Button from '../ui/Button';
import MobileAppWrapper from '../MobileAppWrapper';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('token');
      if (t) setToken(t);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Error: Reset token is missing.');
    if (!newPassword || newPassword.length < 6) return toast.error('Error: Password must be at least 6 characters.');

    setIsLoading(true);
    try {
      const res = await API.resetPassword({ token, newPassword });
      if (res.success) {
        setSuccess(true);
        toast.success('Password updated successfully!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        toast.error(res.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper showHeader={true} title="Reset Password">
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="p-10 border-none shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl space-y-8 rounded-[3rem]">

            {/* Header */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border-2 border-primary-500/10"
              >
                <RefreshCw className="w-10 h-10" />
              </motion.div>
              <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                New <span className="text-primary-700 dark:text-primary-500">Password</span>
              </h2>
              <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none px-4">Please enter your new password below.</p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-8"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CircleCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-black font-outfit uppercase text-emerald-600">Password Updated</h3>
                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                      Your password has been reset. Redirecting to login...
                    </p>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden w-32 mx-auto mt-4 border border-slate-200 dark:border-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {!token && (
                    <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center gap-4">
                      <ShieldAlert className="w-6 h-6 text-primary-700 dark:text-primary-500 flex-shrink-0" />
                      <p className="text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest leading-tight">
                        Warning: Reset token not found. Please request a new link.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-700 dark:text-primary-500 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 pl-16 pr-16 text-sm font-bold placeholder:text-slate-300 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:font-bold"
                        placeholder="Minimum 6 characters..."
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      variant="secondary"
                      fullWidth
                      disabled={isLoading || !token}
                      className="py-6 rounded-2xl text-xs font-black shadow-duo-secondary uppercase"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          UPDATING...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" /> UPDATE PASSWORD
                        </span>
                      )}
                    </Button>

                    <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest hover:text-primary-700 dark:text-primary-500 transition-colors font-outfit">
                      <ArrowLeft className="w-3 h-3" /> BACK TO LOGIN
                    </Link>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <Sparkles className="absolute -bottom-12 -left-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 pointer-events-none" />
          </Card>
        </motion.div>
      </div>    </MobileAppWrapper>
  );
};

export default ResetPasswordPage;


