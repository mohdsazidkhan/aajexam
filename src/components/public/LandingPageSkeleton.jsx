import React from 'react';
import Skeleton from '../common/Skeleton';

const LandingPageSkeleton = () => {
    return (
        <div className="min-h-screen  transition-colors duration-300 pt-12 sm:pt-0">
            {/* Navbar Skeleton */}
            <header className="fixed z-[99] w-full bg-background-surface border-b-2 border-border-primary top-0">
                <div className="container mx-auto px-6 xl:px-12">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo Placeholder */}
                        <div className="flex items-center gap-4">
                            <Skeleton width="56px" height="56px" borderRadius="18px" className="" />
                            <Skeleton width="120px" height="24px" borderRadius="10px" className="hidden sm:block" />
                        </div>

                        {/* Nav Links Placeholder */}
                        <div className="hidden xl:flex items-center space-x-10">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} width="90px" height="20px" borderRadius="8px" />
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            <Skeleton width="130px" height="52px" borderRadius="20px" className="" />
                            <Skeleton width="48px" height="48px" borderRadius="50%" className="" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section Skeleton */}
            <div className="container mx-auto px-6 xl:px-12 py-16 xl:py-28 mt-24">
                <div className="text-center max-w-5xl mx-auto">
                    {/* Title */}
                    <div className="flex flex-col items-center mb-8">
                        <Skeleton width="85%" height="4.5rem" className="mb-4 rounded-3xl" />
                        <Skeleton width="65%" height="4.5rem" className="rounded-3xl" />
                    </div>

                    {/* Subtitle */}
                    <div className="flex flex-col items-center mb-12">
                        <Skeleton width="80%" height="1.5rem" className="mb-3 rounded-lg" />
                        <Skeleton width="60%" height="1.5rem" className="rounded-lg" />
                    </div>

                    {/* Button */}
                    <div className="flex justify-center mb-20">
                        <Skeleton width="280px" height="72px" borderRadius="24px" className="" />
                    </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="mt-16 bg-background-surface rounded-3xl p-10 border border-border-primary">
                    <div className="grid grid-cols-2 xl:grid-cols-4 xl:grid-cols-6 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-4">
                                <Skeleton width="64px" height="64px" borderRadius="20px" className="" />
                                <div className="space-y-2 flex flex-col items-center">
                                    <Skeleton width="80px" height="20px" borderRadius="8px" />
                                    <Skeleton width="60px" height="10px" borderRadius="4px" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Section Skeleton */}
            <div className="container mx-auto px-6 pb-24">
                <div className="bg-background-surface border border-border-primary rounded-3xl p-10 xl:p-20 relative overflow-hidden">
                    <div className="flex flex-col items-center mb-16 relative z-10">
                        <Skeleton width="100px" height="100px" borderRadius="2rem" className="mb-8 rotate-3" />
                        <Skeleton width="70%" height="4rem" borderRadius="24px" className="mb-6" />
                        <Skeleton width="45%" height="1.5rem" borderRadius="12px" />
                    </div>

                    {/* Reward Cards */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 relative z-10">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 rounded-3xl bg-background-surface border border-border-primary p-8">
                                <Skeleton width="50%" height="2rem" className="mb-6 rounded-lg xl:rounded-xl" />
                                <Skeleton width="100%" height="1rem" className="mb-4 rounded-lg" />
                                <Skeleton width="80%" height="1rem" className="mb-8 rounded-lg" />
                                <Skeleton width="40%" height="3rem" className="rounded-2xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPageSkeleton;

