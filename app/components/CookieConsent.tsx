'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConcent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConcent', 'true');
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookieConcent', 'false');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 animate-fade-in-up">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm md:text-base">
                    <p>
                        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
                        By clicking "Accept All", you consent to our use of cookies.
                        Read our <a href="/privacy" className="underline hover:text-white/80">Privacy Policy</a>.
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={declineCookies}
                        className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-white/30 rounded hover:bg-white/10 transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded hover:bg-gray-100 transition-colors"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
