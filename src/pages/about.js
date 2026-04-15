import AboutUs from '../components/pages/AboutUs';
import Head from 'next/head';
import { generateBreadcrumbSchema, generateOrganizationSchema, renderSchemas } from '../utils/schema';

export default function About() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
  return (
    <>
      <Head>
        <title>About AajExam - India&apos;s Premier Government Exam Preparation Platform</title>
        <meta name="description" content="Learn about AajExam - India's leading platform for SSC, UPSC, Banking, and Railway exam preparation. Thousands of practice tests and comprehensive study materials for government competitive exams." />
        <meta name="keywords" content="about AajExam, government exam preparation, SSC coaching, UPSC practice tests, banking exam preparation, railway exam platform, competitive exam preparation India" />
        <link rel="canonical" href={`${siteUrl}/about`} />
        <meta property="og:title" content="About AajExam - Government Exam Preparation Platform" />
        <meta property="og:description" content="India's premier platform for government exam preparation with thousands of practice tests for SSC, UPSC, Banking, and Railway exams." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AajExam" />
        <meta property="og:url" content={`${siteUrl}/about`} />
        <meta property="og:image" content={`${siteUrl}/logo.png`} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@AajExam" />
        <meta name="twitter:title" content="About AajExam - Government Exam Preparation" />
        <meta name="twitter:description" content="India's leading platform for SSC, UPSC, Banking, and Railway exam preparation with comprehensive practice tests." />
        <meta name="twitter:image" content={`${siteUrl}/logo.png`} />
        <meta name="robots" content="index, follow" />
        {renderSchemas([
          generateOrganizationSchema(),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'About Us' }
          ])
        ])}
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
