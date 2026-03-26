import React from 'react';
import Skeleton from './Skeleton';

const HomePageSkeleton = () => {
    return (
        <div className="flex-1 overflow-x-hidden bg-subg-light dark:bg-subg-dark">

                <div className="p-4 md:p-8 space-y-8">
                    {/* Hero Section Skeleton */}
                    <div className="w-full h-64 md:h-96 rounded-3xl bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                        <div className="absolute inset-0 p-8 flex flex-col justify-center items-center">
                            <Skeleton className="w-48 h-8 mb-4 rounded-full" />
                            <Skeleton className="w-3/4 h-12 md:h-16 mb-6" />
                            <Skeleton className="w-1/2 h-6 md:h-8 mb-8" />
                            <div className="flex gap-4">
                                <Skeleton className="w-32 h-12 rounded-xl" />
                                <Skeleton className="w-32 h-12 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Referral/Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-32 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                    <Skeleton className="w-16 h-6" />
                                </div>
                                <Skeleton className="w-24 h-8" />
                            </div>
                        ))}
                    </div>

                    {/* Mobile App Section Skeleton */}
                    <div className="w-full h-80 rounded-3xl bg-gray-100 dark:bg-gray-800 p-8 flex items-center">
                        <div className="flex-1 space-y-4">
                            <Skeleton className="w-40 h-8 rounded-full" />
                            <Skeleton className="w-2/3 h-10" />
                            <Skeleton className="w-1/2 h-4" />
                            <div className="flex gap-4 mt-6">
                                <Skeleton className="w-40 h-14 rounded-xl" />
                            </div>
                        </div>
                        <div className="hidden md:block w-64 h-64">
                            <Skeleton className="w-full h-full rounded-2xl" />
                        </div>
                    </div>

                    {/* Prize Pool Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-8 flex flex-col items-center">
                            <Skeleton className="w-64 h-10 mb-4" />
                            <Skeleton className="w-48 h-16 mb-4" />
                            <Skeleton className="w-3/4 h-4" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-700/50 p-2 flex flex-col items-center justify-center gap-2">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <Skeleton className="w-12 h-6" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Categories/Levels Grid Skeleton */}
                    <div>
                        <Skeleton className="w-48 h-8 mb-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-40 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Skeleton className="w-12 h-12 rounded-xl" />
                                        <div>
                                            <Skeleton className="w-32 h-6 mb-2" />
                                            <Skeleton className="w-20 h-4" />
                                        </div>
                                    </div>
                                    <Skeleton className="w-full h-12 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default HomePageSkeleton;
