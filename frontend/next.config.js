/** @type {import('next').NextConfig} */
// Triggering deployment...
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["placehold.co", "127.0.0.1"],
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
};

module.exports = nextConfig;
