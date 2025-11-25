/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API でローカルファイルを読むため、サーバーレス出力に data/* を含める
  experimental: {
    outputFileTracingIncludes: {
      // すべての API ルートで data と server_pdfs を同梱
      '/api/(.*)': ['data/**/*', 'server_pdfs/**/*'],
    },
  },
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


