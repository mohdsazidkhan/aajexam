import AboutUs from '../components/pages/AboutUs';
import Head from 'next/head';

export default function About() {
  return (
    <>
      <Head>
        <title>About SUBG QUIZ - India's Premier Government Exam Preparation Platform</title>
        <meta name="description" content="Learn about SUBG QUIZ - India's leading platform for SSC, UPSC, Banking, and Railway exam preparation. 2000+ quizzes, 10-level progression system, and comprehensive study materials for government competitive exams." />
        <meta name="keywords" content="about SUBG QUIZ, government exam preparation, SSC coaching, UPSC practice tests, banking exam preparation, railway exam platform, competitive exam preparation India" />
        <meta property="og:title" content="About SUBG QUIZ - Government Exam Preparation Platform" />
        <meta property="og:description" content="India's premier platform for government exam preparation with 2000+ practice quizzes for SSC, UPSC, Banking, and Railway exams." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://subgquiz.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About SUBG QUIZ - Government Exam Preparation" />
        <meta name="twitter:description" content="India's leading platform for SSC, UPSC, Banking, and Railway exam preparation with comprehensive practice tests." />
        <meta name="twitter:image" content="https://subgquiz.com/logo.png" />
        <meta name="robots" content="index, follow" />
      </Head>
      <AboutUs />
    </>
  );
}

// Enable static generation for better SEO and performance
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 86400 // Revalidate once per day
  };
}
