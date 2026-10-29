/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Retired tool URLs now have equivalent sections on the dashboard.
      ...['live-flights-map', 'travel-news-trends', 'global-weather', 'explore-world-map'].map((tool) => ({
        source: `/travel-resources/${tool}`,
        destination: `https://www.thewandered.com/travel-resources#${tool}`,
        permanent: true,
      })),
      {
        source: '/en/support',
        destination: 'https://www.yourpricebooking.com/en/support',
        permanent: true,
      },
      {
        source: '/terms-conditions-users',
        destination: 'https://www.yourpricebooking.com/en/terms-conditions-users',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'thewandered\\.com' }],
        destination: 'https://www.thewandered.com/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    domains: ['s3-alpha-sig.figma.com', 'res.cloudinary.com', 'www.thewandered.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // 🔥 отключает ESLint при next build
  },
  swcMinify: true,
  experimental: {
    workerThreads: false,
    cpus: 1, // 👈 ограничиваем потоки
  },
  // webpack: (config, { isServer }) => {
  //   // Fix for 'Can't resolve net' error
  //   if (!isServer) {
  //     config.resolve.fallback.fs = false;
  //     config.resolve.fallback.tls = false;
  //     config.resolve.fallback.net = false;
  //     config.resolve.fallback.child_process = false;
  //   }
  //   return config;
  // },
  webpack: (config, { isServer }) => {
    // Fix for 'Can't resolve net' error
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        tls: false,
        net: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
