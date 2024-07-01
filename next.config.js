/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['fal.media', 'storage.cloud.google.com','storage.googleapis.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "*.replicate.delivery",
      },
    ],
  },
  node: {
    net: 'empty',
    tls: 'empty',
    fs: 'empty',
  },
};

module.exports = nextConfig;