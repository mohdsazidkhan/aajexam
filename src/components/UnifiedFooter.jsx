'use client';

import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  MessageSquare,
  Send,
  Zap,
  ShieldCheck,
  Info,
  Scale,
  FileText,
  Mail,
  Heart,
  Layers,
  Compass,
} from 'lucide-react';
import { motion } from 'framer-motion';

import config from '../lib/config/appConfig';
import Card from './ui/Card';
import { FaEnvelope } from 'react-icons/fa';

const UnifiedFooter = ({ isLandingPage: _isLandingPage = false }) => {
  const legalLinks = config.LEGAL;

  const operationalLinks = [
    { name: 'Home', href: '/', icon: Compass },
    { name: 'Categories', href: '/categories', icon: Layers },
    { name: 'Articles', href: '/articles', icon: Zap },
    { name: 'How It Works', href: '/how-it-works', icon: Info },
  ];

  const legalLinksMap = [
    { name: 'Privacy Policy', path: legalLinks.PRIVACY_POLICY, icon: ShieldCheck },
    { name: 'Terms of Service', path: legalLinks.TERMS, icon: Scale },
    { name: 'Refund Policy', path: legalLinks.REFUND_POLICY, icon: FileText },
    { name: 'Disclaimer', path: legalLinks.DISCLAIMER, icon: Info },
    { name: 'Contact Us', path: legalLinks.CONTACT, icon: MessageSquare }
  ];

  const socialLinks = [
    { icon: Facebook, url: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#' },
    { icon: Twitter, url: process.env.NEXT_PUBLIC_TWITTER_URL || '#' },
    { icon: Instagram, url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#' },
    { icon: Youtube, url: process.env.NEXT_PUBLIC_YOUTUBE_URL || '#' },
    { icon: Linkedin, url: process.env.NEXT_PUBLIC_LINKEDIN_URL || '#' },
    { icon: MessageSquare, url: process.env.NEXT_PUBLIC_DISCORD_URL || '#' },
    { icon: Send, url: process.env.NEXT_PUBLIC_TELEGRAM_URL || '#' },
  ];

  const formattedPhone = config.CONTACT.PHONE.replace(/\D/g, '');

  return (
    <footer className="relative pt-16 lg:pt-20 pb-10 lg:pb-16 overflow-hidden bg-background-page dark:bg-background-page border-t border-border-primary/50 font-outfit">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16 lg:mb-20">
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl lg:text-4xl font-black font-outfit uppercase tracking-tighter text-content-primary">
                AAJ<span className="text-primary-500 text-glow-primary">EXAM</span>
              </h2>
              <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-transparent rounded-full" />
            </div>

            <p className="text-sm font-bold text-content-secondary leading-relaxed max-w-xs">
              Practice smarter, prepare with confidence, and track your progress in one place.
            </p>

            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.icon.name || 'social media'}`}
                  className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-content-secondary hover:text-primary-600 dark:hover:text-white hover:border-primary-500/50 flex items-center justify-center transition-all hover:shadow-[0_0_20px_rgba(88,204,2,0.2)] backdrop-blur-md"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black text-primary-500 uppercase tracking-[0.25em] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              Explore
            </h4>
            <ul className="grid grid-cols-1 gap-4">
              {operationalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center gap-4 text-sm font-black text-content-secondary tracking-[0.04em] hover:text-slate-900 dark:hover:text-white transition-all">
                    <div className="w-10 h-10 rounded-xl bg-background-surface-secondary border border-border-primary flex items-center justify-center group-hover:bg-primary-500/10 group-hover:text-primary-500 group-hover:border-primary-500/30 transition-all shadow-inner">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black text-primary-500 uppercase tracking-[0.25em] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              Legal
            </h4>
            <ul className="grid grid-cols-1 gap-4">
              {legalLinksMap.map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="group flex items-center gap-4 text-sm font-black text-content-secondary tracking-[0.04em] hover:text-slate-900 dark:hover:text-white transition-all">
                    <div className="w-10 h-10 rounded-xl bg-background-surface-secondary border border-border-primary flex items-center justify-center group-hover:bg-primary-500/10 group-hover:text-primary-500 group-hover:border-primary-500/30 transition-all shadow-inner">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.25em] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Support
            </h4>
            <Card variant="glass" className="relative p-0 !bg-white/90 dark:!bg-slate-900/70 !border-slate-200 dark:!border-white/10 !rounded-[2rem] overflow-hidden group shadow-xl backdrop-blur-xl max-w-xs lg:max-w-none mx-auto sm:mx-0">
              <div className="p-5 space-y-5">
                <a
                  href={`mailto:${config.CONTACT.EMAIL}`}
                  aria-label="Send us an email"
                  className="flex items-center gap-3 group/item hover:translate-x-1 transition-all duration-300"
                >
                  <div className="w-11 h-11 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover/item:bg-blue-500 group-hover/item:text-white transition-all shadow-duo-secondary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-black text-content-primary tracking-[0.08em] mb-0.5 group-hover/item:text-blue-500 transition-colors">Email support</p>
                    <p className="text-xs font-bold text-content-secondary break-all line-clamp-1">{config.CONTACT.EMAIL}</p>
                  </div>
                </a>

                <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />

                <a
                  href={`https://wa.me/${formattedPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact us on WhatsApp"
                  className="flex items-center gap-3 group/item hover:translate-x-1 transition-all duration-300"
                >
                  <div className="w-11 h-11 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all shadow-duo-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-black text-content-primary tracking-[0.08em] mb-0.5 group-hover/item:text-emerald-500 transition-colors">WhatsApp</p>
                    <p className="text-xs font-bold text-content-secondary">{config.CONTACT.PHONE}</p>
                  </div>
                </a>
              </div>

              <div className="px-5 py-3 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[11px] font-black text-content-secondary tracking-[0.08em]">System status</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-[11px] font-black text-emerald-500 tracking-[0.08em]">Stable</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-200 dark:border-slate-800/70 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 text-sm font-black text-content-secondary tracking-[0.04em]">
            <span>&copy; {new Date().getFullYear()} {config.APP_NAME}</span>
            <div className="hidden lg:block h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              <span>Version {config.APP_VERSION}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-black text-content-secondary tracking-[0.04em]">
            Built by
            <a href={config.APP_DEVELOPER_URL} target="_blank" rel="noreferrer" className="text-content-primary hover:text-primary-500 transition-all border-b border-slate-300 dark:border-white/10 hover:border-primary-500/50 pb-0.5">
              {config.APP_AUTHOR}
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm font-black text-content-secondary tracking-[0.04em]">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            Built for students
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UnifiedFooter;


