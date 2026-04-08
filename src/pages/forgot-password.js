'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  ArrowLeft,
  CircleCheck,
  Send,
  Sparkles,
  ShieldQuestion,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../lib/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MobileAppWrapper from '../components/MobileAppWrapper';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.forgotPassword({ email });
      if (res.success) {
        setSuccess(true);
        toast.success("Academy recovery link sent!");
      }
    } catch (err) {
      toast.error("Account recovery failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper showHeader={true} title="Account Recovery">
      <div className="h-auto lg:min-h-screen bg-white dark:bg-slate-900 flex flex-col selection:bg-primary-500 selection:text-white">
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden py-4 lg:py-8">
          {/* --- Background Decorative Icons --- */}
          <div className="absolute top-20 left-20 opacity-5 rotate-12 hidden lg:block"><ShieldQuestion className="w-64 h-64" /></div>
          <div className="absolute bottom-20 right-20 opacity-5 -rotate-12 hidden lg:block"><Lock className="w-64 h-64" /></div>

          <Card className="w-full max-w-md p-5 lg:p-10 border-2 shadow-2xl relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <ShieldQuestion className="w-8 h-8" />
              </div>
              <h1 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight">Recover Account</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Regain access to your academy progress</p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CircleCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase">Link Sent!</h3>
                    <p className="text-sm font-bold text-gray-500">Check your inbox for instructions to reset your master password.</p>
                  </div>
                  <Link href="/login" className="block">
                    <Button variant="ghost" fullWidth>BACK TO LOGIN</Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onSubmit={handleSubmit} className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Recovery Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input
                        type="email" required
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800/50 font-bold outline-none focus:border-primary-500 transition-all"
                        placeholder="Enter your registered email"
                        value={email} onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button variant="primary" fullWidth size="lg" className="py-5 text-sm font-black" type="submit" disabled={isLoading}>
                    {isLoading ? 'INITIATING...' : 'SEND RECOVERY LINK'}
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

export default ForgotPasswordPage;
