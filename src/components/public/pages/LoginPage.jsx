'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/common/AppLink';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
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
import { m as motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import Button from '../../common/ui/Button';
import Card from '../../common/ui/Card';
import UnifiedFooter from '../../common/UnifiedFooter';
import MobileAppWrapper from '../../common/MobileAppWrapper';
import useTranslate from '../../../hooks/useTranslate';
import { getPostLoginPath } from '../../../lib/utils/authUtils';

const LoginPage = () => {
  const { translate } = useTranslate();
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
          router.push(getPostLoginPath(authRes.user));
          toast.success(translate('Welcome to AajExam!'));
        }
      } catch (error) {
        toast.error(translate('Google login failed.'));
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
        router.push(getPostLoginPath(res.user));
        toast.success(translate('Welcome back!'));
      }
    } catch (err) {
      toast.error(translate('Login failed. Check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAppWrapper showHeader={true} title={translate('Login')}>
      <div className="flex-1 flex flex-col xl:flex-row items-stretch">
        <div className="hidden xl:flex w-1/2 p-16 flex-col justify-center items-start relative overflow-hidden bg-background-surface">
          <div className="space-y-4 xl:space-y-8 relative z-10">
            <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
              <div className="p-5 text-on-primary w-fit bg-primary-600" style={{ borderRadius: 'var(--radius)' }}>
                <Trophy className="w-12 h-12" />
              </div>
            </motion.div>

            <div className="space-y-2 xl:space-y-4">
              <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold font-outfit tracking-tight leading-none text-content-primary">
                {translate('Welcome back!')}
                <br />
                {translate('Keep practicing.')}
              </h1>
            </div>

            <div className="space-y-2 xl:space-y-4 pt-4">
              {[
                { icon: CircleCheck, text: 'Continue where you left off' },
                { icon: Brain, text: 'Check your progress and complete daily challenge' },
                { icon: Sparkles, text: 'Play daily quizzes subject & topic wise' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-content-secondary font-bold">
                  <div className="p-2 rounded-lg xl:rounded-xl">
                    <item.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-sm font-bold tracking-[0.04em]">{translate(item.text)}</span>
                </div>
              ))}
            </div>
          </div>

          <Rocket className="absolute -bottom-10 -right-10 w-96 h-96 opacity-5 rotate-45" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Card as="section" className="w-full max-w-md p-5 xl:p-8 space-y-6">
            <section className="text-center space-y-3">
              <h2 className="text-xl xl:text-3xl font-bold font-outfit tracking-tight text-content-primary">{translate('Welcome back')}</h2>
              <p className="text-sm font-bold text-content-secondary tracking-[0.04em]">
                {translate('Enter your details to log in.')}
              </p>
            </section>

            <div className="space-y-2 xl:space-y-4">
              <button
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl border border-border-primary dark:border-slate-600 font-bold text-sm uppercase tracking-wide hover:bg-background-surface-secondary transition-all group mt-4 xl:mt-2"
              >
                <img src="/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {translate('Continue with Google')}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t-2 border-border-primary" />
                <span className="flex-shrink mx-4 text-xs font-bold text-content-muted tracking-[0.08em]">
                  {translate('Or continue with email')}
                </span>
                <div className="flex-grow border-t-2 border-border-primary" />
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-content-secondary tracking-[0.08em] px-1">
                    {translate('Email or phone')}
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-600 transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border-primary outline-none focus:border-primary-700 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold placeholder:font-bold placeholder:text-slate-300"
                      placeholder={translate('you@example.com')}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-xs font-bold text-content-secondary tracking-[0.08em]">{translate('Password')}</label>
                    <Link href="/forgot-password" className="text-xs font-bold text-primary-600 hover:underline">
                      {translate('Forgot password?')}
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-600 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border border-border-primary outline-none focus:border-primary-700 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold placeholder:font-bold placeholder:text-slate-300"
                      placeholder={translate('Enter your password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? translate('Hide password') : translate('Show password')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" fullWidth size="lg" className="py-5 rounded-2xl" type="submit" disabled={isLoading}>
                  {isLoading ? translate('Logging in...') : translate('Login')}
                </Button>
              </form>
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-content-secondary tracking-[0.04em]">
                {translate("Don't have an account?")}{' '}
                <Link href="/register" className="text-primary-600 hover:underline font-bold">
                  {translate('REGISTER')}
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

const LoginPageWithGoogleAuth = () => {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId === 'your_google_client_id_here') {
    return <LoginPage />;
  }
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LoginPage />
    </GoogleOAuthProvider>
  );
};

export default LoginPageWithGoogleAuth;

