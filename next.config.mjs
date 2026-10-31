const PUBLIC_CACHED_API_PATHS = [
  '/api/quiz/subjects',
  '/api/quiz/subjects/all',
  '/api/quiz/subjects/index',
  '/api/quiz/subjects/:id/detail',
  '/api/quiz/topics',
  '/api/quiz/topics/index',
  '/api/quiz/topics/:id/detail',
  '/api/quiz/index',
  '/api/quiz/quizzes',
  '/api/real-exams/categories',
  '/api/real-exams/all-exams',
  '/api/real-exams/categories/:id/exams',
  '/api/real-exams/exams/:id/patterns',
  '/api/public/exams',
  '/api/public/exams/:examId/preview',
  '/api/interview-categories',
  '/api/interview-categories/:slug',
  '/api/interview-questions',
  '/api/interview-questions/:slug',
  '/api/locations',
  '/api/notes',
  '/api/notes/:slug',
  '/api/pyq/exams',
  '/api/pyq',
  '/api/flashcards',
  '/api/flashcards/:id',
  '/api/current-affairs',
  '/api/current-affairs/today',
  '/api/current-affairs/monthly',
  '/api/current-affairs/:id((?!today$|monthly$)[^/]+)',
  '/api/exam-news',
  '/api/exam-news/:id((?!calendar$)[^/]+)',
  '/api/exam-news/calendar',
  '/api/real-exams/web/exams/by-slug/:slug/content',
  '/api/real-exams/web/exams/:id/content',
  '/api/quiz/quizzes/:id',
  '/api/daily-dose',
  '/api/public/app-version',
  '/api/public/sitemap',
  '/api/public/blogs/index',
  '/api/public/blogs/featured',
  '/api/public/blogs/:id',
  '/api/reels/trending',
  '/api/discussions/feed',
];

// Public leaderboards: same rules as above (nothing per-caller), but ranks change as people submit,
// so the CDN keeps them for one minute only.
const PUBLIC_SHORT_CACHED_API_PATHS = [
  '/api/real-exams/tests/:id/leaderboard',
  '/api/quiz/quizzes/:id/leaderboard',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_DIST_DIR lets a measurement build run beside `next dev` without clobbering its .next folder.
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Page generation timeout
  staticPageGenerationTimeout: 1000,

  generateEtags: true,

  reactStrictMode: true,

  poweredByHeader: false,

  // Strip console.* (except error/warn) in production to reduce JS payload
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Tree-shake heavy icon/animation libraries so unused exports don't ship.
  // Cuts the "Reduce unused JavaScript" / "Legacy JavaScript" PageSpeed audits.
  experimental: {
    // Compile server bundles and collect build traces in parallel (shorter `next build`).
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'framer-motion',
      '@reduxjs/toolkit',
      'react-redux',
      'react-hot-toast',
      'react-toastify',
    ],
  },

  images: {
    unoptimized: false,
    // WebP only (AVIF doubled the number of billed transformations); optimized images are kept for 30 days.
    formats: ['image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Logged-in student pages now live under /student/*; keep old URLs, bookmarks and
  // emailed links working. (/subscription/payu-* stay where they are — PayU return URLs.)
  async redirects() {
    const studentPages = [
      'dashboard', 'profile', 'settings', 'notifications', 'bookmarks', 'my-questions', 'my-reels', 'my-challenges', 'my-analytics', 'payment-history', 'readiness', 'revision', 'streak', 'study-plan', 'all-india-rank', 'syllabus-tracker', 'exam-calendar', 'exam-history', 'quiz-history', 'referral-history', 'subscription',
    ];
    return [
      // Public profiles live at /@username (rewrite below); the old /u/username URLs redirect there.
      { source: '/u/:username', destination: '/@:username', permanent: true },
      { source: '/u/:username/:path*', destination: '/@:username/:path*', permanent: true },
      { source: '/home', destination: '/student/dashboard', permanent: true },
      ...studentPages.map((name) => ({ source: `/${name}`, destination: `/student/${name}`, permanent: true })),
      { source: '/quiz-result', destination: '/student/quiz-result', permanent: true },
      { source: '/quiz-result/:id', destination: '/student/quiz-result/:id', permanent: true },
    ];
  },

  async headers() {
    // Content Security Policy
    const ContentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      // form-action is intentionally wide-open over HTTPS because PayU's
      // checkout posts through an unpredictable chain of bank gateways,
      // OTP screens, and acquirer URLs after the initial submit. CSP
      // form-action enforcement applies to EVERY hop in that redirect
      // chain, not just the first POST — so locking it down to specific
      // origins reliably breaks live payments. Other directives stay
      // strict; only form posts are relaxed.
      "form-action 'self' https: http:",
      "frame-ancestors 'self' https://secure.payu.in https://test.payu.in https://www.payu.in",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://secure.payu.in https://test.payu.in https://www.payu.in https://www.googletagmanager.com https:",
      "style-src 'self' 'unsafe-inline' https: https://fonts.googleapis.com",
      "img-src 'self' https: data: blob:",
      "font-src 'self' https: data: https://fonts.gstatic.com",
      "connect-src 'self' https://www.googleapis.com https://oauth2.googleapis.com https://accounts.google.com https://secure.payu.in https://test.payu.in https://www.payu.in https: wss:",
      "frame-src 'self' https://secure.payu.in https://test.payu.in https://www.payu.in https://accounts.google.com",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value:
              'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self "https://secure.payu.in" "https://test.payu.in" "https://www.payu.in"), usb=(), fullscreen=(self)',
          },
        ],
      },
      // Public catalogue GETs: the response depends only on the URL (no auth, cookies or headers read),
      // so the CDN can serve it for five minutes and refresh in the background. Bodies are unchanged.
      // Routes that already set their own Cache-Control (quiz/topics/all, public/landing-stats,
      // public/blogs) are left out.
      ...PUBLIC_CACHED_API_PATHS.map((source) => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=86400' }],
      })),
      ...PUBLIC_SHORT_CACHED_API_PATHS.map((source) => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' }],
      })),
      // Logged-in student area: never index (public twins keep the SEO value).
      {
        source: '/student/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      // Cache static assets aggressively for better Core Web Vitals
      {
        source: '/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  // Pretty category URLs: /it-software-interview-questions masks the real
  // /interview-questions/category/[slug] page — the file/route stays put.
  async rewrites() {
    return [
      // /@username masks the real /u/[username] page (and its followers / following sub-pages).
      { source: '/@:username', destination: '/u/:username' },
      { source: '/@:username/:path*', destination: '/u/:username/:path*' },
      {
        source: '/:slug-interview-questions',
        destination: '/interview-questions/category/:slug',
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
