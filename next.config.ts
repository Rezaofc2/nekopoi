import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'nekopoi.care' },
      { protocol: 'https', hostname: '**.nekopoi.care' },
    ],
  },
};

export default nextConfig;
