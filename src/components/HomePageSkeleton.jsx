import React from 'react';
import Skeleton from './Skeleton';

const HomePageSkeleton = () => {
    return (
        <div className="flex-1 overflow-x-hidden bg-white dark:bg-slate-950">

            <div className="p-4 lg:p-10 space-y-12">
                {/* Hero Section Skeleton */}
                <div className="w-full h-80 lg:h-[450px] rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border-4 border-b-[12px] border-slate-100 dark:border-slate-800 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
                        <Skeleton className="w-40 h-8 mb-6 rounded-full opacity-40" />
                        <Skeleton className="w-3/4 h-16 lg:h-24 mb-8 rounded-3xl" />
                        <Skeleton className="w-1/2 h-6 lg:h-10 mb-12 rounded-xl" />
                        <div className="flex gap-6">
                            <Skeleton className="w-40 h-16 rounded-[2rem] shadow-duo" />
                            <Skeleton className="w-40 h-16 rounded-[2rem] shadow-duo" />
                        </div>
                    </div>
                </div>

                {/* Referral/Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-4 lg:p-8 rounded-[2.5rem] shadow-xl border-2 border-b-8 border-slate-100 dark:border-slate-700 h-48 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Skeleton className="w-14 h-14 rounded-2xl" />
                                <Skeleton className="w-20 h-7 rounded-full" />
                            </div>
                            <Skeleton className="w-32 h-10 rounded-xl" />
                        </div>
                    ))}
                </div>

                {/* Mobile App Section Skeleton */}
                <div className="w-full h-[400px] rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 p-12 border-4 border-b-[12px] border-slate-100 dark:border-slate-800 flex items-center relative overflow-hidden shadow-xl">
                    <div className="flex-1 space-y-6 relative z-10">
                        <Skeleton className="w-48 h-8 rounded-full opacity-40" />
                        <Skeleton className="w-3/4 h-14 rounded-2xl" />
                        <Skeleton className="w-1/2 h-5 rounded-lg" />
                        <div className="flex gap-6 mt-10">
                            <Skeleton className="w-56 h-16 rounded-[2rem] shadow-duo" />
                        </div>
                    </div>
                    <div className="hidden lg:block w-80 h-96 absolute right-12 -bottom-10">
                        <Skeleton className="w-full h-full rounded-[3rem] shadow-2xl rotate-3" />
                    </div>
                </div>

                {/* Prize Pool Skeleton */}
                <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 border-4 border-b-[12px] border-slate-100 dark:border-slate-700 shadow-2xl">
                    <div className="text-center mb-12 flex flex-col items-center">
                        <Skeleton className="w-72 h-10 mb-6 rounded-full opacity-40" />
                        <Skeleton className="w-64 h-20 mb-6 rounded-3xl" />
                        <Skeleton className="w-3/4 h-5 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <div key={i} className="h-32 rounded-[2rem] bg-slate-50 dark:bg-slate-900 p-4 flex flex-col items-center justify-center gap-4 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <Skeleton className="w-20 h-6 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories/Levels Grid Skeleton */}
                <div className="pb-12">
                    <Skeleton className="w-64 h-10 mb-10 rounded-full opacity-40" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-56 bg-white dark:bg-slate-800 rounded-[3rem] border-4 border-b-[12px] border-slate-100 dark:border-slate-700 p-8 shadow-2xl">
                                <div className="flex items-center gap-6 mb-8">
                                    <Skeleton className="w-16 h-16 rounded-2xl shadow-duo" />
                                    <div className="space-y-3">
                                        <Skeleton className="w-40 h-8 rounded-full" />
                                        <Skeleton className="w-28 h-5 rounded-full" />
                                    </div>
                                </div>
                                <Skeleton className="w-full h-16 rounded-2xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageSkeleton;

