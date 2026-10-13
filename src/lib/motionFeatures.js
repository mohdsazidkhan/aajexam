// Animation features for <LazyMotion> (see pages/_app.js). Kept in its own module so the bundler emits
// them as a separate chunk that loads after first paint instead of inside every page's JavaScript.
// domMax (not domAnimation) because the app uses layout / layoutId animations.
export { domMax as default } from 'framer-motion';
