export { default } from '../../../../practice/[examSlug]/[subjectSlug]/[topicSlug]';
export { getStaticProps } from '../../../../practice/[examSlug]/[subjectSlug]/[topicSlug]';

// Student copies render on demand instead of pre-building every path twice.
export const getStaticPaths = async () => ({ paths: [], fallback: 'blocking' });
