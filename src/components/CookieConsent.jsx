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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 border-t-2 border-yellow-500 shadow-2xl animate-slide-up">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Icon & Message */}
                    <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaCookie className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                We Value Your Privacy
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
                                We also use Google AdSense which may use cookies for ad personalization.
                                By clicking "Accept All", you consent to our use of cookies. {' '}
                                <Link href="/privacy" className="text-orange-700 dark:text-yellow-400 hover:underline font-semibold">
                                    Learn more about our Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={handleDecline}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-red-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
