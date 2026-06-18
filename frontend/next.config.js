/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['p16-sign-va.tiktokcdn.com', 'p19-sign-va.tiktokcdn.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // ✅ API correta
      },
    ];
  },
};

module.exports = nextConfig;