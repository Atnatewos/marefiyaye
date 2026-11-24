/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAREFIYAYE WEB — Next.js Configuration
 * Path: apps/web/next.config.js
 *
 * Purpose:
 *   Configures Next.js for the MAREFIYAYE monorepo:
 *     - Image remote patterns (Unsplash, Cloudinary, dev placeholders)
 *     - Transpile shared workspace package
 *     - React strict mode
 *     - Security headers
 *     - Vercel-friendly output
 * ─────────────────────────────────────────────────────────────────────────────
 */

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@marefiyaye/shared'],

  images: {
    remotePatterns: [
      /* Unsplash — seed listings */
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      /* Cloudinary — user-uploaded receipts and listing photos */
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
        pathname: '/**',
      },
      /* DEV ONLY — placeholder images from seed scripts */
      ...(isDev
        ? [
            {
              protocol: 'https',
              hostname: 'example.com',
              pathname: '/**',
            },
          ]
        : []),
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },

  poweredByHeader: false,
};

module.exports = nextConfig;