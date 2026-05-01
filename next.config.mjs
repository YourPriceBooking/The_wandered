/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s3-alpha-sig.figma.com', 'res.cloudinary.com', 'www.thewandered.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // 🔥 отключает ESLint при next build
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
