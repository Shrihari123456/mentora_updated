// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  // Turbopack compatible configuration
  experimental: {
    // Keep this empty or only use Turbopack-compatible options
  },
  // Webpack configuration (will be ignored by Turbopack)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        stream: false,
        zlib: false,
      };
    }
    return config;
  },
  transpilePackages: ['pdfjs-dist'],
};

export default nextConfig;