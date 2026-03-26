import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

import LandingPageSkeleton from '../components/LandingPageSkeleton';
import { generateOrganizationSchema, generateWebsiteSchema } from '../utils/schema';
import { getCanonicalUrl } from '../utils/seo';

import Seo from '../components/Seo';
import dbConnect from '../lib/db';
// Import any models if needed for direct DB access, though homepage-content might be complex

const LandingPage = dynamic(() => import('../components/pages/ModernLandingPage'), {
  ssr: false,
  loading: () => <LandingPageSkeleton />
});

export default function Index({ educationalContent, isAuthenticated }) {
  const router = useRouter();
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <Seo
        title="AajExam - Exam Preparation & Reward Platform | Practice Tests & Quizzes"
        description="India's premier government exam preparation platform. Practice tests for SSC, UPSC, Banking, Railway exams. Earn Daily, Weekly, and Monthly Rewards with our 10-level progression system."
      />

      <Head>
        <meta name="keywords" content="government exam preparation, SSC preparation, UPSC practice tests, banking exam quizzes, railway exam preparation, competitive exam practice, online quiz platform, daily rewards, weekly rewards, monthly rewards" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </Head>

      {/* Show landing page for non-authenticated users */}
      {!isAuthenticated && <LandingPage educationalContent={educationalContent} />}
    </>
  );
}

// Server-side authentication and data fetching
export async function getServerSideProps(context) {
  // Check authentication server-side
  const token = context.req.cookies.token || context.req.cookies.authToken;

  // If authenticated, redirect to appropriate dashboard
  if (token) {
    try {
      // Verify token and check if admin
      // Note: You'll need to implement proper token verification
      // For now, we'll check a simple admin cookie or decode JWT
      const isAdminUser = context.req.cookies.isAdmin === 'true';

      return {
        redirect: {
          destination: isAdminUser ? '/admin/dashboard' : '/home',
          permanent: false,
        },
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      // If token is invalid, continue to show landing page
    }
  }

  // Fetch educational content for non-authenticated users
  try {
    await dbConnect();
    // Return null to use default content in component
    return {
      props: {
        educationalContent: null,
        isAuthenticated: false,
      },
    };
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    // Return null to use default content in component
    return {
      props: {
        educationalContent: null,
        isAuthenticated: false,
      },
    };
  }
}
