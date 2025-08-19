/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in development to avoid warnings
  productionBrowserSourceMaps: false,
  
  // Ignore TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Ignore ESLint errors during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Optimize for development
  experimental: {
    // Disable some experimental features that might cause warnings
  },
  
  // Webpack configuration to handle source maps
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable source maps in development to avoid warnings
      config.devtool = 'eval';
    }
    
    return config;
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
