import React from 'react';
import Skeleton from './Skeleton';

const LandingPageSkeleton = () => {
    return (
        <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark transition-colors duration-300 pt-12 sm:pt-0">
            {/* Navbar Skeleton */}
            <header className="fixed z-[99] w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 top-0">
                <div className="container mx-auto px-0 lg:px-6 xl:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo Placeholder */}
                        <Skeleton width="48px" height="48px" borderRadius="12px" />

                        {/* Nav Links Placeholder - Hidden on mobile, visible on desktop */}
                        <div className="hidden lg:flex items-center space-x-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={i} width="80px" height="20px" />
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-2">
                            <Skeleton width="100px" height="40px" borderRadius="0.5rem" />
                            <Skeleton width="32px" height="32px" borderRadius="50%" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section Skeleton */}
            <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-20 mt-16 md:mt-24">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Title */}
                    <div className="flex flex-col items-center mb-6">
                        <Skeleton width="80%" height="3rem" className="mb-2 hidden md:block" />
                        <Skeleton width="60%" height="3rem" className="hidden md:block" />
                        <Skeleton width="90%" height="2rem" className="md:hidden mb-2" />
                    </div>

                    {/* Subtitle */}
                    <div className="flex flex-col items-center mb-8">
                        <Skeleton width="90%" height="1.2rem" className="mb-2" />
                        <Skeleton width="70%" height="1.2rem" />
                    </div>

                    {/* Button */}
                    <div className="flex justify-center mb-10">
                        <Skeleton width="200px" height="56px" borderRadius="0.75rem" />
                    </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="mt-10 lg:mt-20 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 lg:gap-6 p-4">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center p-2">
                            <Skeleton width="48px" height="48px" borderRadius="50%" className="mb-3" />
                            <Skeleton width="60px" height="24px" className="mb-1" />
                            <Skeleton width="80px" height="12px" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Referral Section Skeleton Placeholder */}
            <div className="container mx-auto px-4 py-10 lg:py-20">
                <div className="border border-gray-200 dark:border-gray-700 rounded-3xl p-6 lg:p-12">
                    <div className="flex flex-col items-center mb-10">
                        <Skeleton width="80px" height="80px" borderRadius="50%" className="mb-6" />
                        <Skeleton width="60%" height="2.5rem" className="mb-4" />
                        <Skeleton width="40%" height="1.5rem" />
                    </div>

                    {/* Reward Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} width="100%" height="160px" borderRadius="1rem" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPageSkeleton;
