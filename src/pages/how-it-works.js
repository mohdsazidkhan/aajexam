import HowItWorks from '../components/pages/HowItWorks';
import Head from 'next/head';

const HowItWorksPage = () => {
  return (
    <>
      <Head>
        <title>How It Works - AajExam Reward System</title>
        <meta name="description" content="Learn how AajExam works. Discover how to take quizzes, earn points, compete on leaderboards, level up, and earn Daily, Weekly, and Monthly Rewards for your knowledge." />
        <meta name="keywords" content="how it works, user guide, getting started, quiz platform guide, AajExam tutorial, daily rewards, weekly rewards, monthly rewards" />
        <meta property="og:title" content="How It Works - AajExam Platform" />
        <meta property="og:description" content="Learn how AajExam works and how to get started with quizzes and rewards." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How It Works - AajExam" />
        <meta name="twitter:description" content="Discover how to use AajExam and earn rewards." />
      </Head>
      <HowItWorks />
    </>
  );
};

export default HowItWorksPage;
