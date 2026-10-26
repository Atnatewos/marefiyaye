/**
 * @file apps/web/next.config.js
 *
 * Next.js configuration.
 *
 * Why this file exists:
 *   - remotePatterns whitelists the image domains we load from
 *     (Cloudinary for user uploads, Unsplash for seed data).
 *   - Without this, next/image blocks the domains and images fail to load.
 *   - transpilePackages lets Next.js compile our workspace packages that
 *     ship raw ESM instead of pre-built CommonJS.
 *   - The security headers below mirror the Express helmet() config so
 *     static pages get the same protections as API responses.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Workspace packages ship raw ESM — Next.js must transpile them.
  transpilePackages: [
    '@marefiyaye/config',
    '@marefiyaye/i18n',
    '@marefiyaye/shared',
  ],

  images: {
    // Allowed remote image sources. Anything not listed here is blocked
    // by the next/image component to prevent SSRF and unauthorized use.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
    ],
    // Modern formats first, fall back to WebP then JPEG.
    formats: ['image/avif', 'image/webp'],
    // 3G-friendly default sizes.
    deviceSizes: [320, 480, 640, 768, 1024, 1280, 1600, 1920],
  },

  // Security headers on every response. These mirror what the Express
  // helmet() middleware sets, so static pages and API responses are
  // protected identically.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;