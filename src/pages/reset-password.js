'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  CircleCheck,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MobileAppWrapper from '../components/MobileAppWrapper';
import Seo from '../components/Seo';

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Invalid reset token');
    if (newPassword.length < 6) return toast.error('Minimum 6 characters required');

    setIsLoading(true);
    try {
      const res = await API.resetPassword({ token, newPassword });
      if (res.success) {
        setSuccess(true);
        toast.success("Master password updated!");
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      toast.error("Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper showHeader={true} title="Reset Password">
      <Seo title="Reset Password – AajExam" description="Set a new AajExam password securely." noIndex={true} canonical="/reset-password" />
      <div className="h-auto lg:min-h-screen bg-white dark:bg-slate-900 flex flex-col selection:bg-primary-500 selection:text-white">
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden py-4 lg:py-8">
          {/* --- Background Decorative Icons --- */}
          <div className="absolute top-20 right-20 opacity-5 rotate-12 hidden lg:block"><ShieldCheck className="w-64 h-64" /></div>
          <div className="absolute bottom-20 left-20 opacity-5 -rotate-12 hidden lg:block"><Rocket className="w-64 h-64 text-primary-500" /></div>

          <Card className="w-full max-w-md p-5 lg:p-10 border-2 shadow-2xl relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight">Reset Password</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update your master academy credentials</p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase">Success!</h3>
                    <p className="text-sm font-bold text-gray-500">Your security credentials have been updated. Redirecting you to the login gateway...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onSubmit={handleSubmit} className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">New Master Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"} required
                        className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800/50 font-bold outline-none focus:border-primary-500 transition-all"
                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2">Minimum 6 characters required for high-level security</p>
                  </div>

                  <Button variant="secondary" fullWidth size="lg" className="py-5 text-sm font-black shadow-duo-secondary" type="submit" disabled={isLoading}>
                    {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                  </Button>

                  <div className="text-center pt-2">
                    <Link href="/login" className="text-xs font-black text-primary-500 flex items-center justify-center gap-2 hover:translate-x-[-4px] transition-transform">
                      <ArrowLeft className="w-4 h-4" /> BACK TO LOGIN
                    </Link>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default ResetPasswordPage;

