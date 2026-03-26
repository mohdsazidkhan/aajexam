'use client';

import React from 'react';
import Head from 'next/head';
import TopPerformers from '../components/TopPerformers';
import UnifiedFooter from '../components/UnifiedFooter';

const LeaderboardPage = () => {
  return (
    <>
      <Head>
        <title>Top Performers - SUBG QUIZ</title>
        <meta name="description" content="Check the SUBG QUIZ top performers to see rankings, compare your position, and compete with other quiz enthusiasts worldwide." />
        <meta name="keywords" content="top performers, leaderboard, rankings, top players, quiz rankings, competitive quiz, high scores" />
        <meta property="og:title" content="Top Performers - SUBG QUIZ Platform" />
        <meta property="og:description" content="Check the SUBG QUIZ top performers to see rankings and compare your position with other quiz enthusiasts." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Top Performers - SUBG QUIZ Platform" />
        <meta name="twitter:description" content="Check the SUBG QUIZ top performers and compete with other quiz enthusiasts." />
      </Head>
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="container mx-auto px-4">
            <TopPerformers />
          </div>
        </div>
        <UnifiedFooter />
      </>
    </>
  );
};

export default LeaderboardPage;
