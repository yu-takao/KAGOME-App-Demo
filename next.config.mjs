/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/marks/:path*', destination: '/api/marks/:path*' },
      { source: '/mouts/:path*', destination: '/api/mouts/:path*' },
      { source: '/outputs/:path*', destination: '/api/outputs/:path*' },
      { source: '/webDesign/:path*', destination: '/api/webDesign/:path*' },
      { source: '/pdfs/:path*', destination: '/api/pdfs/:path*' },
    ];
  },
};

export default nextConfig;


