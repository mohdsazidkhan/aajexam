/** @type {import('next').NextConfig} */
const nextConfig = {
  // Page generation timeout
  staticPageGenerationTimeout: 1000,

  generateEtags: true,

  reactStrictMode: true,
  images: {
    unoptimized: false,
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
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
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
