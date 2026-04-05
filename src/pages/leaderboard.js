'use client';

import React from 'react';
import Head from 'next/head';
import MobileAppWrapper from '../components/MobileAppWrapper';
import TopPerformers from '../components/TopPerformers';

const LeaderboardPage = () => {
  return (
    <MobileAppWrapper title="Top Performers">
      <Head>
        <title>Top Performers - AajExam</title>
        <meta name="description" content="Check the AajExam top performers to see rankings, compare your position, and compete with other quiz enthusiasts worldwide." />
        <meta name="keywords" content="top performers, leaderboard, rankings, top players, quiz rankings, competitive quiz, high scores" />
        <meta property="og:title" content="Top Performers - AajExam Platform" />
        <meta property="og:description" content="Check the AajExam top performers to see rankings and compare your position with other quiz enthusiasts." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Top Performers - AajExam Platform" />
        <meta name="twitter:description" content="Check the AajExam top performers and compete with other quiz enthusiasts." />
      </Head>
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12 font-outfit relative overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary-500/10 to-transparent blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <TopPerformers />
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default LeaderboardPage;
