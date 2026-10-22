import React from 'react';
import NextLink from 'next/link';
import { toStudentUrl, useIsLoggedInStudent } from '../../lib/utils/appRoutes';

// Drop-in replacement for next/link: logged-in students get /student/... urls for
// pages that also exist publicly; everyone else keeps the public url.
const AppLink = React.forwardRef(function AppLink({ href, as, ...props }, ref) {
  const isStudent = useIsLoggedInStudent();
  return (
    <NextLink
      ref={ref}
      href={isStudent ? toStudentUrl(href) : href}
      as={isStudent && typeof as === 'string' ? toStudentUrl(as) : as}
      {...props}
    />
  );
});

export default AppLink;
