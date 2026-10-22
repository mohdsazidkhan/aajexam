export { default } from '../../../practice/[examSlug]/[subjectSlug]';
export { getStaticProps } from '../../../practice/[examSlug]/[subjectSlug]';

// Student copies render on demand instead of pre-building every path twice.
export const getStaticPaths = async () => ({ paths: [], fallback: 'blocking' });
