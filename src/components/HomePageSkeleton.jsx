import React from 'react';
import Skeleton from './Skeleton';

const HomePageSkeleton = () => {
    return (
        <div className="space-y-5 lg:space-y-12 pt-0 lg:pt-6 font-outfit animate-pulse">
            
            {/* --- Dashboard Header Skeleton --- */}
            <div className="mx-2 lg:mx-4 bg-white dark:bg-slate-800 p-6 lg:p-12 rounded-[1.5rem] lg:rounded-[4rem] border-b-4 lg:border-b-8 border-slate-100 dark:border-slate-700 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 h-auto lg:h-80">
                <div className="space-y-4 lg:space-y-6 flex-1 w-full lg:w-auto flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="flex gap-4">
                         <Skeleton width="140px" height="32px" borderRadius="9999px" />
                         <Skeleton width="180px" height="32px" borderRadius="9999px" className="hidden lg:block" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton width="240px" height="48px" borderRadius="1rem" />
                        <Skeleton width="300px" height="24px" borderRadius="0.5rem" />
                    </div>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                        <Skeleton width="140px" height="36px" borderRadius="0.75rem" />
                        <Skeleton width="140px" height="36px" borderRadius="0.75rem" />
                        <Skeleton width="140px" height="36px" borderRadius="0.75rem" />
                    </div>
                </div>
                <div className="relative">
                    <Skeleton width="120px" height="120px" borderRadius="3rem" className="lg:w-40 lg:h-40" />
                    <div className="absolute -bottom-2 -right-2">
                        <Skeleton width="48px" height="48px" borderRadius="1rem" />
                    </div>
                </div>
            </div>

            {/* --- Progress Section Skeleton --- */}
            <div className="flex flex-col gap-8 px-2 lg:px-4">
                {/* Readiness Dashboard */}
                <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] lg:rounded-[4rem] p-6 lg:p-12 shadow-xl border-none space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <Skeleton width="160px" height="32px" borderRadius="9999px" />
                            <Skeleton width="80%" height="48px" borderRadius="1rem" />
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton width="100px" height="12px" />
                                    <Skeleton width="40px" height="24px" />
                                </div>
                                <Skeleton width="100%" height="24px" borderRadius="9999px" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton height="140px" borderRadius="2rem" />
                            <Skeleton height="140px" borderRadius="2rem" />
                        </div>
                    </div>
                    
                    {/* Performance Status Tabs */}
                    <div className="pt-10 border-t-2 border-slate-50 dark:border-slate-800/50 space-y-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-3">
                                <Skeleton width="48px" height="48px" borderRadius="0.75rem" />
                                <Skeleton width="220px" height="32px" borderRadius="0.5rem" />
                            </div>
                            <div className="flex gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl">
                                <Skeleton width="80px" height="40px" borderRadius="0.75rem" />
                                <Skeleton width="80px" height="40px" borderRadius="0.75rem" />
                                <Skeleton width="80px" height="40px" borderRadius="0.75rem" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 lg:gap-8">
                            <Skeleton height="160px" borderRadius="2.5rem" />
                            <Skeleton height="160px" borderRadius="2.5rem" />
                            <Skeleton height="160px" borderRadius="2.5rem" />
                        </div>
                    </div>
                </div>

                {/* Vertical Stats Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                    <Skeleton height="200px" borderRadius="2.5rem" />
                    <Skeleton height="200px" borderRadius="2.5rem" />
                    <Skeleton height="200px" borderRadius="2.5rem" />
                </div>
            </div>

            {/* --- Main Action Button Skeleton --- */}
            <div className="px-2 lg:px-4">
                <Skeleton height="80px" borderRadius="3rem" className="lg:h-24 lg:rounded-[4rem]" />
            </div>

            {/* --- Quick Actions Skeleton --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 px-2 lg:px-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex flex-col items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 lg:p-10 rounded-[1.5rem] lg:rounded-[3.5rem] h-full">
                        <Skeleton width="48px" height="48px" borderRadius="1rem" className="lg:w-20 lg:h-20" />
                        <div className="space-y-2 flex flex-col items-center">
                            <Skeleton width="80px" height="12px" borderRadius="0.5rem" />
                            <Skeleton width="40px" height="4px" borderRadius="9999px" />
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Study Articles Skeleton --- */}
            <div className="space-y-8 px-2 lg:px-4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b-4 border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4 text-center lg:text-left">
                        <Skeleton width="120px" height="24px" borderRadius="9999px" />
                        <Skeleton width="280px" height="48px" borderRadius="0.75rem" />
                        <Skeleton width="80%" height="20px" borderRadius="0.5rem" />
                    </div>
                    <Skeleton width="150px" height="40px" borderRadius="9999px" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] lg:rounded-[4rem] overflow-hidden border-2 border-slate-100 dark:border-slate-700 shadow-xl h-[450px]">
                            <Skeleton width="100%" height="240px" borderRadius="0" />
                            <div className="p-8 space-y-6">
                                <Skeleton width="90%" height="32px" borderRadius="0.5rem" />
                                <div className="pt-6 border-t-2 border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                    <Skeleton width="120px" height="16px" />
                                    <Skeleton width="40px" height="40px" borderRadius="0.75rem" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Monthly Showcase Skeleton --- */}
            <div className="px-0 py-2 lg:py-4">
                <div className="mx-2 lg:mx-4 bg-primary-500/20 dark:bg-primary-900/20 p-8 lg:p-20 rounded-[2rem] lg:rounded-[5rem] flex flex-col lg:flex-row items-center gap-8 lg:gap-16 border-none shadow-xl">
                    <Skeleton width="64px" height="64px" borderRadius="2rem" className="lg:w-40 lg:h-40" />
                    <div className="flex-1 space-y-4 text-center lg:text-left">
                        <Skeleton width="140px" height="24px" borderRadius="9999px" />
                        <Skeleton width="300px" height="48px" borderRadius="1rem" />
                        <Skeleton width="250px" height="24px" borderRadius="0.5rem" />
                    </div>
                    <Skeleton width="180px" height="64px" borderRadius="2rem" />
                </div>
            </div>
        </div>
    );
};

export default HomePageSkeleton;
