/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/resource/:path*',
        destination: '/api/resource/:path*',
      },
    ]
  },
}

module.exports = nextConfig
