/** @type {import('next').NextConfig} */
const nextConfig = {
  // We lint separately; don't fail the Amplify production build on ESLint.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Intentionally do NOT set X-Frame-Options so the Hub can be embedded in GHL.
          // GHL membership/client portal is the V1 access gate.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ];
  }
};
module.exports = nextConfig;
