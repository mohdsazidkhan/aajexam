'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCookie, FaTimes } from 'react-icons/fa';

const CookieConsent = () => {
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
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-6 lg:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t-4 border-slate-100 dark:border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] animate-slide-up relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>

            <div className="mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                {/* Icon & Message */}
                <div className="flex items-center gap-6 text-center lg:text-left">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-duo-primary border-2 border-white dark:border-slate-800 rotate-3 group-hover:rotate-6 transition-transform hidden sm:flex">
                        <FaCookie className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm lg:text-md font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">
                            Current <span className="text-primary-700 dark:text-primary-500">Data Protocol</span>
                        </h3>
                        <p className="text-[10px] lg:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide leading-tight">
                            We use cookies for the best experience.
                            Agreed? {' '}
                            <Link href="/privacy" className="text-primary-700 dark:text-primary-500 hover:underline transition-colors font-black">
                                PRIVACY RULES
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={handleDecline}
                        className="flex-1 lg:flex-none px-4 py-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        No
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-[2] lg:flex-none px-6 py-3 bg-primary-500 text-white rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-duo-primary hover:bg-primary-600 transition-all active:translate-y-1 active:shadow-none border-b-4 border-primary-700"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;

