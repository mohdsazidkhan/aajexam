export { default } from '../../blog/[slug]';
export { getStaticProps } from '../../blog/[slug]';

// Student copies render on demand instead of pre-building every path twice.
export const getStaticPaths = async () => ({ paths: [], fallback: 'blocking' });
