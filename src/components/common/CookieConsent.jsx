'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/common/AppLink';
import { FaCookie, FaTimes } from 'react-icons/fa';
import useTranslate from '../../hooks/useTranslate';

const CookieConsent = () => {
  const { translate, rich } = useTranslate();
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Show banner after a short delay for better UX
            setTimeout(() => setShowBanner(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <section className="fixed bottom-0 left-0 right-0 z-[100] p-6 xl:p-8 bg-white/80 dark:bg-slate-900/80 border-t-4 border-border-primary animate-slide-up relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 xl:w-32 h-20 xl:h-32 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-colors"></div>

            <div className="mx-auto flex flex-col xl:flex-row items-center justify-between gap-6 relative z-10">
                {/* Icon & Message */}
                <div className="flex items-center gap-6 text-center xl:text-left">
                    <div className="w-12 h-12 bg-primary-600 rounded-md xl:rounded-md flex items-center justify-center flex-shrink-0 border border-white dark:border-slate-800 rotate-3 group-hover:rotate-6 transition-transform hidden sm:flex">
                        <FaCookie className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm xl:text-md font-bold text-content-primary mb-1 uppercase tracking-tight">
                            {rich('We use <0>cookies</0>', [(c) => <span className="text-primary-600">{c}</span>])}
                        </h3>
                        <p className="text-[10px] xl:text-xs font-bold text-content-secondary uppercase tracking-wide leading-tight">
                            {translate('Cookies help us remember your login and personalise your experience.')}{' '}
                            {translate('See our')} {' '}
                            <Link href="/privacy" className="text-primary-600 hover:underline transition-colors font-bold">
                                {translate('Privacy Policy')}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <button
                        onClick={handleDecline}
                        className="flex-1 xl:flex-none px-4 py-2 text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] hover:text-content-primary dark:hover:text-white transition-colors"
                    >
                        {translate('No')}
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-[2] xl:flex-none px-6 py-3 bg-primary-600 text-on-primary rounded-lg xl:rounded-xl font-bold uppercase tracking-[0.1em] text-[10px] hover:bg-primary-800 transition-all active:translate-y-1 border-b-2 border-primary-600"
                    >
                        {translate('Accept')}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CookieConsent;

