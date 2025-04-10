import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  typescript: {
    // Ignores TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
