import React from 'react';

import { generateOrganizationSchema, generateWebsiteSchema } from '../utils/schema';

import Seo from '../components/common/Seo';

import LandingPage from '../components/public/pages/ModernLandingPage';

export default function Index({ educationalContent, isAuthenticated }) {
  return (
    <>
      <Seo
        title="AajExam – SSC, UPSC, Banking & Railway Exam Practice Tests + PYQs"
        description="India's best free government exam prep: practice tests, previous year papers (PYQs) and topic-wise quizzes for SSC, UPSC, Banking, Railway and State PSC."
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
      {!isAuthenticated && <LandingPage />}
    </>
  );
}

// The landing page is the same for every visitor, so it is generated once and served from the CDN (it used to run a
// function and open a DB connection on every hit just to return these constants). Signed-in users are sent to their
// dashboard by the landing page itself on the client (the app keeps its token in localStorage, not in a cookie).
export async function getStaticProps() {
  return {
    props: {
      educationalContent: null,
      isAuthenticated: false,
    },
    revalidate: 86400,
  };
}
