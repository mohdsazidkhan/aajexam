'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  ArrowLeft,
  Sparkles,
  CircleCheck,
  Send,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import UnifiedFooter from '../UnifiedFooter';
import Card from '../ui/Card';
import Button from '../ui/Button';
import MobileAppWrapper from '../MobileAppWrapper';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Error: Email is required');

    setIsLoading(true);
    try {
      const res = await API.forgotPassword({ email });
      if (res.success) {
        setSuccess(true);
        toast.success('Reset link sent successfully!');
      } else {
        toast.error(res.message || 'Failed to send reset link.');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper showHeader={true} title="Forgot Password">
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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
                <Key className="w-10 h-10" />
              </motion.div>
              <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                Reset <span className="text-primary-700 dark:text-primary-500">Password</span>
              </h2>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-[0.04em] px-4">Enter your email and we will send you a link to reset your password.</p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CircleCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black font-outfit uppercase text-emerald-600">Email sent</h3>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-[0.04em] leading-relaxed">
                      We have sent a reset link to your email. Please check your inbox.
                    </p>
                  </div>
                  <Button variant="ghost" fullWidth onClick={() => setSuccess(false)} className="rounded-2xl py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    Try another email
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 dark:text-gray-400 tracking-[0.08em] ml-2">Email address</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-700 dark:text-primary-500 transition-colors" />
                      <input
                        type="email"
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 pl-16 text-sm font-bold placeholder:text-slate-300 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:font-bold"
                        placeholder="Enter your email..."
                        value={email}
                        onChange={e => setEmail(e.target.value?.toLowerCase())}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={isLoading}
                      className="py-6 rounded-2xl shadow-duo-primary"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> Send reset link
                        </span>
                      )}
                    </Button>

                    <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-black text-slate-600 dark:text-gray-400 tracking-[0.04em] hover:text-primary-700 dark:text-primary-500 transition-colors font-outfit">
                      <ArrowLeft className="w-3 h-3" /> Back to login
                    </Link>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <Sparkles className="absolute -bottom-12 -right-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 pointer-events-none" />
          </Card>
        </motion.div>
      </div>    </MobileAppWrapper>
  );
};

export default ForgotPasswordPage;


