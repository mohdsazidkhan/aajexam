import React from 'react';
import dynamic from 'next/dynamic';

import LandingPageSkeleton from '../components/LandingPageSkeleton';
import { generateOrganizationSchema, generateWebsiteSchema } from '../utils/schema';

import Seo from '../components/Seo';
import dbConnect from '../lib/db';

const LandingPage = dynamic(() => import('../components/pages/ModernLandingPage'), {
  ssr: false,
  loading: () => <LandingPageSkeleton />
});

export default function Index({ educationalContent, isAuthenticated }) {
  return (
    <>
      <Seo
        title="AajExam – SSC, UPSC, Banking & Railway Exam Practice Tests + PYQs"
        description="India's all-in-one government exam preparation platform. Free practice tests, previous year question papers (PYQs) and topic-wise quizzes for SSC CHSL, CGL, MTS, GD, UPSC, Banking, Railway, State PSC and more."
        keywords={[
          'government exam preparation',
          'SSC CHSL practice test',
          'SSC CGL mock test',
          'UPSC practice test',
          'banking exam practice',
          'railway exam preparation',
          'previous year question papers',
          'PYQ practice',
          'free mock test',
          'aajexam',
          'competitive exam online practice'
        ]}
        schemas={[generateOrganizationSchema(), generateWebsiteSchema()]}
      />

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
