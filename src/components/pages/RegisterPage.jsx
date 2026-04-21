'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Trophy,
  Brain,
  Rocket,
  ShieldCheck,
  Hash,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import UnifiedFooter from '../UnifiedFooter';
import MobileAppWrapper from '../MobileAppWrapper';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const router = useRouter();

  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 20;
    if (/[a-z]/.test(pass)) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[@$!%*?&]/.test(pass)) score += 20;
    return score;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (passwordStrength < 100) {
      toast.error('Please meet all password requirements');
      return;
    }

    setIsLoading(true);
    try {
      const res = await API.register({ name, email, phone, password, ...(referralCode && { referredBy: referralCode }) });
      if (res.success) {
        toast.success('Account created! Please login.');
        router.push('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper showHeader={true} title="Register">
      <div className="flex-1 flex flex-col lg:flex-row items-stretch">
        <div className="hidden lg:flex w-1/2 bg-slate-900 p-20 flex-col justify-center items-start relative overflow-hidden text-white">
          <div className="space-y-10 relative z-10">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>
              <div className="p-5 bg-primary-500 rounded-[2.5rem] shadow-duo-secondary w-fit">
                <Rocket className="w-12 h-12" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-outfit uppercase tracking-tight leading-none">
                Join the <span className="text-primary-400">community</span>.
              </h1>
              <p className="text-xl font-bold text-slate-300 max-w-md leading-relaxed">
                Join thousands of students who study every day, improve their scores, and earn cash by referring friends.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              {[
                { icon: Trophy, text: 'Earn cash when friends you refer upgrade to PRO' },
                { icon: Brain, text: 'Learn step by step from beginner to champion' },
                { icon: ShieldCheck, text: 'See your score and rank anytime' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-slate-300 font-bold">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <item.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <span className="text-sm font-black tracking-[0.04em]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <Sparkles className="absolute -top-10 -right-10 w-96 h-96 opacity-10 animate-pulse" />
        </div>

        <div className="flex-1 flex items-center justify-center overflow-y-auto py-4 lg:py-8">
          <Card className="w-full max-w-md p-5 lg:p-10 border-2 shadow-2xl space-y-8 rounded-[3rem]">
            <div className="text-center space-y-3">
              <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Create account</h2>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-[0.04em]">
                Fill in your details to create your free account.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-[0.08em] px-1">Full name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold placeholder:font-bold placeholder:text-slate-300"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-[0.08em] px-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-sm placeholder:font-bold placeholder:text-slate-300"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-[0.08em] px-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="number"
                      required
                      className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold text-sm placeholder:font-bold placeholder:text-slate-300"
                      placeholder="10 digits"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-[0.08em] px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold placeholder:font-bold placeholder:text-slate-300"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-700 dark:text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="px-2 pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 tracking-[0.08em]">Password strength</span>
                    <span className={`text-[10px] font-black ${passwordStrength === 100 ? 'text-green-500' : 'text-primary-700 dark:text-primary-500'}`}>
                      {passwordStrength}%
                    </span>
                  </div>
                  <ProgressBar progress={passwordStrength} color={passwordStrength === 100 ? 'green-500' : 'primary-500'} height="h-1.5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-[0.08em] px-1">Referral code (optional)</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-700 dark:group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-4 border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 rounded-2xl outline-none focus:border-primary-500 focus:border-solid transition-all font-black tracking-[0.08em] text-sm placeholder:font-bold placeholder:text-slate-300"
                    placeholder="Referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <Button variant="primary" fullWidth size="lg" className="py-5 rounded-2xl shadow-duo-primary" type="submit" disabled={isLoading || passwordStrength < 100}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-[0.04em]">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-700 dark:text-primary-500 hover:underline font-black">
                  Log in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default RegisterPage;


