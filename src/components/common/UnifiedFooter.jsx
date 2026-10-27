'use client';

import React from 'react';
import Link from '@/components/common/AppLink';
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
import { m as motion } from 'framer-motion';

import config from '../../lib/config/appConfig';
import { FaEnvelope, FaPinterest } from 'react-icons/fa';
import { isAdmin } from '../../lib/utils/adminUtils';
import useTranslate from '../../hooks/useTranslate';

const UnifiedFooter = ({ isLandingPage: _isLandingPage = false }) => {
  const { translate } = useTranslate();
  const isUserAdmin = isAdmin();
  const legalLinks = config.LEGAL;

  if (isUserAdmin) return null;

  const operationalLinks = [
    { name: 'Home', href: '/', icon: Compass },
    { name: 'About Us', href: '/about', icon: Layers },
    { name: 'How It Works', href: '/how-it-works', icon: Info },
    { name: 'Contact Us', href: legalLinks.CONTACT, icon: MessageSquare },
  ];

  const legalLinksMap = [
    { name: 'Privacy Policy', path: legalLinks.PRIVACY_POLICY, icon: ShieldCheck },
    { name: 'Terms of Service', path: legalLinks.TERMS, icon: Scale },
    { name: 'Refund Policy', path: legalLinks.REFUND_POLICY, icon: FileText },
    { name: 'Disclaimer', path: legalLinks.DISCLAIMER, icon: Info },
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#' },
    { name: 'Facebook', icon: Facebook, url: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#' },
    { name: 'X', icon: Twitter, url: process.env.NEXT_PUBLIC_X_URL || '#' },
    { name: 'YouTube', icon: Youtube, url: process.env.NEXT_PUBLIC_YOUTUBE_URL || '#' },
    { name: 'LinkedIn', icon: Linkedin, url: process.env.NEXT_PUBLIC_LINKEDIN_URL || '#' },
    { name: 'WhatsApp', icon: MessageSquare, url: process.env.NEXT_PUBLIC_WHATSAPP_URL || '#' },
    { name: 'Discord', icon: MessageSquare, url: process.env.NEXT_PUBLIC_DISCORD_URL || '#' },
    { name: 'Telegram', icon: Send, url: process.env.NEXT_PUBLIC_TELEGRAM_URL || '#' },
    { name: 'Pinterest', icon: FaPinterest, url: process.env.NEXT_PUBLIC_PINTEREST_URL || '#' },
  ];

  const formattedPhone = config.CONTACT.PHONE.replace(/\D/g, '');

  return (
    <footer className="relative pt-4 xl:pt-8 pb-4 xl:pb-8 overflow-hidden bg-background-page border-t border-border-primary font-outfit">

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-8 mb-4 xl:mb-8">
          <section className="xl:col-span-1 space-y-8">
            <section className="space-y-2 xl:space-y-4">
              <h2 className="text-xl md:text-2xl xl:text-4xl font-black font-outfit uppercase tracking-tighter text-content-primary">
                AAJ<span className="text-primary-600">{translate('EXAM')}</span>
              </h2>
              <div className="h-1 w-12 bg-primary-600 rounded-full" />
            </section>

            <p className="text-sm font-bold text-content-secondary leading-relaxed max-w-xs">
              {translate('Practice smarter, prepare with confidence, and track your progress in one place.')}
            </p>

            <nav className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={translate('Follow us on {name}', { name: social.name })}
                  className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl border border-border-primary text-content-secondary hover:text-primary-600 hover:border-primary-600 flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </nav>
          </section>

          <nav aria-label={translate('Explore')} className="space-y-8">
            <h3 className="text-xs font-bold text-primary-600 uppercase tracking-[0.08em] flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              {translate('Explore')}
            </h3>
            <ul className="grid grid-cols-1 gap-4">
              {operationalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center gap-4 text-sm font-bold text-content-secondary hover:text-content-primary transition-colors">
                    <div className="w-10 h-10 rounded-xl border border-border-primary flex items-center justify-center group-hover:text-primary-600 group-hover:border-primary-600 transition-colors">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span>{translate(link.name)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={translate('Legal')} className="space-y-8">
            <h3 className="text-xs font-bold text-primary-600 uppercase tracking-[0.08em] flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              {translate('Legal')}
            </h3>
            <ul className="grid grid-cols-1 gap-4">
              {legalLinksMap.map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="group flex items-center gap-4 text-sm font-bold text-content-secondary hover:text-content-primary transition-colors">
                    <div className="w-10 h-10 rounded-xl border border-border-primary flex items-center justify-center group-hover:text-primary-600 group-hover:border-primary-600 transition-colors">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span>{translate(link.name)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section className="space-y-8">
            <h3 className="text-xs font-bold text-content-primary uppercase tracking-[0.08em] flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600"/>
              {translate('Support')}
            </h3>
            <div className="space-y-5 max-w-xs xl:max-w-none mx-auto sm:mx-0">
              <address className="space-y-5 not-italic">
                <a
                  href={`mailto:${config.CONTACT.EMAIL}`}
                  aria-label={translate('Send us an email')}
                  className="flex items-center gap-3 group/item"
                >
                  <div className="w-11 h-11 border border-border-primary text-content-primary rounded-xl flex items-center justify-center group-hover/item:border-primary-600 group-hover/item:text-primary-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-content-primary mb-0.5">{translate('Email support')}</p>
                    <p className="text-xs font-bold text-content-secondary break-all line-clamp-1">{config.CONTACT.EMAIL}</p>
                  </div>
                </a>

                <div className="h-px bg-border-primary w-full" />

                <a
                  href={`https://wa.me/${formattedPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={translate('Contact us on WhatsApp')}
                  className="flex items-center gap-3 group/item"
                >
                  <div className="w-11 h-11 border border-border-primary text-primary-600 rounded-xl flex items-center justify-center group-hover/item:border-primary-600 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-content-primary mb-0.5 group-hover/item:text-primary-600 transition-colors">{translate('WhatsApp')}</p>
                    <p className="text-xs font-bold text-content-secondary">{config.CONTACT.PHONE}</p>
                  </div>
                </a>
              </address>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                  <span className="text-[11px] font-black text-content-secondary tracking-[0.08em]">{translate('System status')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-black dark:text-white" />
                  <span className="text-[11px] font-black text-primary-600 tracking-[0.08em]">{translate('Stable')}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="pt-10 border-t border-slate-200 dark:border-slate-800/70 flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-6 text-sm font-black text-content-secondary tracking-[0.04em]">
            <span>&copy; {new Date().getFullYear()} {config.APP_NAME}</span>
            <div className="hidden xl:block h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              <span>{translate('Version {version}', { version: config.APP_VERSION })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-black text-content-secondary tracking-[0.04em]">
            {translate('Built by')}
            <a href={config.APP_DEVELOPER_URL} target="_blank" rel="noreferrer" className="text-content-primary hover:text-primary-600 transition-all border-b border-slate-300 dark:border-white/10 hover:border-primary-500/50 pb-0.5">
              {config.APP_AUTHOR}
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm font-black text-content-secondary tracking-[0.04em]">
            <Heart className="w-3.5 h-3.5 text-black dark:text-white fill-black/20 dark:fill-white/20" />
            {translate('Built for students')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UnifiedFooter;


