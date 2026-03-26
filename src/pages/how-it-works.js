import HowItWorks from '../components/pages/HowItWorks';
import Head from 'next/head';

const HowItWorksPage = () => {
  return (
    <>
      <Head>
        <title>How It Works - SUBG QUIZ Reward System</title>
        <meta name="description" content="Learn how SUBG QUIZ works. Discover how to take quizzes, earn points, compete on leaderboards, level up, and earn Daily, Weekly, and Monthly Rewards for your knowledge." />
        <meta name="keywords" content="how it works, user guide, getting started, quiz platform guide, SUBG QUIZ tutorial, daily rewards, weekly rewards, monthly rewards" />
        <meta property="og:title" content="How It Works - SUBG QUIZ Platform" />
        <meta property="og:description" content="Learn how SUBG QUIZ works and how to get started with quizzes and rewards." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How It Works - SUBG QUIZ" />
        <meta name="twitter:description" content="Discover how to use SUBG QUIZ and earn rewards." />
      </Head>
      <HowItWorks />
    </>
  );
};

export default HowItWorksPage;