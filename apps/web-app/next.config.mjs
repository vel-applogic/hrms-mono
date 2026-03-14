/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/ui'],
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.APP_ENV,
    BASE_URL: process.env.NEXTAUTH_URL_WEB_APP,
    AUTH_URL: process.env.NEXTAUTH_URL_WEB_APP,
    AUTH_SECRET: process.env.NEXTAUTH_SECRET_WEB_APP,
    // Use 127.0.0.1 instead of localhost to avoid IPv6 resolution issues (ECONNREFUSED)
    NEXT_PUBLIC_API_URL_ADMIN: process.env.BACKEND_API_URL?.replace('localhost', '127.0.0.1') ?? process.env.BACKEND_API_URL,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/user',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
