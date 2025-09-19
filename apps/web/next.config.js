/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@matrus/ui', '@matrus/common-types'],
  images: {
    domains: ['localhost'],
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:4000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',
  },
};

module.exports = nextConfig;