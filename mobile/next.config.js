/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'storage.neon.tech', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
