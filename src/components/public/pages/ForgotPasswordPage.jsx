'use client';

import { useState } from 'react';
import Link from '@/components/common/AppLink';
import {
  Mail,
  ArrowLeft,
  Sparkles,
  CircleCheck,
  Send,
  Key
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import UnifiedFooter from '../../common/UnifiedFooter';
import Card from '../../common/ui/Card';
import Button from '../../common/ui/Button';
import MobileAppWrapper from '../../common/MobileAppWrapper';
import useTranslate from '../../../hooks/useTranslate';

const ForgotPasswordPage = () => {
  const { translate, rich } = useTranslate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error(translate('Error: Email is required'));

    setIsLoading(true);
    try {
      const res = await API.forgotPassword(email);
      if (res.success) {
        setSuccess(true);
        toast.success(translate('Reset link sent successfully!'));
      } else {
        toast.error(res.message || translate('Failed to send reset link.'));
      }
    } catch (err) {
      toast.error(translate('Connection error. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper showHeader={true} title={translate('Forgot Password')}>
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Elements */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Card as="section" className="p-6 xl:p-8 border-none space-y-6">

            {/* Header */}
            <div className="text-center space-y-2 xl:space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-500/10"
              >
                <Key className="w-10 h-10" />
              </motion.div>
              <h2 className="text-xl xl:text-3xl font-bold font-outfit tracking-tight text-content-primary leading-none">
                {rich('Reset <0>Password</0>', [(c) => <span className="text-primary-600">{c}</span>])}
              </h2>
              <p className="text-sm font-bold text-content-secondary tracking-[0.04em] px-4">{translate('Enter your email and we will send you a link to reset your password.')}</p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-6"
                >
                  <div className="w-16 h-16 text-primary-600 rounded-full flex items-center justify-center mx-auto">
                    <CircleCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-outfit text-primary-600">{translate('Email sent')}</h3>
                    <p className="text-sm font-bold text-content-secondary tracking-[0.04em] leading-relaxed">
                      {translate('We have sent a reset link to your email. Please check your inbox.')}
                    </p>
                  </div>
                  <Button variant="primary" fullWidth onClick={() => setSuccess(false)} className="rounded-2xl py-4">
                    {translate('Try another email')}
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
                    <label className="text-xs font-bold text-content-secondary tracking-[0.08em] ml-2">{translate('Email address')}</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        type="email"
                        className="w-full bg-background-surface-secondary border border-border-primary rounded-2xl p-6 pl-16 text-sm font-bold placeholder:text-slate-300 outline-none focus:border-primary-700 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:font-bold"
                        placeholder={translate('Enter your email...')}
                        value={email}
                        onChange={e => setEmail(e.target.value?.toLowerCase())}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 xl:space-y-4">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={isLoading}
                      className="py-6 rounded-2xl"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                          {translate('Sending...')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> {translate('Send reset link')}
                        </span>
                      )}
                    </Button>

                    <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-content-secondary tracking-[0.04em] hover:text-primary-600 transition-colors font-outfit">
                      <ArrowLeft className="w-3 h-3" /> {translate('Back to login')}
                    </Link>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <Sparkles className="absolute -bottom-12 -right-12 w-24 xl:w-48 h-24 xl:h-48 text-primary-600 dark:text-primary-500/5 pointer-events-none" />
          </Card>
        </motion.div>
      </div>    </MobileAppWrapper>
  );
};

export default ForgotPasswordPage;


