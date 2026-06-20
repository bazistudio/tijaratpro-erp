import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: undefined, // IMPORTANT for Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
